-- Script to remove duplicate default missions
-- This will keep only one instance of each default mission per family

WITH duplicates AS (
  SELECT 
    id,
    family_id,
    title,
    ROW_NUMBER() OVER (PARTITION BY family_id, title ORDER BY created_at) as rn
  FROM missions
  WHERE title IN ('missions.do_homework', 'missions.tidy_toys', 'missions.set_table')
)
DELETE FROM missions
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Verify the cleanup
SELECT family_id, title, COUNT(*) as count
FROM missions
WHERE title IN ('missions.do_homework', 'missions.tidy_toys', 'missions.set_table')
GROUP BY family_id, title
HAVING COUNT(*) > 1;
