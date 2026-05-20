CREATE TYPE "public"."case_status" AS ENUM('active', 'resolved', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('lawyer', 'company');--> statement-breakpoint
CREATE TABLE "cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"projects" text NOT NULL,
	"date_range" varchar(200) NOT NULL,
	"amount_owed" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"contact_attempts" integer NOT NULL,
	"story" text NOT NULL,
	"story_translated" text,
	"translation_language" varchar(10),
	"email" varchar(255) NOT NULL,
	"claim_types" jsonb NOT NULL,
	"other_description" text,
	"status" "case_status" DEFAULT 'active' NOT NULL,
	"attestation" boolean NOT NULL,
	"consent_legal" boolean NOT NULL,
	"consent_collective" boolean NOT NULL,
	"resolution_feedback" text,
	"last_follow_up_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"public_email" varchar(255),
	"website_url" varchar(500),
	"logo_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "company_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_name" varchar(255) NOT NULL,
	"employee_role" varchar(255) NOT NULL,
	"official_email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"non_retaliation_signed" boolean DEFAULT false NOT NULL,
	"signed_agreement_url" varchar(500),
	"stripe_payment_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"accessor_id" uuid NOT NULL,
	"accessed_at" timestamp DEFAULT now() NOT NULL,
	"worker_notified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"report_type" "report_type" NOT NULL,
	"content" text NOT NULL,
	"pdf_url" varchar(500),
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"phone" varchar(20),
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_verifications" ADD CONSTRAINT "company_verifications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_access_logs" ADD CONSTRAINT "data_access_logs_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_access_logs" ADD CONSTRAINT "data_access_logs_accessor_id_company_verifications_id_fk" FOREIGN KEY ("accessor_id") REFERENCES "public"."company_verifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "data_access_unique" ON "data_access_logs" USING btree ("case_id","accessor_id");--> statement-breakpoint
CREATE INDEX "verification_tokens_email_code" ON "verification_tokens" USING btree ("email","code");