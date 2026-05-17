import { z } from "zod/v4";

export const claimTypesSchema = z.object({
  unpaidWages: z.boolean().optional(),
  unfairPractices: z.boolean().optional(),
  retaliation: z.boolean().optional(),
  other: z.boolean().optional(),
});

export const caseSubmissionSchema = z
  .object({
    displayName: z.string().min(1).max(100),
    country: z.string().min(1).max(100),
    projects: z.string().min(1),
    dateRange: z.string().min(1).max(200),
    amountOwed: z.string().min(1).regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount"),
    currency: z.string().length(3).default("EUR"),
    contactAttempts: z.number().int().min(0),
    story: z.string().min(100).max(5000),
    email: z.email(),
    companySlug: z.string().min(1).max(100),
    claimTypes: claimTypesSchema.refine(
      (v) => v.unpaidWages || v.unfairPractices || v.retaliation || v.other,
      { message: "Select at least one claim type" }
    ),
    otherDescription: z.string().optional(),
    attestation: z.literal(true),
    consentLegal: z.literal(true),
    consentCollective: z.literal(true),
  })
  .refine(
    (d) => !(d.claimTypes.other && !d.otherDescription?.trim()),
    { message: "Please provide a description for 'Other' claim type", path: ["otherDescription"] }
  );

export const companySlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens");

export const emailSchema = z.email();

export type CaseSubmission = z.infer<typeof caseSubmissionSchema>;
