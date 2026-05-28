"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const CHART_COLORS = [
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

const TIME_FIELDS = ["createdAt", "dateRange", "date_range", "created_at"];

type ChartType = "bar" | "donut" | "line" | "stacked_bar" | null;

type QuerySummary = {
  type: string;
  groupBy?: string | string[];
  totalFetched?: number;
  [key: string]: unknown;
};

type ParsedResults = {
  rows: Record<string, unknown>[];
  summary: QuerySummary;
};

function deriveChartType(summary: QuerySummary, rowCount: number): ChartType {
  if (summary.type !== "group_by") return null;
  if (rowCount < 2) return null;

  const groupByFields = Array.isArray(summary.groupBy) ? summary.groupBy : (summary.groupBy ? [summary.groupBy] : []);
  
  if (groupByFields.length === 2) {
    return "stacked_bar";
  }

  if (groupByFields.length === 1 && TIME_FIELDS.includes(groupByFields[0])) {
    return "line";
  }

  if (rowCount <= 6) return "donut";
  return "bar";
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractSingleDimensionData(
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

function extractStackedData(
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

type ClerkChartProps = {
  queryResults: string;
  compact?: boolean;
  className?: string;
};

const TOOLTIP_STYLE = {
  backgroundColor: "#2c2824",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "12px",
  color: "#F5D6D0",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
};

export function ClerkChart({ queryResults, compact = false, className }: ClerkChartProps) {
  const parsed = useMemo<ParsedResults | null>(() => {
    try {
      return JSON.parse(queryResults);
    } catch {
      return null;
    }
  }, [queryResults]);

  if (!parsed) return null;

  const { rows, summary } = parsed;
  const chartType = deriveChartType(summary, rows.length);

  if (!chartType) return null;

  const groupByFields = Array.isArray(summary.groupBy) 
    ? summary.groupBy 
    : (summary.groupBy ? [summary.groupBy] : []);

  const height = compact ? 220 : 380;
  const fontSize = compact ? 10 : 12;

  if (chartType === "stacked_bar") {
    const { data, seriesKeys } = extractStackedData(rows, groupByFields);
    if (data.length === 0) return null;

    return (
      <div className={className} style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 16, left: compact ? -8 : 0, bottom: compact ? 50 : 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize, fill: "rgba(245,214,208,0.7)" }}
              angle={compact ? -35 : -20}
              textAnchor="end"
              interval={0}
              height={compact ? 60 : 50}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize, fill: "rgba(245,214,208,0.7)" }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              formatter={(value, name) => [value, formatLabel(String(name))]}
              labelFormatter={(label) => formatLabel(label)}
            />
            {!compact && (
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                formatter={(value) => <span style={{ color: "rgba(245,214,208,0.8)" }}>{formatLabel(value)}</span>}
              />
            )}
            {seriesKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="stack"
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                radius={index === seriesKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === "bar") {
    const data = extractSingleDimensionData(rows, groupByFields[0]);
    if (data.length === 0) return null;

    return (
      <div className={className} style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 16, left: compact ? -8 : 0, bottom: compact ? 50 : 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize, fill: "rgba(245,214,208,0.7)" }}
              angle={compact ? -35 : 0}
              textAnchor={compact ? "end" : "middle"}
              interval={0}
              height={compact ? 60 : 30}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize, fill: "rgba(245,214,208,0.7)" }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              formatter={(value) => [value, "Count"]}
              labelFormatter={(label) => formatLabel(label)}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === "donut") {
    const data = extractSingleDimensionData(rows, groupByFields[0]);
    if (data.length === 0) return null;

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
      <div className={className} style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={compact ? "45%" : "55%"}
              outerRadius={compact ? "75%" : "85%"}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              strokeWidth={0}
              label={!compact ? (props: { name?: string; percent?: number }) => 
                `${props.name || ""} (${((props.percent || 0) * 100).toFixed(0)}%)` 
                : undefined
              }
              labelLine={!compact ? { stroke: "rgba(245,214,208,0.4)", strokeWidth: 1 } : false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <text
              x="50%"
              y="48%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#F5D6D0"
              fontSize={compact ? 20 : 28}
              fontWeight="bold"
            >
              {total}
            </text>
            <text
              x="50%"
              y="58%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(245,214,208,0.6)"
              fontSize={compact ? 10 : 12}
            >
              total
            </text>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {!compact && (
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                formatter={(value) => <span style={{ color: "rgba(245,214,208,0.8)" }}>{formatLabel(value)}</span>}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === "line") {
    const data = extractSingleDimensionData(rows, groupByFields[0]);
    if (data.length === 0) return null;

    return (
      <div className={className} style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 16, left: compact ? -8 : 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize, fill: "rgba(245,214,208,0.7)" }}
              angle={-25}
              textAnchor="end"
              height={50}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize, fill: "rgba(245,214,208,0.7)" }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [value, "Count"]}
              labelFormatter={(label) => formatLabel(label)}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8B1A2A"
              strokeWidth={2.5}
              dot={{ fill: "#C9A84C", r: 5, strokeWidth: 0 }}
              activeDot={{ r: 7, fill: "#C9A84C", stroke: "#8B1A2A", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}
