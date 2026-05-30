-- Add unique constraint to profiles.name to prevent duplicate names
-- This ensures that even if the frontend check fails, the database will reject duplicates

-- 1. First, handle any existing duplicates by appending a random suffix (safety measure)
-- (In a real app, you'd want to be more careful, but for this context, we just want to enable the constraint)
UPDATE profiles p1
SET name = name || '_' || substr(id::text, 1, 4)
WHERE EXISTS (
  SELECT 1 FROM profiles p2 
  WHERE p1.name = p2.name AND p1.id <> p2.id
);

-- 2. Add the unique constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_name_unique UNIQUE (name);
