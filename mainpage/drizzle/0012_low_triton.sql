CREATE TYPE "public"."donation_status" AS ENUM('pending', 'completed', 'expired', 'failed');--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donor_email" varchar(255),
	"donor_name" varchar(255),
	"amount_cents" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'eur' NOT NULL,
	"status" "donation_status" DEFAULT 'pending' NOT NULL,
	"stripe_session_id" varchar(255),
	"stripe_payment_intent_id" varchar(255),
	"locale" varchar(10),
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "donations_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
