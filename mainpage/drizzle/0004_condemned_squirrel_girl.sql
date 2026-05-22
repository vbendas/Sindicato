CREATE TYPE "public"."case_type" AS ENUM('unpaid_wages', 'late_payment', 'sudden_deactivation', 'unfair_review', 'predatory_practices', 'harassment', 'retaliation', 'contract_violation', 'data_privacy', 'other');--> statement-breakpoint
CREATE TYPE "public"."timeline_event_type" AS ENUM('email_sent', 'no_response', 'canned_response', 'chat_support', 'phone_call', 'legal_notice', 'payment_partial', 'case_updated', 'resolved', 'other');--> statement-breakpoint
CREATE TABLE "case_timeline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"worker_id" uuid,
	"event_type" timeline_event_type NOT NULL,
	"event_date" timestamp NOT NULL,
	"description" text NOT NULL,
	"response_received" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cases" DROP CONSTRAINT "cases_worker_id_workers_id_fk";
--> statement-breakpoint
ALTER TABLE "cases" ALTER COLUMN "consent_legal" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "cases" ALTER COLUMN "consent_collective" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "case_type" "case_type" DEFAULT 'unpaid_wages' NOT NULL;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "work_date_start" timestamp;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "work_date_end" timestamp;--> statement-breakpoint
ALTER TABLE "case_timeline_events" ADD CONSTRAINT "case_timeline_events_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_timeline_events" ADD CONSTRAINT "case_timeline_events_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;