-- Script to check and clean duplicate profiles (Parents and Children)
-- This handles foreign key constraints by removing associated data before deleting duplicates

-- 1. Identify all duplicates (same child_name in same family_id)
-- This covers duplicate "Parent" profiles AND duplicate "Mon enfant" or named children
CREATE TEMP TABLE profiles_to_delete AS
SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY family_id, child_name ORDER BY id) as rn
    FROM profiles
) t WHERE rn > 1;

-- 2. See what we are about to delete
SELECT p.family_id, p.child_name, p.is_parent, p.id,
       (SELECT COUNT(*) FROM challenges c WHERE c.assigned_to = p.id) as challenge_count,
       (SELECT COUNT(*) FROM daily_logs dl WHERE dl.profile_id = p.id) as log_count
FROM profiles p
WHERE p.id IN (SELECT id FROM profiles_to_delete);

-- 3. Delete associated data to avoid foreign key violations
-- Delete challenges associated with duplicate profiles
DELETE FROM challenges WHERE assigned_to IN (SELECT id FROM profiles_to_delete);

-- Delete daily logs associated with duplicate profiles
DELETE FROM daily_logs WHERE profile_id IN (SELECT id FROM profiles_to_delete);

-- 4. Delete the duplicate profiles
DELETE FROM profiles WHERE id IN (SELECT id FROM profiles_to_delete);

-- 5. Final Verification
SELECT family_id, child_name, is_parent, invite_code
FROM profiles
ORDER BY family_id, is_parent DESC, child_name;

DROP TABLE profiles_to_delete;
