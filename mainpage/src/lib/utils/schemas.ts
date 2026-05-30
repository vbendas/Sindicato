import { z } from "zod/v4";

// Legacy schema kept for backward compatibility with any existing integrations
export const caseSubmissionSchema = z
  .object({
    vertical: z.string().min(1).max(50),
    displayName: z.string().min(1).max(100),
    country: z.string().max(100).optional(),
    ageRange: z.enum(["18-24", "25-34", "35-44", "45+"]).optional(),
    sex: z.string().max(20).optional(),
    project: z.string().max(500).optional(),
    dateRange: z.string().min(1).max(200),
    amountOwed: z.string().min(1).regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount").refine(
      (v) => parseFloat(v) <= 99999999.99,
      { message: "Amount exceeds maximum allowed value" }
    ),
    currency: z.string().length(3).default("EUR"),
    contactAttempts: z.coerce.number().int().min(0).optional(),
    story: z.string().min(1).max(10000).refine(
      (s) => {
        const words = s.trim().split(/\s+/).filter(Boolean).length;
        return words >= 100 && words <= 500;
      },
      { message: "Story must be between 100 and 500 words" }
    ),
    email: z.email(),
    companySlug: z.string().min(1).max(100),
    optInSolicitor: z.coerce.boolean().default(false),
    optInCollective: z.coerce.boolean().default(false),
    optInCompanyNotify: z.coerce.boolean().default(true),
    attested: z.literal(true, { message: "You must confirm that your account is truthful and based on your personal experience" }),
  });

// V2 schema used by the new multi-step filing wizard
export const timelineEventInputSchema = z.object({
  eventType: z.enum(["email_sent", "no_response", "canned_response", "chat_support", "phone_call", "legal_notice", "payment_partial", "case_updated", "resolved", "other"]),
  eventDate: z.string(),
  description: z.string().min(1).max(2000),
  responseReceived: z.coerce.boolean().default(false),
});

export const caseSubmissionV2Schema = z.object({
  vertical: z.string().min(1).max(50),
  caseType: z.enum(["unpaid_wages", "late_payment", "sudden_deactivation", "unfair_review", "predatory_practices", "harassment", "retaliation", "contract_violation", "data_privacy", "other"]).default("other"),
  displayName: z.string().min(1).max(100),
  companySlug: z.string().min(1).max(100),
  companyName: z.string().min(1).max(255),
  country: z.string().max(100).optional(),
  ageRange: z.string().max(20).optional(),
  sex: z.string().max(20).optional(),
  project: z.string().max(500).optional(),
  workDateStart: z.string().optional(),
  workDateEnd: z.string().optional(),
  amountOwed: z.string().optional().refine(
    (v) => !v || /^\d+(\.\d{1,2})?$/.test(v),
    { message: "Must be a valid amount" }
  ).refine(
    (v) => !v || parseFloat(v) <= 99999999.99,
    { message: "Amount exceeds maximum allowed value" }
  ),
  currency: z.string().length(3).default("USD"),
  story: z.string().min(1).max(10000).refine(
    (s) => {
      const words = s.trim().split(/\s+/).filter(Boolean).length;
      return words >= 100 && words <= 500;
    },
    { message: "Story must be between 100 and 500 words" }
  ),
  email: z.email(),
  optInSolicitor: z.coerce.boolean().default(true),
  optInCollective: z.coerce.boolean().default(true),
  optInCompanyNotify: z.coerce.boolean().default(true),
  optInCompanyContact: z.coerce.boolean().default(true),
  attested: z.literal(true, { message: "You must confirm that your account is truthful and based on your personal experience" }),
  timelineEvents: z.array(timelineEventInputSchema).default([]),
  selectedTags: z.array(z.string()).default([]),
  aiTags: z
    .array(
      z.object({
        category: z.string(),
        tagName: z.string(),
        confidence: z.number(),
        sourceText: z.string(),
      })
    )
    .default([]),
  turnstileToken: z.string().optional(),
});

export const companySlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens");

export const emailSchema = z.email();

export type CaseSubmission = z.infer<typeof caseSubmissionSchema>;
export type CaseSubmissionV2 = z.infer<typeof caseSubmissionV2Schema>;
