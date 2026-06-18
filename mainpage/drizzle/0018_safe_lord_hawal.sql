DROP INDEX "verification_tokens_email_code";--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "code_hash" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "verification_tokens_email_code_hash" ON "verification_tokens" USING btree ("email","code_hash");--> statement-breakpoint
CREATE INDEX "verification_tokens_email_created" ON "verification_tokens" USING btree ("email","created_at");--> statement-breakpoint
ALTER TABLE "verification_tokens" DROP COLUMN "code";