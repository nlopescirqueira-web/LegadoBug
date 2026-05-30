-- Run this in your Supabase SQL Editor

-- Add role, email and cpf columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Clean up duplicate emails (keep the one with most recent activity or just one)
-- This is a safety measure before adding the unique constraint
DELETE FROM profiles a USING profiles b
WHERE a.id > b.id AND a.email = b.email AND a.email IS NOT NULL;

-- Ensure email is unique
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, photo_url, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'Soldado'), 
    new.raw_user_meta_data->>'avatar_url', 
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update victorpedrorb6@gmail.com, pedroxygaming@gmail.com and pedrohribeiro35@gmail.com to admin
-- Note: You'll need to find the user's ID from the auth.users table
-- UPDATE profiles SET role = 'admin' WHERE email IN ('victorpedrorb6@gmail.com', 'pedroxygaming@gmail.com', 'pedrohribeiro35@gmail.com');

-- Update profiles table for photo and name change limits
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name_changes_count INTEGER DEFAULT 0;

-- Ensure name is unique (rigid enforcement)
-- First, we might need to clean up duplicates if they exist, but for a new setup this is fine.
-- If you have existing duplicates, this command might fail.
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_name_key') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_name_key UNIQUE (name);
  END IF;
END $$;

-- Update questions table with missing columns
ALTER TABLE questions ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS subtopic TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS options TEXT[];
ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_option_index INTEGER;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS org TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_unpublished BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_outdated BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add policy for admins to manage questions (Insert, Update, Delete)
-- Using auth.jwt() ->> 'email' is more reliable than joining with profiles
DROP POLICY IF EXISTS "Admins can insert questions" ON questions;
DROP POLICY IF EXISTS "Admins can update questions" ON questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON questions;
DROP POLICY IF EXISTS "Enable read access for all users" ON questions;
DROP POLICY IF EXISTS "Allow public read access" ON questions;

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL 
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN ('victorpedrorb6@gmail.com', 'pedroxygaming@gmail.com', 'pedrohribeiro35@gmail.com')
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN ('victorpedrorb6@gmail.com', 'pedroxygaming@gmail.com', 'pedrohribeiro35@gmail.com')
  );

-- Create question_responses table for tracking user performance
CREATE TABLE IF NOT EXISTS question_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on question_responses
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own responses
CREATE POLICY "Users can view own responses" ON question_responses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own responses
CREATE POLICY "Users can insert own responses" ON question_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow public read for stats (aggregated)
-- Note: In QuestionStats.tsx we fetch all responses for a question to show percentages
CREATE POLICY "Allow read for stats" ON question_responses
  FOR SELECT USING (true);
