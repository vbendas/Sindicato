CREATE TABLE "case_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"key_issues" jsonb DEFAULT '[]'::jsonb,
	"case_summary" text NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "case_analyses_case_id_unique" UNIQUE("case_id")
);
--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "last_per_case_email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "company_summaries" ADD COLUMN "included_case_ids" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "case_analyses" ADD CONSTRAINT "case_analyses_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_analyses" ADD CONSTRAINT "case_analyses_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "case_analyses_company_id" ON "case_analyses" USING btree ("company_id");