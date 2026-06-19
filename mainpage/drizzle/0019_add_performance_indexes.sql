-- Add FK: cases.worker_id -> workers.id
ALTER TABLE "cases" ADD CONSTRAINT "cases_worker_id_workers_id_fk"
  FOREIGN KEY ("worker_id") REFERENCES "workers" ("id") ON DELETE SET NULL;

-- Add performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS "cases_company_id_idx" ON "cases" ("company_id");
CREATE INDEX IF NOT EXISTS "cases_status_created_idx" ON "cases" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "cases_worker_id_idx" ON "cases" ("worker_id");
CREATE INDEX IF NOT EXISTS "cases_vertical_idx" ON "cases" ("vertical");
CREATE INDEX IF NOT EXISTS "cases_created_at_idx" ON "cases" ("created_at");
CREATE INDEX IF NOT EXISTS "timeline_case_id_idx" ON "case_timeline_events" ("case_id", "event_date");
CREATE INDEX IF NOT EXISTS "donations_status_idx" ON "donations" ("status");
CREATE INDEX IF NOT EXISTS "audit_logs_user_created_idx" ON "audit_logs" ("user_id", "created_at");
