CREATE TYPE "public"."timeline_direction" AS ENUM('worker_to_company', 'company_to_worker', 'system');--> statement-breakpoint
ALTER TABLE "case_timeline_events" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "case_timeline_events" ADD COLUMN "direction" timeline_direction DEFAULT 'worker_to_company' NOT NULL;--> statement-breakpoint
ALTER TABLE "case_timeline_events" ADD COLUMN "labels" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "case_timeline_events" ADD COLUMN "is_automatic" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "case_timeline_events" ADD COLUMN "email_content" text;