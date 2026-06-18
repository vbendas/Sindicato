import { describe, it, expect, vi, beforeEach } from "vitest";

const { selectLimit } = vi.hoisted(() => {
  const selectLimit = vi.fn().mockResolvedValue([]);
  return { selectLimit };
});

vi.mock("@/lib/db/client", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: selectLimit,
          }),
        }),
      }),
    },
  };
});

vi.mock("@/lib/auth/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, retryAfterMs: 0 }),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

import { GET } from "@/app/api/ai/company-summary/route";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/auth/rate-limit";

function makeRequest(slug: string, ip = "1.2.3.4") {
  return new Request(`http://localhost/api/ai/company-summary?company=${slug}`, {
    headers: { "x-forwarded-for": ip },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  (rateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: true, retryAfterMs: 0 });
  (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null);
  selectLimit.mockResolvedValue([]);
});

describe("GET /api/ai/company-summary", () => {
  it("returns cached summary without auth", async () => {
    selectLimit
      .mockResolvedValueOnce([
        {
          id: "comp-1",
          name: "Acme",
          slug: "acme",
          vertical: "gig",
        },
      ])
      .mockResolvedValueOnce([
        {
          summary: "Cached summary",
          commonIssues: ["unpaid_wages"],
          detectedPatterns: [],
          resolutionRate: "10%",
          engagementPattern: "ignoring",
          keyInsight: "Key insight",
          expiresAt: new Date(Date.now() + 3600_000),
        },
      ]);

    const res = await GET(makeRequest("acme"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.summary).toBe("Cached summary");
  });

  it("requires authentication to generate a new summary", async () => {
    selectLimit
      .mockResolvedValueOnce([
        { id: "comp-1", name: "Acme", slug: "acme", vertical: "gig" },
      ])
      .mockResolvedValueOnce([]);

    const res = await GET(makeRequest("acme"));
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    (rateLimit as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ allowed: false, retryAfterMs: 30_000 });

    const res = await GET(makeRequest("acme"));
    expect(res.status).toBe(429);
  });
});
