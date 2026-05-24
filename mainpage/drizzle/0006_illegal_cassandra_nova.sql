CREATE TABLE "entity_metrics_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"views_total" integer DEFAULT 0 NOT NULL,
	"views_24h" integer DEFAULT 0 NOT NULL,
	"views_7d" integer DEFAULT 0 NOT NULL,
	"shares_total" integer DEFAULT 0 NOT NULL,
	"last_synced_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cases" ALTER COLUMN "vertical" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "cases" ALTER COLUMN "opt_in_solicitor" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "cases" ALTER COLUMN "opt_in_collective" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "vertical" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "days_without_answer" integer;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "opt_in_company_contact" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "entity_metrics_type_id" ON "entity_metrics_snapshots" USING btree ("entity_type","entity_id");