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
  summary: Record<string, unknown>;
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
    company_id: "companies.id",
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
      (f.value === "resolved" || f.value === "Resolved" || f.value === "active")
    );

    if (hasResolvedFilter) {
      const roleLabel = userRole === "company" ? "Company representatives" : "Legal professionals";
      return { allowed: false, reason: `${roleLabel} can only access unresolved case contacts.` };
    }
  }

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

async function parseQuery(userMessage: string): Promise<QueryPlan> {
  const model = getClerkModel();
  const raw = await callOpenRouter({
    model,
    systemPrompt: CLERK_QUERY_PLANNER_SYSTEM,
    userPrompt: userMessage,
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

async function executeCasesPlan(plan: QueryPlan, fieldMap: Record<string, string>, extraFilters?: Filter[]): Promise<QueryResult> {
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
    };

    if (fieldMap.contactAlias) {
      selectFields.contactAlias = cases.contactAlias;
    }

    let query: any = db
      .select(selectFields)
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(whereClause);

    if (plan.orderBy) {
      const orderField = plan.orderBy.field === "company_name" ? companies.name : resolveField(plan.orderBy.field, fieldMap) ?? cases.createdAt;
      query = query.orderBy(plan.orderBy.direction === "desc" ? desc(orderField) : asc(orderField));
    }

    if (plan.limit) query = query.limit(plan.limit);

    const rows = await query;
    return { rows: rows as Record<string, unknown>[], summary: { type: "list" } };
  }

  return { rows: [], summary: { type: "count", value: 0 } };
}

async function executePlan(plan: QueryPlan, fieldMap: Record<string, string>, extraFilters?: Filter[]): Promise<QueryResult> {
  if (plan.source === "metrics") return executeMetricsPlan(plan, fieldMap);
  return executeCasesPlan(plan, fieldMap, extraFilters);
}

function formatResultsForLlm(plan: QueryPlan, result: QueryResult): string {
  const parts = [`Query: ${plan.summary}`];

  if (result.summary.type === "count") {
    parts.push(`Result: ${String(result.summary.value)} record(s) found.`);
  } else if (result.summary.type === "sum") {
    parts.push(`Total unpaid: ${String(result.summary.value)}`);
  } else if (result.summary.type === "metrics" || result.summary.type === "list") {
    parts.push(`Results (${result.rows.length} rows):`);
    if (result.rows.length > 0) {
      parts.push(JSON.stringify(result.rows, null, 2));
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

    const plan = await parseQuery(message);

    if (plan.rejected) {
      return streamRejection(plan.rejectionReason || "This query is outside the scope of Sindicato's worker exploitation database.");
    }

    if (!plan.aggregation) return error("Could not understand the query. Please rephrase.", 400);

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

    const result = await executePlan(plan, fieldMap, extraFilters);
    const contextForLlm = formatResultsForLlm(plan, result);

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

    const recentHistory = history?.slice(-5) || [];
    const historyContext = recentHistory.length > 0
      ? `Conversation history:\n${recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\n`
      : '';

    const model = getClerkModel();
    const stream = await callOpenRouterStream({
      model,
      systemPrompt: CLERK_RESPONSE_SYSTEM,
      userPrompt: `${historyContext}User question: ${message}\n\nDatabase query results:\n${contextForLlm}\n\nFormat the answer in natural language.`,
      temperature: 0.5,
      maxTokens: 2048,
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  } catch (err) {
    console.error("Error in clerk query:", err);
    return error("Failed to process query. Please try again.", 500);
  }
}
