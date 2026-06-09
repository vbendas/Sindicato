-- Sindicato Test Cleanup Script
-- Run this against your Neon database to start with a clean state
-- Usage: psql "$DATABASE_URL" -f scripts/cleanup-for-test.sql
-- Or paste into Drizzle Studio SQL editor

-- Delete in dependency order (children before parents)

-- 1. Tags (depends on cases + caseTimelineEvents)
DELETE FROM case_tags;

-- 2. Case analyses (depends on cases + companies)
DELETE FROM case_analyses;

-- 3. Timeline events (depends on cases + workers)
DELETE FROM case_timeline_events;

-- 4. Data access logs (depends on cases + companyVerifications + platformAccounts)
DELETE FROM data_access_logs;

-- 5. Share click events (references companies/cases but no FK enforced)
DELETE FROM share_click_events;

-- 6. Entity metrics snapshots (no FK, but clean for fresh start)
DELETE FROM entity_metrics_snapshots;

-- 7. Audit logs (no FK)
DELETE FROM audit_logs;

-- 8. Company access log (depends on companies)
DELETE FROM company_access_log;

-- 9. Solicitor referrals (depends on companies)
DELETE FROM solicitor_referrals;

-- 10. Company verifications (depends on companies)
DELETE FROM company_verifications;

-- 11. Company summaries (depends on companies)
DELETE FROM company_summaries;

-- 12. Translations (no FK, but clean for fresh start)
DELETE FROM translations;

-- 13. Reports (depends on companies)
DELETE FROM reports;

-- 14. Cases (depends on companies)
DELETE FROM cases;

-- 15. Workers (no FK dependencies, but clean for fresh worker creation)
DELETE FROM workers;

-- 16. Platform accounts (depends on companies)
DELETE FROM platform_accounts;

-- 17. Verification tokens (no FK)
DELETE FROM verification_tokens;

-- 18. Manual review queue (depends on companies)
DELETE FROM manual_review_queue;

-- 19. Donations (no FK)
DELETE FROM donations;

-- 20. Companies (parent table, delete last)
DELETE FROM companies;

-- Verify clean state
SELECT
  'case_tags' as tbl, COUNT(*) as cnt FROM case_tags
UNION ALL SELECT 'case_analyses', COUNT(*) FROM case_analyses
UNION ALL SELECT 'case_timeline_events', COUNT(*) FROM case_timeline_events
UNION ALL SELECT 'cases', COUNT(*) FROM cases
UNION ALL SELECT 'workers', COUNT(*) FROM workers
UNION ALL SELECT 'companies', COUNT(*) FROM companies
UNION ALL SELECT 'platform_accounts', COUNT(*) FROM platform_accounts
UNION ALL SELECT 'verification_tokens', COUNT(*) FROM verification_tokens
UNION ALL SELECT 'manual_review_queue', COUNT(*) FROM manual_review_queue
UNION ALL SELECT 'donations', COUNT(*) FROM donations
UNION ALL SELECT 'company_summaries', COUNT(*) FROM company_summaries
UNION ALL SELECT 'translations', COUNT(*) FROM translations
UNION ALL SELECT 'reports', COUNT(*) FROM reports
UNION ALL SELECT 'company_access_log', COUNT(*) FROM company_access_log
UNION ALL SELECT 'solicitor_referrals', COUNT(*) FROM solicitor_referrals
UNION ALL SELECT 'company_verifications', COUNT(*) FROM company_verifications
UNION ALL SELECT 'data_access_logs', COUNT(*) FROM data_access_logs
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL SELECT 'entity_metrics_snapshots', COUNT(*) FROM entity_metrics_snapshots
UNION ALL SELECT 'share_click_events', COUNT(*) FROM share_click_events;
