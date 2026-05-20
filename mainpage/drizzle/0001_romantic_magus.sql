CREATE TYPE "public"."vertical" AS ENUM('remote', 'gig');--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "vertical" "vertical" NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "vertical" "vertical" NOT NULL;