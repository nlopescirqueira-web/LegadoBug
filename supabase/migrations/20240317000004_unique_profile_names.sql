-- Add unique constraint to profile names
-- First, handle any existing duplicates by appending a random suffix (unlikely in a new app but good practice)
-- However, since this is a development environment, we can just try to add the constraint.

-- If there are duplicates, this will fail, which is fine as we handle it in the app.
ALTER TABLE public.profiles ADD CONSTRAINT profiles_name_key UNIQUE (name);
