import { describe, it, expect } from "vitest";
import {
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

describe("deriveChartType", () => {
  it("returns stat for count aggregation", () => {
    expect(deriveChartType({ type: "count", value: 42 }, 0)).toBe("stat");
  });

  it("returns stat for sum aggregation", () => {
    expect(deriveChartType({ type: "sum", field: "amountOwed", value: 1234 }, 0)).toBe("stat");
  });

  it("returns null for list with 0 rows", () => {
    expect(deriveChartType({ type: "list" }, 0)).toBe(null);
  });

  it("returns stat for list with 1 row", () => {
    expect(deriveChartType({ type: "list" }, 1)).toBe("stat");
  });

  it("returns bar for list with 2+ rows", () => {
    expect(deriveChartType({ type: "list" }, 5)).toBe("bar");
  });

  it("returns null for metrics with 0 rows", () => {
    expect(deriveChartType({ type: "metrics" }, 0)).toBe(null);
  });

  it("returns stat for metrics with 1 row", () => {
    expect(deriveChartType({ type: "metrics" }, 1)).toBe("stat");
  });

  it("returns bar for metrics with 2+ rows", () => {
    expect(deriveChartType({ type: "metrics" }, 5)).toBe("bar");
  });

  it("returns null for group_by with < 2 rows", () => {
    expect(deriveChartType({ type: "group_by", groupBy: "country" }, 1)).toBe(null);
  });

  it("returns stacked_bar for group_by with 2 dimensions", () => {
    expect(deriveChartType({ type: "group_by", groupBy: ["country", "caseType"] }, 5)).toBe("stacked_bar");
  });

  it("returns line for time field", () => {
    expect(deriveChartType({ type: "group_by", groupBy: "createdAt" }, 10)).toBe("line");
  });

  it("returns donut for <= 6 rows", () => {
    expect(deriveChartType({ type: "group_by", groupBy: "caseType" }, 4)).toBe("donut");
  });

  it("returns bar for > 6 rows", () => {
    expect(deriveChartType({ type: "group_by", groupBy: "country" }, 12)).toBe("bar");
  });

  it("returns null for unknown aggregation type", () => {
    expect(deriveChartType({ type: "unknown" }, 5)).toBe(null);
  });
});

describe("formatLabel", () => {
  it("replaces underscores with spaces and title-cases", () => {
    expect(formatLabel("unpaid_wages")).toBe("Unpaid Wages");
  });
  it("title-cases the first letter of a single-word label", () => {
    expect(formatLabel("amountOwed")).toBe("AmountOwed");
  });
});

describe("extractSingleDimensionData", () => {
  it("maps rows to {name, value} using the first non-groupBy column as value", () => {
    const rows = [
      { country: "US", count: 10 },
      { country: "PT", count: 4 },
    ];
    expect(extractSingleDimensionData(rows, "country")).toEqual([
      { name: "US", value: 10 },
      { name: "PT", value: 4 },
    ]);
  });
});

describe("extractStackedData", () => {
  it("builds series and primary groups", () => {
    const rows = [
      { country: "US", caseType: "unpaid_wages", count: 5 },
      { country: "US", caseType: "retaliation", count: 2 },
      { country: "PT", caseType: "unpaid_wages", count: 3 },
    ];
    const { data, seriesKeys } = extractStackedData(rows, ["country", "caseType"]);
    expect(seriesKeys.sort()).toEqual(["retaliation", "unpaid_wages"]);
    expect(data).toEqual([
      { name: "US", unpaid_wages: 5, retaliation: 2 },
      { name: "PT", unpaid_wages: 3 },
    ]);
  });
});

describe("pickListDimension", () => {
  it("prefers caseType when present", () => {
    const rows = [
      { id: "a", caseType: "unpaid_wages", country: "US" },
      { id: "b", caseType: "retaliation", country: "US" },
      { id: "c", caseType: "unpaid_wages", country: "PT" },
    ];
    expect(pickListDimension(rows)).toEqual({ dimension: "caseType", isAuto: true });
  });

  it("falls back to country if caseType is absent", () => {
    const rows = [
      { id: "a", country: "US" },
      { id: "b", country: "PT" },
      { id: "c", country: "BR" },
    ];
    expect(pickListDimension(rows)).toEqual({ dimension: "country", isAuto: true });
  });

  it("ignores time fields and id/story columns when picking fallback", () => {
    const rows = [
      { id: "a", createdAt: "2026-01-01", story: "long..." },
      { id: "b", createdAt: "2026-01-02", story: "long..." },
    ];
    expect(pickListDimension(rows)).toEqual({ dimension: "", isAuto: true });
  });
});

describe("aggregateListRows", () => {
  it("counts occurrences per dimension value, sorted desc", () => {
    const rows = [
      { caseType: "unpaid_wages" },
      { caseType: "unpaid_wages" },
      { caseType: "retaliation" },
    ];
    expect(aggregateListRows(rows, "caseType")).toEqual([
      { name: "unpaid_wages", value: 2 },
      { name: "retaliation", value: 1 },
    ]);
  });
});

describe("pickMetricsDimension", () => {
  it("picks entityType when present", () => {
    const rows = [{ entityType: "case" }, { entityType: "company" }];
    expect(pickMetricsDimension(rows)).toEqual({ dimension: "entityType", isAuto: true });
  });

  it("falls back to entityId", () => {
    const rows = [{ entityId: "abc" }];
    expect(pickMetricsDimension(rows)).toEqual({ dimension: "entityId", isAuto: true });
  });

  it("returns null when neither present", () => {
    const rows = [{ foo: "bar" }];
    expect(pickMetricsDimension(rows)).toEqual({ dimension: null, isAuto: true });
  });
});

describe("aggregateMetricsRows", () => {
  it("sums viewsTotal per dimension value, sorted desc", () => {
    const rows = [
      { entityType: "case", viewsTotal: 100 },
      { entityType: "case", viewsTotal: 50 },
      { entityType: "company", viewsTotal: 200 },
    ];
    expect(aggregateMetricsRows(rows, "entityType")).toEqual([
      { name: "company", value: 200 },
      { name: "case", value: 150 },
    ]);
  });
});

describe("formatStatNumber", () => {
  it("formats small integers with locale separators", () => {
    expect(formatStatNumber(1234)).toBe("1,234");
  });
  it("formats K for >= 10K", () => {
    expect(formatStatNumber(15000)).toBe("15.0K");
  });
  it("formats M for >= 1M", () => {
    expect(formatStatNumber(2_500_000)).toBe("2.5M");
  });
  it("keeps decimals to 2 places for non-integers under 10K", () => {
    expect(formatStatNumber(1234.56)).toBe("1234.56");
  });
});
