-- NUCLEAR RESET: DELETE EVERYTHING RELATED TO QUESTIONS
-- Este script limpa 100% de qualquer rastro de questões, respostas e comentários.

-- 1. Limpa respostas e estatísticas para evitar erros de chave estrangeira
TRUNCATE TABLE public.question_responses CASCADE;
TRUNCATE TABLE public.question_comments CASCADE;
TRUNCATE TABLE public.user_answers CASCADE;

-- 2. Limpa a tabela de questões COMPLETAMENTE
TRUNCATE TABLE public.questions RESTART IDENTITY CASCADE;

-- 3. Limpa qualquer cache ou metadado (opcional se você tiver colunas de agregação)
UPDATE profiles SET total_seconds = 0;
TRUNCATE TABLE public.study_sessions CASCADE;

-- Agora o banco está 100% ZERO. A partir daqui, só existirá o que você adicionar.
