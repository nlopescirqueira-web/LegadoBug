-- ============================================================
-- FIX PERFORMANCE / DESEMPENHO TAB
-- Adiciona subject e topic à tabela question_responses
-- para que os dados de disciplina sobrevivam ao reload
-- ============================================================

-- 1. Adicionar colunas subject e topic
ALTER TABLE question_responses ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE question_responses ADD COLUMN IF NOT EXISTS topic TEXT;

-- 2. Preencher subject/topic para respostas antigas usando a tabela questions
UPDATE question_responses qr
SET
  subject = q.subject,
  topic = q.topic
FROM questions q
WHERE qr.question_id = q.id::TEXT
  AND (qr.subject IS NULL OR qr.topic IS NULL);

-- 3. Criar índice para consultas por usuário + data (performance)
CREATE INDEX IF NOT EXISTS idx_question_responses_user_created
  ON question_responses(user_id, created_at);
