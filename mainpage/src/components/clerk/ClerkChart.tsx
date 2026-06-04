"use client";

import { useMemo, type ReactNode } from "react";
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
import { Hash, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import {
  CHART_COLORS,
  TIME_FIELDS,
  type ChartType,
  type QuerySummary,
  type ParsedResults,
  deriveChartType,
  formatLabel,
  extractSingleDimensionData,
  extractStackedData,
  pickListDimension,
  aggregateListRows,
  pickMetricsDimension,
  aggregateMetricsRows,
  formatStatNumber,
} from "@/lib/clerk/chart-helpers";

export type ChartLabels = {
  title?: string;
  total?: string;
  tooltipCount?: string;
  statCount?: string;
  statTotalUnpaid?: string;
  statSum?: string;
  statRecords?: string;
  statViews?: string;
  statVisitors?: string;
  statShares?: string;
  autoDimension?: string;
  noData?: string;
};

const DEFAULT_LABELS: Required<ChartLabels> = {
  title: "Chart",
  total: "Total",
  tooltipCount: "Count",
  statCount: "Total cases",
  statTotalUnpaid: "Total unpaid",
  statSum: "Sum",
  statRecords: "Records",
  statViews: "Total views",
  statVisitors: "Visitors",
  statShares: "Shares",
  autoDimension: "(auto)",
  noData: "No data to display",
};

type ClerkChartProps = {
  queryResults: string;
  compact?: boolean;
  className?: string;
  labels?: ChartLabels;
};

const TOOLTIP_STYLE = {
  backgroundColor: "#2c2824",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "12px",
  color: "#F5D6D0",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
};

export function ClerkChart({ queryResults, compact = false, className, labels }: ClerkChartProps) {
  const L = { ...DEFAULT_LABELS, ...(labels ?? {}) };

  const parsed = useMemo<ParsedResults | null>(() => {
    try {
      return JSON.parse(queryResults);
    } catch {
      return null;
    }
  }, [queryResults]);

  if (!parsed) return null;

  const { rows, summary } = parsed;
  const chartType: ChartType = deriveChartType(summary, rows.length);

  if (!chartType) return null;

  const groupByFields = Array.isArray(summary.groupBy)
    ? summary.groupBy
    : summary.groupBy
    ? [summary.groupBy]
    : [];

  const height = compact ? 220 : 380;
  const fontSize = compact ? 10 : 12;

  if (chartType === "stat") {
    return <StatCard summary={summary} rows={rows} compact={compact} className={className} L={L} />;
  }

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
    let data: { name: string; value: number }[] = [];
    let chartLabel = L.title;
    let isAuto = false;

    if (summary.type === "list") {
      const { dimension, isAuto: auto } = pickListDimension(rows);
      if (!dimension) return null;
      data = aggregateListRows(rows, dimension);
      chartLabel = `${formatLabel(dimension)} ${auto ? L.autoDimension : ""}`.trim();
      isAuto = auto;
    } else if (summary.type === "metrics") {
      const { dimension, isAuto: auto } = pickMetricsDimension(rows);
      if (!dimension) return null;
      data = aggregateMetricsRows(rows, dimension);
      chartLabel = `${L.statViews} ${auto ? L.autoDimension : ""}`.trim();
      isAuto = auto;
    } else if (summary.type === "group_by" && groupByFields.length === 1) {
      data = extractSingleDimensionData(rows, groupByFields[0]);
      chartLabel = formatLabel(groupByFields[0]);
    } else {
      return null;
    }

    if (data.length === 0) return null;

    return (
      <div className={className}>
        {!compact && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <BarChart3 size={12} className="text-sindicato-warm-white/40" />
            <p className="text-xs text-sindicato-warm-white/50">{chartLabel}</p>
            {isAuto && (
              <span className="text-[10px] text-sindicato-warm-white/30 italic">{L.autoDimension}</span>
            )}
          </div>
        )}
        <div style={{ width: "100%", height }}>
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
                formatter={(value) => [value, L.tooltipCount]}
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
              label={
                !compact
                  ? (props: { name?: string; percent?: number }) =>
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
              {L.total}
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
              formatter={(value) => [value, L.tooltipCount]}
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

function StatCard({
  summary,
  rows,
  compact,
  className,
  L,
}: {
  summary: QuerySummary;
  rows: Record<string, unknown>[];
  compact: boolean;
  className?: string;
  L: Required<ChartLabels>;
}) {
  let value: number;
  let label: string;
  let icon: ReactNode;
  let isCurrency = false;

  if (summary.type === "count") {
    value = Number(summary.value ?? 0);
    label = L.statCount;
    icon = <Hash size={compact ? 14 : 18} />;
  } else if (summary.type === "sum") {
    value = Number(summary.value ?? 0);
    isCurrency = summary.field === "amountOwed";
    label = summary.field === "amountOwed" ? L.statTotalUnpaid : L.statSum;
    icon = isCurrency ? <DollarSign size={compact ? 14 : 18} /> : <TrendingUp size={compact ? 14 : 18} />;
  } else if (summary.type === "metrics" && rows.length === 1) {
    const row = rows[0];
    value = Number(row.viewsTotal ?? 0);
    label = L.statViews;
    icon = <BarChart3 size={compact ? 14 : 18} />;
  } else if (summary.type === "list" && rows.length === 1) {
    const row = rows[0];
    value = Number(row.amountOwed ?? 0);
    isCurrency = true;
    label = L.statTotalUnpaid;
    icon = <DollarSign size={compact ? 14 : 18} />;
  } else {
    return null;
  }

  const display = isCurrency ? `$${formatStatNumber(value)}` : formatStatNumber(value);
  const height = compact ? 80 : 120;

  return (
    <div className={className} style={{ width: "100%", height }}>
      <div className="h-full w-full rounded-2xl bg-sindicato-bordeaux/15 border border-sindicato-bordeaux/30 backdrop-blur-xl p-3 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-sindicato-bordeaux/30 flex items-center justify-center text-sindicato-warm-white shrink-0">
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className={`font-bold text-sindicato-warm-white ${
              compact ? "text-xl" : "text-3xl"
            } leading-none tabular-nums`}
          >
            {display}
          </span>
          <span className="text-xs text-sindicato-warm-white/60 mt-1 truncate">{label}</span>
        </div>
      </div>
    </div>
  );
}

export { TIME_FIELDS };
