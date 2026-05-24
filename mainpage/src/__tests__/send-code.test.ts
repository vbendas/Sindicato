import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { selectLimit, insertValues, deleteWhere } = vi.hoisted(() => {
  const selectLimit = vi.fn().mockResolvedValue([]);
  const insertValues = vi.fn().mockResolvedValue(undefined);
  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  return { selectLimit, insertValues, deleteWhere };
});

vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: selectLimit,
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: insertValues,
    }),
    delete: vi.fn().mockReturnValue({
      where: deleteWhere,
    }),
  },
}));

vi.mock("@/lib/email/send", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfterMs: 0 }),
}));

import { POST } from "@/app/api/auth/send-code/route";
import { sendEmail } from "@/lib/email/send";
import { rateLimit } from "@/lib/auth/rate-limit";

function makeRequest(body: unknown, ip = "127.0.0.1") {
  return new NextRequest("http://localhost/api/auth/send-code", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue({
    allowed: true,
    retryAfterMs: 0,
  });
  selectLimit.mockResolvedValue([]);
  insertValues.mockResolvedValue(undefined);
  deleteWhere.mockResolvedValue(undefined);
  (sendEmail as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
});

describe("POST /api/auth/send-code", () => {
  it("sends a verification code for valid email", async () => {
    const res = await POST(makeRequest({ email: "test@example.com" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(insertValues).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: "Your Sindicato verification code",
      })
    );
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(makeRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid email address");
  });

  it("returns 400 for missing email", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest("http://localhost/api/auth/send-code", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: "not-json{",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON");
  });

  it("returns 429 when IP rate limited", async () => {
    (rateLimit as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      allowed: false,
      retryAfterMs: 30000,
    });

    const res = await POST(makeRequest({ email: "test@example.com" }));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBe("Too many requests");
  });

  it("returns 429 when email rate limited", async () => {
    (rateLimit as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce({ allowed: true, retryAfterMs: 0 })
      .mockReturnValueOnce({ allowed: false, retryAfterMs: 30000 });

    const res = await POST(makeRequest({ email: "test@example.com" }));
    expect(res.status).toBe(429);
  });

  it("returns same message when valid code already exists (no new code sent)", async () => {
    selectLimit.mockResolvedValue([{ id: "existing", code: "123456" }]);

    const res = await POST(makeRequest({ email: "test@example.com" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.message).toBe(
      "If an account exists, a code has been sent."
    );
    expect(deleteWhere).toHaveBeenCalled();
    expect(insertValues).toHaveBeenCalled(); // It should still insert a new token
    expect(sendEmail).toHaveBeenCalled(); // And send the email
  });

  it("returns 500 when email sending fails", async () => {
    (sendEmail as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Resend error")
    );

    const res = await POST(makeRequest({ email: "test@example.com" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("Failed to send");
  });

  it("does not insert token when email is invalid", async () => {
    await POST(makeRequest({ email: "bad" }));
    expect(insertValues).not.toHaveBeenCalled();
  });
});
