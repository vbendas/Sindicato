-- Cleanup script for existing timeline events
-- Run against the production database

-- 1. Delete weekly follow-up timeline events (they shouldn't exist)
DELETE FROM case_timeline_events
WHERE 'weekly_follow_up' = ANY(labels);

-- 2. Update "Case filed against {company}" descriptions to neutral "Case filed."
UPDATE case_timeline_events
SET description = 'Case filed.'
WHERE description LIKE 'Case filed against %';

-- 3. Update "Sindicato sent notification email" descriptions
UPDATE case_timeline_events
SET description = REPLACE(description, 'Sindicato sent notification email to ', 'Notification email sent to ')
WHERE description LIKE 'Sindicato sent notification email to %';
