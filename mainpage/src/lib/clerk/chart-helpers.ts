export const CHART_COLORS = [
  "#8B1A2A",
  "#C9A84C",
  "#4a5c3a",
  "#c45a30",
  "#F26522",
  "#6B0F1A",
  "#d4c49f",
  "#1a2330",
  "#12261C",
  "#A0522D",
];

export const TIME_FIELDS = ["createdAt", "dateRange", "date_range", "created_at"];

export const LIST_DIMENSION_PREFERENCE = [
  "caseType",
  "resolutionStatus",
  "vertical",
  "country",
  "companyName",
  "ageRange",
  "sex",
];

export type ChartType = "bar" | "donut" | "line" | "stacked_bar" | "stat" | null;

export type QuerySummary = {
  type: string;
  groupBy?: string | string[];
  value?: number | string;
  field?: string;
  totalFetched?: number;
  [key: string]: unknown;
};

export type ParsedResults = {
  rows: Record<string, unknown>[];
  summary: QuerySummary;
};

export function deriveChartType(summary: QuerySummary, rowCount: number): ChartType {
  if (summary.type === "count" || summary.type === "sum") return "stat";
  if (summary.type === "metrics") {
    if (rowCount === 0) return null;
    if (rowCount === 1) return "stat";
    return "bar";
  }
  if (summary.type === "list") {
    if (rowCount === 0) return null;
    if (rowCount === 1) return "stat";
    return "bar";
  }
  if (summary.type !== "group_by") return null;
  if (rowCount < 2) return null;

  const groupByFields = Array.isArray(summary.groupBy)
    ? summary.groupBy
    : summary.groupBy
    ? [summary.groupBy]
    : [];

  if (groupByFields.length === 2) return "stacked_bar";
  if (groupByFields.length === 1 && TIME_FIELDS.includes(groupByFields[0])) return "line";
  if (rowCount <= 6) return "donut";
  return "bar";
}

export function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function extractSingleDimensionData(
  rows: Record<string, unknown>[],
  groupBy: string
) {
  const valueKeys = Object.keys(rows[0] || {}).filter((k) => k !== groupBy);
  const dataKey = valueKeys[0] || "count";

  return rows.map((row) => ({
    name: String(row[groupBy] ?? "Unknown"),
    value: Number(row[dataKey] ?? 0),
  }));
}

export function extractStackedData(
  rows: Record<string, unknown>[],
  groupByFields: string[]
) {
  if (groupByFields.length !== 2 || rows.length === 0) {
    return { data: [], seriesKeys: [] };
  }

  const [primaryField, secondaryField] = groupByFields;
  const valueKeys = Object.keys(rows[0]).filter(
    (k) => k !== primaryField && k !== secondaryField
  );
  const valueKey = valueKeys[0] || "count";

  const grouped = new Map<string, Record<string, unknown>>();
  const seriesSet = new Set<string>();

  for (const row of rows) {
    const primary = String(row[primaryField] ?? "Unknown");
    const secondary = String(row[secondaryField] ?? "Unknown");
    seriesSet.add(secondary);

    if (!grouped.has(primary)) {
      grouped.set(primary, { name: primary });
    }
    const entry = grouped.get(primary)!;
    entry[secondary] = (entry[secondary] as number || 0) + Number(row[valueKey] ?? 0);
  }

  const data = Array.from(grouped.values());
  const seriesKeys = Array.from(seriesSet);

  return { data, seriesKeys };
}

export function pickListDimension(
  rows: Record<string, unknown>[]
): { dimension: string; isAuto: boolean } {
  if (rows.length === 0) return { dimension: "", isAuto: true };

  const firstRow = rows[0];
  const columns = Object.keys(firstRow).filter((k) => {
    const v = firstRow[k];
    return v !== null && v !== undefined && typeof v !== "object";
  });

  for (const pref of LIST_DIMENSION_PREFERENCE) {
    if (!columns.includes(pref)) continue;
    const unique = new Set(rows.map((r) => String(r[pref] ?? "Unknown")));
    if (unique.size >= 2 && unique.size <= 12) {
      return { dimension: pref, isAuto: true };
    }
  }

  for (const col of columns) {
    if (col === "id" || col === "story" || col === "createdAt" || col === "dateRange") continue;
    if (TIME_FIELDS.includes(col)) continue;
    const unique = new Set(rows.map((r) => String(r[col] ?? "Unknown")));
    if (unique.size >= 2 && unique.size <= 12) {
      return { dimension: col, isAuto: true };
    }
  }

  return { dimension: "", isAuto: true };
}

export function aggregateListRows(
  rows: Record<string, unknown>[],
  dimension: string
): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = String(row[dimension] ?? "Unknown");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function pickMetricsDimension(
  rows: Record<string, unknown>[]
): { dimension: string | null; isAuto: boolean } {
  if (rows.length === 0) return { dimension: null, isAuto: true };

  const firstRow = rows[0];
  const hasEntityType = "entityType" in firstRow;
  const hasEntityId = "entityId" in firstRow;

  if (hasEntityType) {
    const unique = new Set(rows.map((r) => String(r.entityType ?? "Unknown")));
    if (unique.size >= 1) return { dimension: "entityType", isAuto: true };
  }

  if (hasEntityId) {
    return { dimension: "entityId", isAuto: true };
  }

  return { dimension: null, isAuto: true };
}

export function aggregateMetricsRows(
  rows: Record<string, unknown>[],
  dimension: string
): { name: string; value: number }[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const key = String(row[dimension] ?? "Unknown");
    const views = Number(row.viewsTotal ?? 0);
    totals.set(key, (totals.get(key) ?? 0) + views);
  }
  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function formatStatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
  if (Number.isInteger(value)) return value.toLocaleString();
  return value.toFixed(2);
}
