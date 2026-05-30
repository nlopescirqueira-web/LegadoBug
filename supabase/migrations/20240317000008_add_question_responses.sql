-- Create a table to track all question responses for global statistics
CREATE TABLE IF NOT EXISTS question_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view question responses" ON question_responses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert their own responses" ON question_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_question_responses_question_id ON question_responses(question_id);
