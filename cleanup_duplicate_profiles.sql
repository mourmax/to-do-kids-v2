-- Script to check and clean duplicate child profiles
-- This will show all duplicate child profiles and remove extras, keeping only the first one

-- First, let's see if there are duplicates
SELECT family_id, child_name, COUNT(*) as count, STRING_AGG(id::text, ', ') as profile_ids
FROM profiles
WHERE is_parent = false
GROUP BY family_id, child_name
HAVING COUNT(*) > 1;

-- If duplicates exist, this will delete them, keeping only the oldest profile for each child name
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY family_id, child_name ORDER BY created_at) as rn
  FROM profiles
  WHERE is_parent = false
)
DELETE FROM profiles
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Verify cleanup
SELECT family_id, child_name, is_parent, invite_code
FROM profiles
ORDER BY family_id, is_parent DESC, created_at;
