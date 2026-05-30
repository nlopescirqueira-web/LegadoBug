-- Add subjects column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subjects JSONB DEFAULT '["Português", "Matemática", "História", "Geografia", "Física"]'::jsonb;
