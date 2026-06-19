import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/client", () => {
  const makeTxInsert = () => {
    const chain = {
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "case-tx" }]),
        catch: vi.fn().mockResolvedValue(undefined),
      }),
    };
    return chain;
  };
  const makeTxUpdate = () => ({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  });
  return {
    db: {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      transaction: vi.fn().mockImplementation(async (cb: any) => {
        const tx = {
          insert: vi.fn().mockImplementation(() => makeTxInsert()),
          update: vi.fn().mockImplementation(() => makeTxUpdate()),
        };
        return cb(tx);
      }),
    },
  };
});

vi.mock("@/lib/email/notifications", () => ({
  notifyCompanyNewCase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/email/aliases", () => ({
  createCaseAlias: vi.fn().mockResolvedValue("test-alias"),
}));

vi.mock("franc", () => ({
  franc: vi.fn().mockReturnValue("eng"),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", email: "test@example.com" } }),
}));

vi.mock("@/lib/utils/turnstile", () => ({
  verifyTurnstileToken: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/auth/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, retryAfterMs: 0 }),
}));

import { POST, GET } from "@/app/api/cases/route";
import { db } from "@/lib/db/client";

const validBody = {
  vertical: "remote",
  displayName: "Worker",
  companyName: "Acme Corp",
  country: "Brazil",
  project: "CC Review",
  amountOwed: "5000",
  currency: "BRL",
  story: Array.from({ length: 100 }, (_, i) => `word${i}`).join(" "),
  email: "worker@example.com",
  companySlug: "acme",
  optInSolicitor: false,
  optInCollective: false,
  optInCompanyNotify: true,
  attested: true,
  turnstileToken: "test-token",
};

function mockRequest(body: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost/api/cases", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

function mockGetRequest(url: string) {
  return new Request(url, { method: "GET" });
}

describe("POST /api/cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid body with 400", async () => {
    const req = mockRequest({ displayName: "" });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("rejects missing attestation", async () => {
    const req = mockRequest({ ...validBody, attested: false });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects submission without companySlug", async () => {
    const body = { ...validBody };
    delete (body as Record<string, unknown>).companySlug;

    const req = mockRequest(body);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("accepts optInSolicitor as string (coerced to boolean)", async () => {
    const mockCompany = { id: "company-1", slug: "acme", name: "Acme Corp", contactEmails: [] };
    const mockCase = { id: "case-2" };

    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockCompany]),
        }),
        limit: vi.fn().mockResolvedValue([mockCompany]),
      }),
    }));

    (db.insert as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCase]),
        }),
      })
      .mockReturnValue({
        values: vi.fn().mockReturnValue({
          catch: vi.fn().mockResolvedValue(undefined),
        }),
      });

    (db.update as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }));

    const req = mockRequest({ ...validBody, optInSolicitor: "true" });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

describe("GET /api/cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated cases with redaction", async () => {
    const mockRows = [
      {
        id: "case-1",
        displayName: "John Doe",
        email: "john@example.com",
        country: "Portugal",
        project: "CC Review",
        dateRange: "2024",
        amountOwed: "5000",
        currency: "EUR",
        ageRange: null,
        sex: null,
        contactAlias: null,
        story: "short",
        storyTranslated: null,
        translationLanguage: null,
        vertical: "remote",
        createdAt: new Date(),
        companyName: "Acme",
        companySlug: "acme",
      },
    ];

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue(mockRows),
    };

    (db.select as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 1 }]),
          }),
        }),
      })
      .mockReturnValueOnce(selectChain)
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

    const req = mockGetRequest("http://localhost/api/cases?page=1&limit=20");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.cases).toHaveLength(1);
    expect(json.data.cases[0].displayName).toBe("J*** D***");
    expect(json.data.pagination.total).toBe(1);
  });
});
