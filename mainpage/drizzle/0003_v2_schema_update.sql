-- V2 Schema Update
-- Adds V2 fields, removes deprecated fields, creates new tables

-- Add V2 columns to cases
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "age_range" varchar(20);
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "sex" varchar(20);
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "contact_alias" varchar(255);
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "alias_rule_id" varchar(255);
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "alias_active" boolean DEFAULT true NOT NULL;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "turnstile_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "opt_in_solicitor" boolean DEFAULT false NOT NULL;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "opt_in_collective" boolean DEFAULT false NOT NULL;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "opt_in_company_notify" boolean DEFAULT true NOT NULL;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "attested" boolean DEFAULT false NOT NULL;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "resolution_status" varchar(50) DEFAULT 'none' NOT NULL;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "resolution_date" timestamp;

-- Rename projects -> project, make optional
ALTER TABLE "cases" RENAME COLUMN "projects" TO "project";
ALTER TABLE "cases" ALTER COLUMN "project" DROP NOT NULL;

-- Drop deprecated columns
ALTER TABLE "cases" DROP COLUMN IF EXISTS "claim_types";
ALTER TABLE "cases" DROP COLUMN IF EXISTS "other_description";

-- Drop old attestation column (replaced by "attested")
-- Keep consent_legal and consent_collective as they map to opt-in fields

-- Make worker_id optional (V2 embeds worker info in case)
ALTER TABLE "cases" ALTER COLUMN "worker_id" DROP NOT NULL;

-- Update companies table for V2
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "contact_emails" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "resolution_engaged" boolean DEFAULT false NOT NULL;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "website" varchar(255);
ALTER TABLE "companies" DROP COLUMN IF EXISTS "public_email";
ALTER TABLE "companies" DROP COLUMN IF EXISTS "website_url";
ALTER TABLE "companies" DROP COLUMN IF EXISTS "logo_url";
ALTER TABLE "companies" DROP COLUMN IF EXISTS "summary";

-- Create company_access_log table
CREATE TABLE IF NOT EXISTS "company_access_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "company_representative" varchar(255),
  "representative_role" varchar(255),
  "company_email" varchar(255),
  "access_type" varchar(50),
  "cases_accessed" jsonb,
  "agreement_signed_at" timestamp,
  "agreement_pdf_url" varchar(255),
  "payment_transaction_id" varchar(255),
  "amount_paid" numeric(10, 2),
  "ip_address" varchar(45),
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create solicitor_referrals table
CREATE TABLE IF NOT EXISTS "solicitor_referrals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "solicitor_firm" varchar(255),
  "solicitor_email" varchar(255),
  "cluster_size" integer,
  "fee_paid" numeric(10, 2),
  "cases_referred" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create resolution_status enum
DO $$ BEGIN
  CREATE TYPE "public"."resolution_status" AS ENUM('none', 'in_progress', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
