import { z } from "zod/v4";

export const caseSubmissionSchema = z
  .object({
    vertical: z.enum(["remote", "gig"]),
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
    contactAttempts: z.coerce.number().int().min(0),
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

export const companySlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens");

export const emailSchema = z.email();

export type CaseSubmission = z.infer<typeof caseSubmissionSchema>;
