import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq, ne, and, gt, gte, lt, lte, inArray, like, count, sum, asc, desc } from "drizzle-orm";
import { error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";
import { callOpenRouter, callOpenRouterStream, getClerkModel } from "@/lib/ai/openrouter";
import {
  CLERK_QUERY_PLANNER_SYSTEM,
  CLERK_RESPONSE_SYSTEM,
} from "@/lib/ai/prompts";

type Filter = {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value: unknown;
};

type QueryPlan = {
  aggregation: "count" | "sum" | "list" | "group_by";
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

const FIELD_MAP: Record<string, string> = {
  company_name: "companies.name",
  company: "companies.name",
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
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DrizzleColumn = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DRIZZLE_OPERATORS: Record<string, (field: DrizzleColumn, value: unknown) => any> = {
  eq: (field, value) => eq(field, value),
  neq: (field, value) => ne(field, value),
  gt: (field, value) => gt(field, value),
  gte: (field, value) => gte(field, value),
  lt: (field, value) => lt(field, value),
  lte: (field, value) => lte(field, value),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  in: (field, value) => inArray(field, value as any[]),
  contains: (field, value) => like(field, `%${value}%`),
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

  const cleaned = raw
    .replace(/```(?:json)?\n?/gi, "")
    .trim();
  const plan = JSON.parse(cleaned) as QueryPlan;
  return plan;
}

function resolveField(field: string): DrizzleColumn | null {
  const mapped = FIELD_MAP[field];
  if (!mapped) return null;

  const [table, column] = mapped.split(".");
  if (table === "cases") {
    return cases[column as keyof typeof cases] as DrizzleColumn;
  }
  if (table === "companies") {
    return companies[column as keyof typeof companies] as DrizzleColumn;
  }
  return null;
}

function buildFilters(plan: QueryPlan) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseConditions: any[] = [eq(cases.status, "active")];

  for (const filter of plan.filters) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drizzleField: any = resolveField(filter.field);
    if (!drizzleField) continue;

    const operatorFn = DRIZZLE_OPERATORS[filter.operator];
    if (!operatorFn) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const condition: any = operatorFn(drizzleField, filter.value);
    if (condition) {
      baseConditions.push(condition);
    }
  }

  return and(...baseConditions);
}

async function executePlan(plan: QueryPlan): Promise<QueryResult> {
  const whereClause = buildFilters(plan);

  if (plan.aggregation === "count") {
    const [result] = await db
      .select({ total: count() })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(whereClause);

    return {
      rows: [],
      summary: { type: "count", value: result?.total ?? 0 },
    };
  }

  if (plan.aggregation === "sum" && plan.aggregationField === "amountOwed") {
    const [result] = await db
      .select({ total: sum(cases.amountOwed) })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(whereClause);

    return {
      rows: [],
      summary: { type: "sum", field: "amountOwed", value: Number(result?.total ?? 0) },
    };
  }

  if (plan.aggregation === "group_by" && plan.groupBy) {
    const groupField = resolveField(plan.groupBy);
    if (!groupField) {
      return { rows: [], summary: { error: "Invalid groupBy field" } };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectFields: Record<string, any> = {
      [plan.groupBy]: groupField,
      count: count(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = db
      .select(selectFields)
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(whereClause)
      .groupBy(groupField);

    if (plan.orderBy) {
      const orderField = plan.orderBy.field === "count"
        ? count()
        : groupField;
      query = query.orderBy(plan.orderBy.direction === "desc" ? desc(orderField) : asc(orderField));
    }

    if (plan.limit) {
      query = query.limit(plan.limit);
    }

    const rows = await query;
    return {
      rows: rows as Record<string, unknown>[],
      summary: { type: "group_by", groupBy: plan.groupBy },
    };
  }

  if (plan.aggregation === "list") {
    const selectFields = {
      companyName: companies.name,
      companySlug: companies.slug,
      vertical: cases.vertical,
      country: cases.country,
      caseType: cases.caseType,
      amountOwed: cases.amountOwed,
      currency: cases.currency,
      dateRange: cases.dateRange,
      resolutionStatus: cases.resolutionStatus,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = db
      .select(selectFields)
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(whereClause);

    if (plan.orderBy) {
      const orderField = plan.orderBy.field === "company_name"
        ? companies.name
        : resolveField(plan.orderBy.field) ?? cases.createdAt;
      query = query.orderBy(plan.orderBy.direction === "desc" ? desc(orderField) : asc(orderField));
    }

    if (plan.limit) {
      query = query.limit(plan.limit);
    }

    const rows = await query;
    return {
      rows: rows as Record<string, unknown>[],
      summary: { type: "list" },
    };
  }

  return { rows: [], summary: { type: "count", value: 0 } };
}

function formatResultsForLlm(plan: QueryPlan, result: QueryResult): string {
  const parts = [`Query: ${plan.summary}`];

  if (result.summary.type === "count") {
    parts.push(`Result: ${String(result.summary.value)} case(s) found.`);
  } else if (result.summary.type === "sum") {
    parts.push(`Total unpaid: ${String(result.summary.value)}`);
  } else if (result.summary.type === "group_by") {
    parts.push(`Results grouped by ${String(result.summary.groupBy)}:`);
    for (const row of result.rows) {
      parts.push(`- ${String(row[plan.groupBy ?? ""])}: ${String(row.count)}`);
    }
  } else if (result.summary.type === "list") {
    parts.push(`Results (${result.rows.length} rows):`);
    if (result.rows.length > 0) {
      parts.push(JSON.stringify(result.rows, null, 2));
    }
  }

  return parts.join("\n");
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimit(ip);
  if (!rl.allowed) {
    return error("Rate limit exceeded. Please wait before sending another query.", 429);
  }

  try {
    const body = await request.json();
    const { message } = body as { message: string };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return error("Message is required", 400);
    }

    if (message.length > 2000) {
      return error("Message too long (max 2000 characters)", 400);
    }

    const plan = await parseQuery(message);

    if (!plan.aggregation) {
      return error("Could not understand the query. Please rephrase.", 400);
    }

    const result = await executePlan(plan);

    const contextForLlm = formatResultsForLlm(plan, result);

    const model = getClerkModel();
    const stream = await callOpenRouterStream({
      model,
      systemPrompt: CLERK_RESPONSE_SYSTEM,
      userPrompt: `User question: ${message}\n\nDatabase query results:\n${contextForLlm}\n\nFormat the answer in natural language.`,
      temperature: 0.5,
      maxTokens: 2048,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Error in clerk query:", err);
    return error("Failed to process query. Please try again.", 500);
  }
}
