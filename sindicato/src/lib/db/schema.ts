import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  numeric,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const caseStatusEnum = pgEnum("case_status", [
  "active",
  "resolved",
  "deleted",
]);

export const reportTypeEnum = pgEnum("report_type", ["lawyer", "company"]);

export const workers = pgTable("workers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  publicEmail: varchar("public_email", { length: 255 }),
  websiteUrl: varchar("website_url", { length: 500 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  workerId: uuid("worker_id")
    .references(() => workers.id)
    .notNull(),
  companyId: uuid("company_id")
    .references(() => companies.id)
    .notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  projects: text("projects").notNull(),
  dateRange: varchar("date_range", { length: 200 }).notNull(),
  amountOwed: numeric("amount_owed", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
  contactAttempts: integer("contact_attempts").notNull(),
  story: text("story").notNull(),
  storyTranslated: text("story_translated"),
  translationLanguage: varchar("translation_language", { length: 10 }),
  email: varchar("email", { length: 255 }).notNull(),
  claimTypes: jsonb("claim_types").$type<{
    unpaidWages?: boolean;
    unfairPractices?: boolean;
    retaliation?: boolean;
    other?: boolean;
  }>().notNull(),
  otherDescription: text("other_description"),
  status: caseStatusEnum("status").default("active").notNull(),
  attestation: boolean("attestation").notNull(),
  consentLegal: boolean("consent_legal").notNull(),
  consentCollective: boolean("consent_collective").notNull(),
  resolutionFeedback: text("resolution_feedback"),
  lastFollowUpSentAt: timestamp("last_follow_up_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companyVerifications = pgTable("company_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .references(() => companies.id)
    .notNull(),
  employeeName: varchar("employee_name", { length: 255 }).notNull(),
  employeeRole: varchar("employee_role", { length: 255 }).notNull(),
  officialEmail: varchar("official_email", { length: 255 }).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  nonRetaliationSigned: boolean("non_retaliation_signed")
    .default(false)
    .notNull(),
  signedAgreementUrl: varchar("signed_agreement_url", { length: 500 }),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dataAccessLogs = pgTable(
  "data_access_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .references(() => cases.id)
      .notNull(),
    accessorId: uuid("accessor_id")
      .references(() => companyVerifications.id)
      .notNull(),
    accessedAt: timestamp("accessed_at").defaultNow().notNull(),
    workerNotified: boolean("worker_notified").default(false).notNull(),
  },
  (t) => [uniqueIndex("data_access_unique").on(t.caseId, t.accessorId)]
);

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .references(() => companies.id)
    .notNull(),
  reportType: reportTypeEnum("report_type").notNull(),
  content: text("content").notNull(),
  pdfUrl: varchar("pdf_url", { length: 500 }),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    code: varchar("code", { length: 6 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("verification_tokens_email_code").on(t.email, t.code)]
);
