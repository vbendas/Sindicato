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

export const caseTypeEnum = pgEnum("case_type", [
  "unpaid_wages",
  "late_payment",
  "sudden_deactivation",
  "unfair_review",
  "predatory_practices",
  "harassment",
  "retaliation",
  "contract_violation",
  "data_privacy",
  "other",
]);

export const timelineDirectionEnum = pgEnum("timeline_direction", [
  "worker_to_company",
  "company_to_worker",
  "system",
]);

export const timelineEventTypeEnum = pgEnum("timeline_event_type", [
  "email_sent",
  "no_response",
  "canned_response",
  "chat_support",
  "phone_call",
  "legal_notice",
  "payment_partial",
  "case_updated",
  "resolved",
  "other",
]);

export const caseStatusEnum = pgEnum("case_status", [
  "active",
  "resolved",
  "deleted",
]);

export const resolutionStatusEnum = pgEnum("resolution_status", [
  "none",
  "in_progress",
  "resolved",
]);

export const reportTypeEnum = pgEnum("report_type", ["lawyer", "company"]);

export const verticalEnum = pgEnum("vertical", ["remote", "gig"]);

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
  website: varchar("website", { length: 255 }),
  vertical: verticalEnum("vertical").notNull(),
  contactEmails: jsonb("contact_emails").$type<string[]>().default([]),
  resolutionEngaged: boolean("resolution_engaged").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  workerId: uuid("worker_id"),
  companyId: uuid("company_id")
    .references(() => companies.id)
    .notNull(),

  vertical: verticalEnum("vertical").notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }),
  ageRange: varchar("age_range", { length: 20 }),
  sex: varchar("sex", { length: 20 }),
  project: text("project"),
  dateRange: varchar("date_range", { length: 200 }).notNull(),
  caseType: caseTypeEnum("case_type").default("unpaid_wages").notNull(),
  workDateStart: timestamp("work_date_start"),
  workDateEnd: timestamp("work_date_end"),
  amountOwed: numeric("amount_owed", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("EUR").notNull(),
  contactAttempts: integer("contact_attempts").notNull(),
  story: text("story").notNull(),
  storyTranslated: text("story_translated"),
  translationLanguage: varchar("translation_language", { length: 10 }),

  contactAlias: varchar("contact_alias", { length: 255 }),
  aliasRuleId: varchar("alias_rule_id", { length: 255 }),
  aliasActive: boolean("alias_active").default(true).notNull(),

  optInSolicitor: boolean("opt_in_solicitor").default(false).notNull(),
  optInCollective: boolean("opt_in_collective").default(false).notNull(),
  optInCompanyNotify: boolean("opt_in_company_notify").default(true).notNull(),

  email: varchar("email", { length: 255 }).notNull(),

  attested: boolean("attested").default(false).notNull(),
  turnstileVerified: boolean("turnstile_verified").default(false).notNull(),
  status: caseStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  consentLegal: boolean("consent_legal").default(true).notNull(),
  consentCollective: boolean("consent_collective").default(true).notNull(),
  resolutionStatus: resolutionStatusEnum("resolution_status").default("none").notNull(),
  resolutionDate: timestamp("resolution_date"),
  resolutionFeedback: text("resolution_feedback"),
  lastFollowUpSentAt: timestamp("last_follow_up_sent_at"),
});

export const companyAccessLog = pgTable("company_access_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .references(() => companies.id)
    .notNull(),
  companyRepresentative: varchar("company_representative", { length: 255 }),
  representativeRole: varchar("representative_role", { length: 255 }),
  companyEmail: varchar("company_email", { length: 255 }),
  accessType: varchar("access_type", { length: 50 }),
  casesAccessed: jsonb("cases_accessed").$type<string[]>(),
  agreementSignedAt: timestamp("agreement_signed_at"),
  agreementPdfUrl: varchar("agreement_pdf_url", { length: 255 }),
  paymentTransactionId: varchar("payment_transaction_id", { length: 255 }),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const solicitorReferrals = pgTable("solicitor_referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .references(() => companies.id)
    .notNull(),
  solicitorFirm: varchar("solicitor_firm", { length: 255 }),
  solicitorEmail: varchar("solicitor_email", { length: 255 }),
  clusterSize: integer("cluster_size"),
  feePaid: numeric("fee_paid", { precision: 10, scale: 2 }),
  casesReferred: jsonb("cases_referred").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  nonRetaliationSigned: boolean("non_retaliation_signed").default(false).notNull(),
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

export const caseTimelineEvents = pgTable("case_timeline_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id").references(() => cases.id).notNull(),
  workerId: uuid("worker_id").references(() => workers.id),
  eventType: timelineEventTypeEnum("event_type").notNull(),
  eventDate: timestamp("event_date").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description").notNull(),
  direction: timelineDirectionEnum("direction").default("worker_to_company").notNull(),
  labels: text("labels").array().default([]).notNull(),
  isAutomatic: boolean("is_automatic").default(false).notNull(),
  emailContent: text("email_content"),
  responseReceived: boolean("response_received").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
