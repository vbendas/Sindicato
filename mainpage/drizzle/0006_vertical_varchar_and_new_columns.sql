-- Change vertical columns from enum to varchar to support custom platform types
ALTER TABLE "cases" ALTER COLUMN "vertical" TYPE varchar(50);
ALTER TABLE "companies" ALTER COLUMN "vertical" TYPE varchar(50);--> statement-breakpoint

-- Add optInCompanyContact column with default true
ALTER TABLE "cases" ADD COLUMN "opt_in_company_contact" boolean DEFAULT true NOT NULL;--> statement-breakpoint

-- Add daysWithoutAnswer column (nullable, computed from timeline)
ALTER TABLE "cases" ADD COLUMN "days_without_answer" integer;--> statement-breakpoint

-- Update default values for opt-in fields to true
ALTER TABLE "cases" ALTER COLUMN "opt_in_solicitor" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "cases" ALTER COLUMN "opt_in_collective" SET DEFAULT true;
