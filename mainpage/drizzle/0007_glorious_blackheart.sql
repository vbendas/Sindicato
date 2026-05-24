CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."platform_role" AS ENUM('lawyer', 'company', 'media');--> statement-breakpoint
CREATE TABLE "platform_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "platform_role" NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"organization" varchar(255),
	"approval_status" "approval_status" DEFAULT 'pending' NOT NULL,
	"tos_accepted_at" timestamp,
	"tos_version" varchar(10),
	"email_verified" boolean DEFAULT false NOT NULL,
	"approved_at" timestamp,
	"approved_by" varchar(255),
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "share_click_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"platform" varchar(50) NOT NULL,
	"is_authenticated" boolean DEFAULT false NOT NULL,
	"company_id" varchar(255),
	"case_id" varchar(255),
	"event_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "data_access_unique";--> statement-breakpoint
ALTER TABLE "data_access_logs" ALTER COLUMN "accessor_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "data_access_logs" ADD COLUMN "platform_account_id" uuid;--> statement-breakpoint
ALTER TABLE "data_access_logs" ADD COLUMN "role" "platform_role" NOT NULL;--> statement-breakpoint
ALTER TABLE "entity_metrics_snapshots" ADD COLUMN "visitors_total" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "entity_metrics_snapshots" ADD COLUMN "visitors_24h" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "entity_metrics_snapshots" ADD COLUMN "visitors_7d" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "share_click_entity" ON "share_click_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
ALTER TABLE "data_access_logs" ADD CONSTRAINT "data_access_logs_platform_account_id_platform_accounts_id_fk" FOREIGN KEY ("platform_account_id") REFERENCES "public"."platform_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "data_access_unique" ON "data_access_logs" USING btree ("case_id","accessor_id","platform_account_id");