CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_role" varchar(50) NOT NULL,
	"company_id" uuid,
	"query" text NOT NULL,
	"accessed_contacts" boolean NOT NULL,
	"success" boolean NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"summary" text NOT NULL,
	"common_issues" jsonb DEFAULT '[]'::jsonb,
	"resolution_rate" varchar(20),
	"engagement_pattern" varchar(50),
	"key_insight" text,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "company_summaries_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
ALTER TABLE "platform_accounts" ADD COLUMN "company_id" uuid;--> statement-breakpoint
ALTER TABLE "company_summaries" ADD CONSTRAINT "company_summaries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_accounts" ADD CONSTRAINT "platform_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;