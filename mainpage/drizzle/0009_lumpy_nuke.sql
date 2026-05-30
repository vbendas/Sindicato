CREATE TABLE "case_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"timeline_event_id" uuid,
	"category" varchar(50) NOT NULL,
	"tag_name" varchar(100) NOT NULL,
	"confidence" integer NOT NULL,
	"source_text" text,
	"worker_override" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "case_tags" ADD CONSTRAINT "case_tags_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_tags" ADD CONSTRAINT "case_tags_timeline_event_id_case_timeline_events_id_fk" FOREIGN KEY ("timeline_event_id") REFERENCES "public"."case_timeline_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "case_tags_case_id" ON "case_tags" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "case_tags_case_category" ON "case_tags" USING btree ("case_id","category");