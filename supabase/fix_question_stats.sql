-- Ensure question_responses table is correct
CREATE TABLE IF NOT EXISTS question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own responses" ON question_responses;
DROP POLICY IF EXISTS "Users can insert own responses" ON question_responses;
DROP POLICY IF EXISTS "Allow read for stats" ON question_responses;
DROP POLICY IF EXISTS "Anyone can view question responses" ON question_responses;
DROP POLICY IF EXISTS "Authenticated users can insert their own responses" ON question_responses;
DROP POLICY IF EXISTS "Allow public read for stats" ON question_responses;
DROP POLICY IF EXISTS "Allow authenticated insert" ON question_responses;

-- Create clean policies
CREATE POLICY "Allow public read for stats" ON question_responses
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON question_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_question_responses_question_id ON question_responses(question_id);
