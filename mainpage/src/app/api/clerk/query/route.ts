import { db } from "@/lib/db/client";
import { cases, companies, entityMetricsSnapshots, dataAccessLogs, auditLogs } from "@/lib/db/schema";
import { eq, ne, and, or, gt, gte, lt, lte, inArray, like, count, sum, asc, desc, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";
import { callOpenRouter, callOpenRouterStream, getClerkModel } from "@/lib/ai/openrouter";
import { validateDomainScope } from "@/lib/ai/guard";
import { auth } from "@/lib/auth/auth";
import {
  CLERK_QUERY_PLANNER_SYSTEM,
  CLERK_RESPONSE_SYSTEM,
  CLERK_RESPONSE_CONCISE,
} from "@/lib/ai/prompts";

type Filter = {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value: unknown;
};

function escapeLikeValue(value: string): string {
  return value.replace(/%/g, "\\%").replace(/_/g, "\\_");
}

type QueryPlan = {
  rejected?: boolean;
  rejectionReason?: string | null;
  source?: "cases" | "metrics";
  aggregation: "count" | "sum" | "list" | "group_by" | "metrics";
  aggregationField?: string | null;
  filters: Filter[];
  groupBy?: string | null;
  orderBy?: { field: string; direction: "asc" | "desc" } | null;
  limit?: number | null;
  summary: string;
};

type QueryResult = {
  rows: Record<string, unknown>[];
  summary: Record<string, unknown> & {
    totalFetched?: number;
    displayLimit?: number;
  };
};

type ContactKeywords = "contact" | "alias" | "email" | "contact alias" | "aliased";

const CONTACT_KEYWORDS: ContactKeywords[] = ["contact", "alias", "email", "contact alias", "aliased"];

function mentionsContact(message: string): boolean {
  return CONTACT_KEYWORDS.some(k => message.toLowerCase().includes(k));
}

function getFieldMap(isPrivileged: boolean, userRole?: string): Record<string, string> {
  const map: Record<string, string> = {
    company_name: "companies.name",
    company: "companies.name",
    companyName: "companies.name",
    company_id: "companies.id",
    companyId: "companies.id",
    vertical: "cases.vertical",
    country: "cases.country",
    ageRange: "cases.ageRange",
    age_range: "cases.ageRange",
    sex: "cases.sex",
    project: "cases.project",
    dateRange: "cases.dateRange",
    date_range: "cases.dateRange",
    caseType: "cases.caseType",
    case_type: "cases.caseType",
    amountOwed: "cases.amountOwed",
    amount_owed: "cases.amountOwed",
    currency: "cases.currency",
    resolutionStatus: "cases.resolutionStatus",
    resolution_status: "cases.resolutionStatus",
    status: "cases.status",
    created_at: "cases.createdAt",
    createdAt: "cases.createdAt",
    viewsTotal: "metrics.viewsTotal",
    views_total: "metrics.viewsTotal",
    views_24h: "metrics.views24h",
    views7d: "metrics.views7d",
    visitorsTotal: "metrics.visitorsTotal",
    visitors_total: "metrics.visitorsTotal",
    sharesTotal: "metrics.sharesTotal",
    shares_total: "metrics.sharesTotal",
    entityType: "metrics.entityType",
    entity_type: "metrics.entityType",
  };

  if (isPrivileged) {
    map.contactAlias = "cases.contactAlias";
    map.contact_alias = "cases.contactAlias";
  }

  return map;
}

function validateContactAccess(
  plan: QueryPlan,
  userRole: string | undefined,
  extraFilters: Filter[] = [],
): { allowed: boolean; reason?: string } {
  if (!userRole) {
    return { allowed: false, reason: "Authentication required to access contact information." };
  }

  const allFilters = [...plan.filters, ...extraFilters];

  console.log('[Contact Access Check]', {
    userRole,
    totalFilters: allFilters.length,
    filters: allFilters.map(f => ({
      field: f.field,
      operator: f.operator,
      value: f.value
    }))
  });

  const companyFilters = allFilters.filter(f =>
    f.field === "company" || f.field === "company_name" || f.field === "company_id"
  );

  if (companyFilters.length === 0) {
    return { allowed: false, reason: "Please specify which company's contacts you want to access. For example: 'Show unresolved case contacts for Acme Corp'." };
  }

  if (companyFilters.length > 1) {
    return { allowed: false, reason: "You can only access contacts for one company at a time. Please specify a single company." };
  }

  if (userRole === "company" || userRole === "lawyer") {
    const hasResolvedFilter = allFilters.some(f =>
      (f.field === "resolution_status" || f.field === "resolutionStatus") &&
      f.operator === "eq" &&
      (f.value === "resolved" || f.value === "Resolved")
    );

    if (hasResolvedFilter) {
      const roleLabel = userRole === "company" ? "Company representatives" : "Legal professionals";
      const reason = `${roleLabel} can only access unresolved case contacts.`;
      
      console.log('[Contact Access Denied]', {
        userRole,
        reason,
        resolvedFilter: allFilters.find(f =>
          (f.field === "resolution_status" || f.field === "resolutionStatus") &&
          f.operator === "eq" &&
          (f.value === "resolved" || f.value === "Resolved")
        )
      });
      
      return { allowed: false, reason };
    }
  }

  console.log('[Contact Access Granted]', { userRole });
  return { allowed: true };
}

function buildDefaultFilters(plan: QueryPlan, userRole?: string, userCompanyId?: string | null): Filter[] {
  const extraFilters: Filter[] = [];

  if (userRole === "company" && userCompanyId) {
    extraFilters.push({
      field: "company_id",
      operator: "eq",
      value: userCompanyId,
    });
  }

  if (userRole === "company" || userRole === "lawyer") {
    const hasResolutionFilter = plan.filters.some(f =>
      f.field === "resolution_status" || f.field === "resolutionStatus"
    );
    if (!hasResolutionFilter) {
      extraFilters.push({
        field: "resolution_status",
        operator: "neq",
        value: "resolved",
      });
    }
  }

  return extraFilters;
}

type DrizzleColumn = PgColumn;

const DRIZZLE_OPERATORS: Record<string, (field: DrizzleColumn, value: unknown) => SQL> = {
  eq: (field, value) => eq(field, value),
  neq: (field, value) => ne(field, value),
  gt: (field, value) => gt(field, value),
  gte: (field, value) => gte(field, value),
  lt: (field, value) => lt(field, value),
  lte: (field, value) => lte(field, value),
  in: (field, value) => inArray(field, value as unknown[]),
  contains: (field, value) => like(field, `%${escapeLikeValue(String(value))}%`),
};

async function parseQuery(
  userMessage: string, 
  previousContext?: string,
  userContext?: { role?: string; companyName?: string; approvalStatus?: string }
): Promise<QueryPlan> {
  const model = getClerkModel();
  
  // Build user context string
  let userContextStr = '';
  if (userContext?.role) {
    userContextStr = `\n\nUser context: The user is logged in as a ${userContext.role}`;
    if (userContext.companyName) {
      userContextStr += ` representing ${userContext.companyName}`;
    }
    if (userContext.approvalStatus) {
      userContextStr += ` with ${userContext.approvalStatus} approval status`;
    }
    userContextStr += `. When they say "my company", "our cases", or "cases against us", they mean ${userContext.companyName || 'their company'}.`;
    userContextStr += ` The backend will automatically filter by their company ID for company users, so you don't need to add a company filter in the query.`;
  }
  
  // Build the full prompt with previous context and user context
  const fullPrompt = previousContext 
    ? `${userMessage}\n\n${previousContext}${userContextStr}\n\nIf the user references previous data (e.g., "those cases", "the results"), reuse the filters from the previous query.`
    : `${userMessage}${userContextStr}`;
  
  const raw = await callOpenRouter({
    model,
    systemPrompt: CLERK_QUERY_PLANNER_SYSTEM,
    userPrompt: fullPrompt,
    temperature: 0.1,
    maxTokens: 1024,
  });

  const cleaned = raw.replace(/```(?:json)?\n?/gi, "").trim();
  
  try {
    const plan = JSON.parse(cleaned) as QueryPlan;
    return plan;
  } catch (parseError) {
    console.error("Failed to parse query plan:", cleaned);
    throw new Error("AI returned invalid query plan. Please try rephrasing your question.");
  }
}

function validateQueryPlan(plan: QueryPlan, fieldMap: Record<string, string>): { valid: boolean; error?: string } {
  const validAggregations = ["count", "sum", "list", "group_by", "metrics"];
  const validOperators = ["eq", "neq", "gt", "gte", "lt", "lte", "in", "contains"];
  const validSources = ["cases", "metrics"];

  if (!plan.aggregation || !validAggregations.includes(plan.aggregation)) {
    return { valid: false, error: "Invalid aggregation type" };
  }

  if (plan.source && !validSources.includes(plan.source)) {
    return { valid: false, error: "Invalid data source" };
  }

  if (plan.limit !== null && plan.limit !== undefined) {
    if (typeof plan.limit !== "number" || plan.limit < 1 || plan.limit > 500) {
      return { valid: false, error: "Limit must be between 1 and 500" };
    }
  }

  for (const filter of plan.filters) {
    if (!filter.field || typeof filter.field !== "string") {
      return { valid: false, error: "Filter field must be a string" };
    }

    if (!validOperators.includes(filter.operator)) {
      return { valid: false, error: `Invalid filter operator: ${filter.operator}` };
    }

    const mapped = fieldMap[filter.field];
    if (!mapped) {
      return { valid: false, error: `Unknown filter field: ${filter.field}` };
    }

    if (filter.operator === "in" && (!Array.isArray(filter.value) || filter.value.length > 50)) {
      return { valid: false, error: "In operator requires an array with max 50 elements" };
    }
  }

  if (plan.groupBy) {
    const mapped = fieldMap[plan.groupBy];
    if (!mapped) {
      return { valid: false, error: `Unknown groupBy field: ${plan.groupBy}` };
    }
  }

  if (plan.orderBy) {
    if (plan.orderBy.direction !== "asc" && plan.orderBy.direction !== "desc") {
      return { valid: false, error: "orderBy direction must be 'asc' or 'desc'" };
    }
  }

  return { valid: true };
}

function resolveField(field: string, fieldMap: Record<string, string>): DrizzleColumn | null {
  const mapped = fieldMap[field];
  if (!mapped) return null;

  const [table, column] = mapped.split(".");
  if (table === "cases") return cases[column as keyof typeof cases] as DrizzleColumn;
  if (table === "companies") return companies[column as keyof typeof companies] as DrizzleColumn;
  if (table === "metrics") return entityMetricsSnapshots[column as keyof typeof entityMetricsSnapshots] as DrizzleColumn;
  return null;
}

function buildFilters(plan: QueryPlan, fieldMap: Record<string, string>, extraFilters?: Filter[], forMetrics = false) {
  const allFilters = [...plan.filters, ...(extraFilters || [])];
  const baseConditions: any[] = forMetrics ? [] : [eq(cases.status, "active")];

  for (const filter of allFilters) {
    const drizzleField: any = resolveField(filter.field, fieldMap);
    if (!drizzleField) continue;

    const operatorFn = DRIZZLE_OPERATORS[filter.operator];
    if (!operatorFn) continue;

    const condition: any = operatorFn(drizzleField, filter.value);
    if (condition) baseConditions.push(condition);
  }
  return baseConditions.length > 0 ? and(...baseConditions) : undefined;
}

async function executeMetricsPlan(plan: QueryPlan, fieldMap: Record<string, string>): Promise<QueryResult> {
  const whereClause = buildFilters(plan, fieldMap, undefined, true);

  if (plan.aggregation === "metrics" || plan.aggregation === "list") {
    const rows = await db
      .select({
        entityType: entityMetricsSnapshots.entityType,
        entityId: entityMetricsSnapshots.entityId,
        viewsTotal: entityMetricsSnapshots.viewsTotal,
        views24h: entityMetricsSnapshots.views24h,
        views7d: entityMetricsSnapshots.views7d,
        visitorsTotal: entityMetricsSnapshots.visitorsTotal,
        sharesTotal: entityMetricsSnapshots.sharesTotal,
      })
      .from(entityMetricsSnapshots)
      .where(whereClause)
      .limit(plan.limit || 20);

    return { rows: rows as Record<string, unknown>[], summary: { type: "metrics" } };
  }

  if (plan.aggregation === "count") {
    const [result] = await db
      .select({ total: count() })
      .from(entityMetricsSnapshots)
      .where(whereClause);

    return { rows: [], summary: { type: "count", value: result?.total ?? 0 } };
  }

  if (plan.aggregation === "group_by" && plan.groupBy) {
    const groupField = resolveField(plan.groupBy, fieldMap);
    if (!groupField) return { rows: [], summary: { error: "Invalid groupBy field" } };

    const selectFields: Record<string, any> = {
      [plan.groupBy]: groupField,
      totalViews: sum(entityMetricsSnapshots.viewsTotal),
      totalVisitors: sum(entityMetricsSnapshots.visitorsTotal),
      totalShares: sum(entityMetricsSnapshots.sharesTotal),
    };

    let query: any = db
      .select(selectFields)
      .from(entityMetricsSnapshots)
      .where(whereClause)
      .groupBy(groupField);

    if (plan.orderBy) {
      const orderField = plan.orderBy.field === "totalViews" ? sum(entityMetricsSnapshots.viewsTotal) : groupField;
      query = query.orderBy(plan.orderBy.direction === "desc" ? desc(orderField) : asc(orderField));
    }

    const rows = await query;
    return { rows: rows as Record<string, unknown>[], summary: { type: "group_by", groupBy: plan.groupBy } };
  }

  return { rows: [], summary: { type: "count", value: 0 } };
}

async function executeCasesPlan(plan: QueryPlan, fieldMap: Record<string, string>, extraFilters?: Filter[], requestsContact?: boolean): Promise<QueryResult> {
  const whereClause = buildFilters(plan, fieldMap, extraFilters, false);

  if (plan.aggregation === "count") {
    const [result] = await db
      .select({ total: count() })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(whereClause);

    return { rows: [], summary: { type: "count", value: result?.total ?? 0 } };
  }

  if (plan.aggregation === "sum" && plan.aggregationField === "amountOwed") {
    const [result] = await db
      .select({ total: sum(cases.amountOwed) })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(whereClause);

    return { rows: [], summary: { type: "sum", field: "amountOwed", value: Number(result?.total ?? 0) } };
  }

  if (plan.aggregation === "group_by" && plan.groupBy) {
    const groupField = resolveField(plan.groupBy, fieldMap);
    if (!groupField) return { rows: [], summary: { error: "Invalid groupBy field" } };

    const selectFields: Record<string, any> = {
      [plan.groupBy]: groupField,
      count: count(),
    };

    let query: any = db
      .select(selectFields)
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(whereClause)
      .groupBy(groupField);

    if (plan.orderBy) {
      const orderField = plan.orderBy.field === "count" ? count() : groupField;
      query = query.orderBy(plan.orderBy.direction === "desc" ? desc(orderField) : asc(orderField));
    }

    if (plan.limit) query = query.limit(plan.limit);

    const rows = await query;
    return { rows: rows as Record<string, unknown>[], summary: { type: "group_by", groupBy: plan.groupBy } };
  }

  if (plan.aggregation === "list") {
    const selectFields: Record<string, any> = {
      id: cases.id,
      companyName: companies.name,
      companySlug: companies.slug,
      vertical: cases.vertical,
      country: cases.country,
      caseType: cases.caseType,
      amountOwed: cases.amountOwed,
      currency: cases.currency,
      dateRange: cases.dateRange,
      resolutionStatus: cases.resolutionStatus,
      createdAt: cases.createdAt,
      story: cases.story,
    };
    
    // Only include contactAlias when user explicitly requests contact information
    if (requestsContact && fieldMap.contactAlias) {
      selectFields.contactAlias = cases.contactAlias;
    }

    let query: any = db
      .select(selectFields)
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(whereClause);

    // Always order by createdAt desc (most recent first) for list queries
    if (plan.orderBy) {
      const orderField = plan.orderBy.field === "company_name" ? companies.name : resolveField(plan.orderBy.field, fieldMap) ?? cases.createdAt;
      query = query.orderBy(plan.orderBy.direction === "desc" ? desc(orderField) : asc(orderField));
    } else {
      // Default ordering: most recent first
      query = query.orderBy(desc(cases.createdAt));
    }

    // Fetch up to 100 cases for .md download
    const MAX_DOWNLOAD_LIMIT = 100;
    const effectiveLimit = Math.min(plan.limit || MAX_DOWNLOAD_LIMIT, MAX_DOWNLOAD_LIMIT);
    query = query.limit(effectiveLimit);

    const allRows = await query;
    
    // Return metadata about total vs displayed
    return { 
      rows: allRows as Record<string, unknown>[], 
      summary: { 
        type: "list",
        totalFetched: allRows.length,
        displayLimit: 20 // Will be enforced at response level
      } 
    };
  }

  return { rows: [], summary: { type: "count", value: 0 } };
}

async function executePlan(plan: QueryPlan, fieldMap: Record<string, string>, extraFilters?: Filter[], requestsContact?: boolean): Promise<QueryResult> {
  if (plan.source === "metrics") return executeMetricsPlan(plan, fieldMap);
  return executeCasesPlan(plan, fieldMap, extraFilters, requestsContact);
}

function formatResultsForLlm(plan: QueryPlan, result: QueryResult): string {
  const parts = [`Query: ${plan.summary}`];

  if (result.summary.type === "count") {
    parts.push(`Result: ${String(result.summary.value)} record(s) found.`);
  } else if (result.summary.type === "sum") {
    parts.push(`Total unpaid: ${String(result.summary.value)}`);
  } else if (result.summary.type === "metrics" || result.summary.type === "list") {
    const totalFetched = result.summary.totalFetched || result.rows.length;
    const DISPLAY_LIMIT = 20;
    const displayRows = result.rows.slice(0, DISPLAY_LIMIT);
    
    parts.push(`Results (${totalFetched} total cases, showing ${displayRows.length} most recent):`);
    if (displayRows.length > 0) {
      parts.push(JSON.stringify(displayRows, null, 2));
    }
    
    if (totalFetched > DISPLAY_LIMIT) {
      parts.push(`\nNote: ${totalFetched - DISPLAY_LIMIT} additional cases are available in the downloadable .md file.`);
    }
  } else if (result.summary.type === "group_by") {
    parts.push(`Results grouped by ${String(result.summary.groupBy)}:`);
    for (const row of result.rows) {
      const key = String(row[plan.groupBy ?? ""]);
      const values = Object.entries(row).filter(([k]) => k !== plan.groupBy).map(([k, v]) => `${k}: ${v}`).join(", ");
      parts.push(`- ${key}: ${values}`);
    }
  }

  return parts.join("\n");
}

function streamRejection(message: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(message));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}

type Message = {
  role: "user" | "assistant";
  content: string;
  queryResults?: string;
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = await rateLimit(ip);
  if (!rl.allowed) return error("Rate limit exceeded. Please wait before sending another query.", 429);

  try {
    const session = await auth();
    const userRole = session?.user?.role;
    const userCompanyId = session?.user?.companyId;
    const isApproved = session?.user?.approvalStatus === "approved";
    const isPrivileged = !!(userRole && isApproved);

    const body = await request.json();
    const { message, history } = body as { message: string; history?: Message[] };
    const responseMode = request.headers.get("X-Response-Mode") || "full";

    if (!message || typeof message !== "string" || message.trim().length === 0) return error("Message is required", 400);
    if (message.length > 2000) return error("Message too long (max 2000 characters)", 400);

    const fieldMap = getFieldMap(isPrivileged, userRole);

    const requestsContact = mentionsContact(message);

    if (requestsContact && !isPrivileged) {
      await db.insert(auditLogs).values({
        userId: session?.user?.id || "00000000-0000-0000-0000-000000000000",
        userRole: userRole || "anonymous",
        companyId: userCompanyId || null,
        query: message,
        accessedContacts: true,
        success: false,
        reason: "Not authenticated or not approved",
      });
      return streamRejection("Contact information is only available to verified legal professionals, companies, and media/research partners. Please register through the appropriate channel to access this data.");
    }

    // Extract previous query context from history
    const recentHistoryForPlanner = history?.slice(-2) || [];
    const previousQueryContext = recentHistoryForPlanner.length > 0
      ? `Previous conversation context:\n${recentHistoryForPlanner.map(msg => 
          `${msg.role}: ${msg.content.substring(0, 200)}`
        ).join('\n')}`
      : '';

    // Build user context for query planner
    const userContext = {
      role: userRole,
      companyName: session?.user?.companyName,
      approvalStatus: session?.user?.approvalStatus
    };

    const plan = await parseQuery(message, previousQueryContext, userContext);

    if (plan.rejected) {
      return streamRejection(plan.rejectionReason || "This query is outside the scope of Sindicato's worker exploitation database.");
    }

    if (!plan.aggregation) {
      return error("Could not understand the query. Please rephrase.", 400);
    }

    const planValidation = validateQueryPlan(plan, fieldMap);
    if (!planValidation.valid) {
      return error(planValidation.error || "Invalid query plan", 400);
    }

    const extraFilters = buildDefaultFilters(plan, userRole, userCompanyId);

    if (requestsContact) {
      const [lastContactQuery] = await db
        .select({ createdAt: auditLogs.createdAt })
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.userId, session!.user.id),
            eq(auditLogs.success, true),
            eq(auditLogs.accessedContacts, true)
          )
        )
        .orderBy(desc(auditLogs.createdAt))
        .limit(1);

      if (lastContactQuery) {
        const hoursSinceLastQuery = (Date.now() - new Date(lastContactQuery.createdAt).getTime()) / 3600000;
        if (hoursSinceLastQuery < 24) {
          const hoursLeft = Math.ceil(24 - hoursSinceLastQuery);
          await db.insert(auditLogs).values({
            userId: session!.user.id,
            userRole: userRole!,
            companyId: userCompanyId || null,
            query: message,
            accessedContacts: true,
            success: false,
            reason: "Rate limited",
          });
          return streamRejection(`Contact query rate limit reached. You can make one contact query per 24 hours. Please try again in approximately ${hoursLeft} hour(s).`);
        }
      }

      const accessCheck = validateContactAccess(plan, userRole, extraFilters);
      if (!accessCheck.allowed) {
        await db.insert(auditLogs).values({
          userId: session!.user.id,
          userRole: userRole!,
          companyId: userCompanyId || null,
          query: message,
          accessedContacts: true,
          success: false,
          reason: accessCheck.reason,
        });
        return streamRejection(accessCheck.reason!);
      }
    }

    const validation = await validateDomainScope(message);
    if (!validation.valid) {
      return streamRejection(`I can only answer questions about Sindicato's worker exploitation data. ${validation.reason || "This query is outside the scope of the available data."}`);
    }

    const result = await executePlan(plan, fieldMap, extraFilters, requestsContact);
    let contextForLlm = formatResultsForLlm(plan, result);

    // Check if current results are empty and we have previous results in history
    if (result.rows.length === 0 && history && history.length > 0) {
      // Look for previous assistant messages with queryResults
      const previousAssistantMsg = history
        .filter(msg => msg.role === 'assistant' && msg.queryResults)
        .pop();
      
      if (previousAssistantMsg?.queryResults) {
        try {
          const previousResults = JSON.parse(previousAssistantMsg.queryResults);
          if (previousResults.rows && previousResults.rows.length > 0) {
            // Use previous results instead
            result.rows = previousResults.rows;
            result.summary = previousResults.summary;
            contextForLlm = formatResultsForLlm(plan, result);
          }
        } catch (e) {
          console.error('Failed to parse previous query results:', e);
        }
      }
    }

    if (requestsContact && result.rows.length > 0) {
      const caseIds = result.rows
        .map((r: any) => r.id || r.caseId)
        .filter(Boolean);
      if (caseIds.length > 0) {
        try {
          await db.insert(dataAccessLogs).values(
            caseIds.map((caseId: string) => ({
              caseId,
              platformAccountId: session!.user.id,
              role: userRole!,
              workerNotified: false,
            }))
          );
        } catch (logErr) {
          console.error("Failed to log data access:", logErr);
        }
      }

      await db.insert(auditLogs).values({
        userId: session!.user.id,
        userRole: userRole!,
        companyId: userCompanyId || null,
        query: message,
        accessedContacts: true,
        success: true,
        reason: null,
      });
    }

    const truncateResults = (results: string, maxLength = 2000): string => {
      if (results.length <= maxLength) return results;
      return results.substring(0, maxLength) + "... [truncated]";
    };

    const recentHistory = history?.slice(-5) || [];
    const historyContext = recentHistory.length > 0
      ? `Previous conversation:\n${recentHistory.map(msg => {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          const results = msg.queryResults 
            ? `\nRaw data: ${truncateResults(msg.queryResults)}` 
            : '';
          return `${role}: ${msg.content}${results}`;
        }).join('\n\n')}\n\n`
      : '';

    const model = getClerkModel();
    const responsePrompt = responseMode === "concise" ? CLERK_RESPONSE_CONCISE : CLERK_RESPONSE_SYSTEM;
    const stream = await callOpenRouterStream({
      model,
      systemPrompt: responsePrompt,
      userPrompt: `${historyContext}Current question: ${message}\n\nCurrent database query results:\n${contextForLlm}\n\nInstructions: \n1. Answer the current question using the current database results\n2. If the user references previous data (e.g., "those cases", "the results"), use the conversation history and raw data from previous queries\n3. When listing cases, always include case IDs\n4. Format the answer in natural language with proper markdown tables`,
      temperature: 0.5,
      maxTokens: 2048,
    });

    // Ensure contextForLlm is never empty
    const safeContextForLlm = contextForLlm && contextForLlm.trim().length > 0 
      ? contextForLlm 
      : "No database results available.";

    console.log("[API] Preparing to send response");
    console.log("[API] Query plan:", plan);
    console.log("[API] Result rows count:", result.rows.length);
    console.log("[API] Context for LLM length:", safeContextForLlm.length);

    // Create a combined stream that sends raw results first, then the AI response
    const encoder = new TextEncoder();
    const combinedStream = new ReadableStream({
      async start(controller) {
        // ALWAYS send raw results marker for consistency
        const rawResultsMarker = `__RAW_RESULTS__${JSON.stringify(result)}__END_RAW_RESULTS__`;
        controller.enqueue(encoder.encode(rawResultsMarker));
        console.log("[API] Raw results marker size:", rawResultsMarker.length, "bytes");
        console.log("[API] Result rows:", result.rows.length);
        if (result.rows.length > 0) {
          const firstRow = result.rows[0] as any;
          const lastRow = result.rows[result.rows.length - 1] as any;
          console.log("[API] First row story length:", firstRow.story?.length || 0);
          console.log("[API] Last row story length:", lastRow.story?.length || 0);
        }
        
        // Then stream the AI response
        const reader = stream.getReader();
        let aiChunksSent = 0;
        let totalAiBytes = 0;
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("[API] AI stream complete, chunks sent:", aiChunksSent, "total bytes:", totalAiBytes);
              break;
            }
            aiChunksSent++;
            totalAiBytes += value.length;
            controller.enqueue(value);
          }
        } catch (streamError) {
          console.error("[API] Error streaming AI response:", streamError);
          controller.enqueue(encoder.encode("An error occurred while generating the response."));
        } finally {
          reader.releaseLock();
          controller.close();
        }
      }
    });

    return new Response(combinedStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });

    return new Response(combinedStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  } catch (err) {
    console.error("Error in clerk query:", err);
    return error("Failed to process query. Please try again.", 500);
  }
}
