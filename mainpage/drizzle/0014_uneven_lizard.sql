CREATE TYPE "public"."manual_review_status" AS ENUM('pending', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."scrape_job_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."scrape_status" AS ENUM('not_scraped', 'scraping', 'found', 'not_found', 'manual_review');--> statement-breakpoint
CREATE TABLE "manual_review_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"reason" varchar(50) NOT NULL,
	"status" "manual_review_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"resolved_emails" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "scrape_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"company_slug" varchar(100) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"company_website" varchar(255),
	"vertical" varchar(50) NOT NULL,
	"status" "scrape_job_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"result" jsonb,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"field" varchar(50) NOT NULL,
	"locale" varchar(10) NOT NULL,
	"translated_text" text NOT NULL,
	"source_hash" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "scrape_status" "scrape_status" DEFAULT 'not_scraped' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "scraped_at" timestamp;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "scrape_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "scrape_source" varchar(50);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "website_provided_by_worker" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD COLUMN "code_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "manual_review_queue" ADD CONSTRAINT "manual_review_queue_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scrape_jobs" ADD CONSTRAINT "scrape_jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "translations_lookup_idx" ON "translations" USING btree ("entity_type","entity_id","field","locale");--> statement-breakpoint
CREATE INDEX "verification_tokens_email_expiry" ON "verification_tokens" USING btree ("email","expires_at");