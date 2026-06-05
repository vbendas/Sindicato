CREATE TABLE "translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"field" varchar(50) NOT NULL,
	"locale" varchar(10) NOT NULL,
	"translated_text" text NOT NULL,
	"source_hash" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "translations_lookup_idx" ON "translations" USING btree ("entity_type","entity_id","field","locale");
