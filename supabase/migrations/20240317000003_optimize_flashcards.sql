-- Add index to flashcards for faster loading
CREATE INDEX IF NOT EXISTS flashcards_user_id_idx ON flashcards (user_id);
