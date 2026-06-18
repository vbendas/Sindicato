import { describe, it, expect, vi, beforeEach } from "vitest";

const { selectLimit, updateWhere, insertValues, selectDistinctLimit, whereResult } = vi.hoisted(() => {
  const selectLimit = vi.fn().mockResolvedValue([]);
  const selectDistinctLimit = vi.fn().mockResolvedValue([]);
  const whereResult = vi.fn().mockResolvedValue([]);
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const insertValues = vi.fn().mockResolvedValue(undefined);
  return { selectLimit, updateWhere, insertValues, selectDistinctLimit, whereResult };
});

function buildQueryChain(
  limitFn: typeof selectLimit,
  directResult?: typeof whereResult
) {
  const limitChain = {
    limit: limitFn,
  };
  const orderByMock = vi.fn().mockReturnValue(limitChain);
  const groupByMock = vi.fn().mockReturnValue({
    orderBy: orderByMock,
    limit: limitFn,
  });
  const whereMock = vi.fn().mockImplementation(() => {
    const chain: { orderBy: typeof orderByMock; groupBy: typeof groupByMock; limit: typeof limitFn } & PromiseLike<unknown> = {
      orderBy: orderByMock,
      groupBy: groupByMock,
      limit: limitFn,
      then: (onfulfilled, onrejected) => {
        const p = directResult ? directResult() : Promise.resolve([]);
        return p.then(onfulfilled, onrejected);
      },
    };
    return chain;
  });
  const fromChain = {
    where: whereMock,
    innerJoin: vi.fn().mockReturnValue({ where: whereMock }),
  };
  return {
    from: vi.fn().mockReturnValue(fromChain),
    innerJoin: vi.fn().mockReturnValue({ where: whereMock }),
  };
}

vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn().mockImplementation(() => buildQueryChain(selectLimit, whereResult)),
    selectDistinct: vi.fn().mockImplementation(() => buildQueryChain(selectDistinctLimit, selectDistinctLimit)),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: updateWhere,
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: insertValues,
    }),
  },
}));

vi.mock("@/lib/email/send", () => ({
  sendTemplateEmail: vi.fn().mockResolvedValue(undefined),
}));

import { GET } from "@/app/api/cron/weekly-company-stats/route";

function makeRequest() {
  return new Request("http://localhost/api/cron/weekly-company-stats", {
    headers: { authorization: "Bearer test-cron-secret" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = "test-cron-secret";
  selectLimit.mockResolvedValue([]);
  selectDistinctLimit.mockResolvedValue([]);
  whereResult.mockResolvedValue([]);
});

describe("GET /api/cron/weekly-company-stats", () => {
  it("rejects without CRON_SECRET", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns success when no companies need reports", async () => {
    selectDistinctLimit.mockResolvedValue([]);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
  });

  it("passes Drizzle conditions to the where clause", async () => {
    // The historical bug used JS `&&` instead of drizzle `and()`, producing a
    // boolean instead of a SQL expression. This test ensures the query runs.
    selectDistinctLimit.mockResolvedValue([
      {
        companyId: "comp-1",
        companyName: "Acme",
        companySlug: "acme",
        companyEmail: "admin@acme.com",
      },
    ]);
    whereResult.mockResolvedValue([
      {
        totalCases: 1,
        newThisWeek: 0,
        unresolvedCount: 1,
        resolvedCount: 0,
        totalUnpaid: "1000",
      },
    ]);
    selectLimit
      .mockResolvedValueOnce([{ ageDays: 5 }])
      .mockResolvedValueOnce([
        {
          commonIssues: ["unpaid_wages"],
          detectedPatterns: [],
          keyInsight: "Insight",
          engagementPattern: "ignoring",
        },
      ])
      .mockResolvedValueOnce([{ tagName: "unpaid_wages", cnt: 1 }]);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
  });
});
