import { describe, it, expect } from "vitest";
import {
  caseSubmissionSchema,
  companySlugSchema,
  emailSchema,
} from "@/lib/utils/schemas";

const validCase = {
  vertical: "remote",
  displayName: "Victor",
  country: "Portugal",
  project: "CC Review, CHP Claude Code",
  dateRange: "March 2024 - September 2024",
  amountOwed: "5000",
  currency: "EUR",
  contactAttempts: 12,
  story: Array.from({ length: 101 }, (_, i) => `word${i}`).join(" "),
  email: "test@example.com",
  companySlug: "alignerr",
  optInSolicitor: false,
  optInCollective: false,
  optInCompanyNotify: true,
  attested: true as const,
};

describe("caseSubmissionSchema", () => {
  it("parses a valid full submission", () => {
    const result = caseSubmissionSchema.safeParse(validCase);
    expect(result.success).toBe(true);
  });

  it("defaults currency to EUR when omitted", () => {
    const { currency, ...withoutCurrency } = validCase;
    const result = caseSubmissionSchema.safeParse(withoutCurrency);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("EUR");
    }
  });

  it("rejects story shorter than 100 words", () => {
    const data = { ...validCase, story: "hi there" };
    const result = caseSubmissionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("accepts story exactly 100 words", () => {
    const story = Array.from({ length: 100 }, (_, i) => `word${i}`).join(" ");
    const data = { ...validCase, story };
    const result = caseSubmissionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("accepts story exactly 500 words", () => {
    const story = Array.from({ length: 500 }, (_, i) => `word${i}`).join(" ");
    const data = { ...validCase, story };
    const result = caseSubmissionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects story over 500 words", () => {
    const story = Array.from({ length: 501 }, (_, i) => `word${i}`).join(" ");
    const data = { ...validCase, story };
    const result = caseSubmissionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("accepts missing contact attempts (computed from timeline)", () => {
    const { contactAttempts, ...withoutContact } = validCase;
    const result = caseSubmissionSchema.safeParse(withoutContact);
    expect(result.success).toBe(true);
  });

  it("accepts zero contact attempts", () => {
    const data = { ...validCase, contactAttempts: 0 };
    const result = caseSubmissionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects attestation: false", () => {
    const data = { ...validCase, attested: false as true };
    const result = caseSubmissionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const data = { ...validCase, email: "not-an-email" };
    const result = caseSubmissionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric amountOwed", () => {
    const data = { ...validCase, amountOwed: "hello" };
    const result = caseSubmissionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("accepts amountOwed with decimals", () => {
    const data = { ...validCase, amountOwed: "5000.50" };
    const result = caseSubmissionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("accepts amountOwed as integer string", () => {
    const data = { ...validCase, amountOwed: "5000" };
    const result = caseSubmissionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects amountOwed with more than 2 decimal places", () => {
    const data = { ...validCase, amountOwed: "5000.123" };
    const result = caseSubmissionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects empty string amountOwed", () => {
    const data = { ...validCase, amountOwed: "" };
    const result = caseSubmissionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const { displayName, ...incomplete } = validCase;
    const result = caseSubmissionSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });
});

describe("companySlugSchema", () => {
  it("accepts valid slug", () => {
    expect(companySlugSchema.safeParse("acme-corp").success).toBe(true);
  });

  it("accepts slug with numbers", () => {
    expect(companySlugSchema.safeParse("company123").success).toBe(true);
  });

  it("rejects uppercase letters", () => {
    expect(companySlugSchema.safeParse("ACME").success).toBe(false);
  });

  it("rejects spaces", () => {
    expect(companySlugSchema.safeParse("acme corp").success).toBe(false);
  });

  it("rejects special characters", () => {
    expect(companySlugSchema.safeParse("acme_corp").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(companySlugSchema.safeParse("").success).toBe(false);
  });
});

describe("emailSchema", () => {
  it("accepts valid email", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
  });

  it("rejects string without @", () => {
    expect(emailSchema.safeParse("notanemail").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
  });

  it("accepts subdomain email", () => {
    expect(emailSchema.safeParse("user@mail.example.co.uk").success).toBe(
      true
    );
  });
});
