import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { NextRequest } from "next/server";

const { selectWhere, updateSet } = vi.hoisted(() => {
  const selectWhere = vi.fn().mockResolvedValue([]);
  const updateSet = vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue(undefined),
  });
  return { selectWhere, updateSet };
});

vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: selectWhere,
          }),
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: updateSet,
    }),
  },
}));

vi.mock("@/lib/auth/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, retryAfterMs: 0 }),
}));

import { POST } from "@/app/api/auth/verify-code/route";
import { rateLimit } from "@/lib/auth/rate-limit";

function makeRequest(body: unknown, ip = "127.0.0.1") {
  return new NextRequest("http://localhost/api/auth/verify-code", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

beforeEach(() => {
  vi.clearAllMocks();
  (rateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({
    allowed: true,
    retryAfterMs: 0,
  });
  selectWhere.mockResolvedValue([]);
  updateSet.mockReturnValue({
    where: vi.fn().mockResolvedValue(undefined),
  });
});

describe("POST /api/auth/verify-code", () => {
  it("rejects invalid email or code format", async () => {
    const res = await POST(makeRequest({ email: "bad", code: "123" }));
    expect(res.status).toBe(400);
  });

  it("returns 401 for non-matching code", async () => {
    selectWhere.mockResolvedValue([
      { id: "token-1", codeHash: hashCode("999999") },
    ]);

    const res = await POST(
      makeRequest({ email: "test@example.com", code: "123456" })
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 and marks token as used for valid code", async () => {
    selectWhere.mockResolvedValue([
      { id: "token-1", codeHash: hashCode("123456") },
    ]);

    const res = await POST(
      makeRequest({ email: "test@example.com", code: "123456" })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(updateSet).toHaveBeenCalled();
    const setArgs = updateSet.mock.calls[0][0];
    expect(setArgs).toHaveProperty("usedAt");
  });

  it("rejects code with no codeHash (legacy plaintext token)", async () => {
    selectWhere.mockResolvedValue([
      { id: "token-1", codeHash: null },
    ]);

    const res = await POST(
      makeRequest({ email: "test@example.com", code: "123456" })
    );
    expect(res.status).toBe(401);
  });

  it("returns 429 when IP rate limited", async () => {
    (rateLimit as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      allowed: false,
      retryAfterMs: 30000,
    });

    const res = await POST(
      makeRequest({ email: "test@example.com", code: "123456" })
    );
    expect(res.status).toBe(429);
  });
});
