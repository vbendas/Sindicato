import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRateLimit } = vi.hoisted(() => {
  return { mockRateLimit: vi.fn().mockResolvedValue({ allowed: true, retryAfterMs: 0 }) };
});

vi.mock("@/lib/ai/openrouter", () => ({
  callOpenRouter: vi.fn(),
  getWritingModel: vi.fn().mockReturnValue("test-model"),
  getReportModel: vi.fn().mockReturnValue("test-model"),
}));

vi.mock("@/lib/auth/rate-limit", () => ({
  rateLimit: mockRateLimit,
}));

import { POST as writingPost } from "@/app/api/ai/writing-assistant/route";
import { POST as strengthPost } from "@/app/api/ai/case-strength/route";
import { callOpenRouter } from "@/lib/ai/openrouter";

function mockRequest(body: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost/api/ai/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/writing-assistant", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0 });
  });

  it("rejects invalid input", async () => {
    const req = mockRequest({ rawStory: "hi" });
    const res = await writingPost(req);
    expect(res.status).toBe(400);
  });

  it("returns suggestion from OpenRouter", async () => {
    (callOpenRouter as ReturnType<typeof vi.fn>).mockResolvedValue(
      "Here is a clearer version of your story."
    );

    const req = mockRequest({
      displayName: "Worker",
      country: "Brazil",
      projects: "CC Review",
      dateRange: "2024",
      amountOwed: "5000",
      currency: "BRL",
      contactAttempts: 3,
      claimTypes: ["unpaidWages"],
      rawStory: "A".repeat(50),
    });

    const res = await writingPost(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.suggestion).toContain("clearer version");
  });
});

describe("POST /api/ai/case-strength", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0 });
  });

  it("rejects invalid input", async () => {
    const req = mockRequest({});
    const res = await strengthPost(req);
    expect(res.status).toBe(400);
  });

  it("returns validated strength evaluation", async () => {
    (callOpenRouter as ReturnType<typeof vi.fn>).mockResolvedValue(
      JSON.stringify({
        elements: [
          { name: "Factual specificity", passed: true, note: "Good detail" },
          { name: "Timeline clarity", passed: true, note: "Clear" },
          { name: "Monetary claim specificity", passed: true, note: "Specific" },
          { name: "Contact attempt documentation", passed: false, note: "Not mentioned" },
          { name: "Witness or evidence mention", passed: false, note: "None" },
          { name: "Emotional credibility", passed: true, note: "Authentic" },
          { name: "Consistency across fields", passed: true, note: "Consistent" },
          { name: "Legal relevance", passed: true, note: "Relevant" },
        ],
        score: 6,
        maxScore: 8,
        summary: "A solid case with good specifics.",
      })
    );

    const req = mockRequest({
      displayName: "Worker",
      country: "Brazil",
      projects: "CC Review",
      dateRange: "2024",
      amountOwed: "5000",
      currency: "BRL",
      contactAttempts: 3,
      claimTypes: ["unpaidWages"],
      story: "My story about unpaid wages.",
    });

    const res = await strengthPost(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.score).toBe(6);
    expect(json.data.elements).toHaveLength(8);
  });

  it("rejects malformed AI response", async () => {
    (callOpenRouter as ReturnType<typeof vi.fn>).mockResolvedValue(
      "No JSON here at all"
    );

    const req = mockRequest({
      displayName: "Worker",
      country: "Brazil",
      projects: "CC Review",
      dateRange: "2024",
      amountOwed: "5000",
      currency: "BRL",
      contactAttempts: 3,
      claimTypes: ["unpaidWages"],
      story: "My story.",
    });

    const res = await strengthPost(req);
    expect(res.status).toBe(500);
  });
});
