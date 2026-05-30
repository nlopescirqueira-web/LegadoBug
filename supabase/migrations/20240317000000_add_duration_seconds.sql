-- Add duration_seconds to study_sessions for better precision
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Update existing records to have duration_seconds based on duration_minutes
UPDATE study_sessions SET duration_seconds = duration_minutes * 60 WHERE duration_seconds IS NULL;
