-- Ensure study_sessions are viewable by everyone for the ranking
-- This migration explicitly drops any restrictive policies and adds a global select policy

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Study sessions are viewable by everyone" ON public.study_sessions;

-- 2. Create the global select policy
CREATE POLICY "Study sessions are viewable by everyone" ON public.study_sessions
  FOR SELECT USING (true);

-- 3. Ensure profiles are also viewable by everyone
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
