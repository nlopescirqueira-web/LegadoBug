-- AI Studio Build - MESTRE DE REPARO DO BANCO DE DADOS (VERSÃO FINAL)
-- Este script garante que todas as colunas, funções e views existam para o cronômetro e ranking.

-- 1. GARANTE QUE AS COLUNAS EXISTAM NA TABELA PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_session_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_session_start TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_session_subject TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_session_initial_seconds INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_date TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_seconds INTEGER DEFAULT 0;

-- 2. VIEW DE RANKING GLOBAL (SOMA TEMPO REAL + TEMPO SALVO)
-- Calcula o tempo de TODOS os usuários, incluindo quem está com o cronômetro ligado agora
CREATE OR REPLACE VIEW public.user_study_stats AS
WITH active_timer AS (
    SELECT 
        id as user_id,
        CASE 
            WHEN active_session_start IS NOT NULL AND active_session_type = 'stopwatch'
            THEN EXTRACT(EPOCH FROM (NOW() - active_session_start))::INTEGER
            ELSE 0 
        END as running_seconds
    FROM profiles
),
session_totals AS (
    SELECT 
        user_id,
        COALESCE(SUM(duration_seconds) FILTER (
            WHERE (timezone('America/Sao_Paulo', created_at))::date = (timezone('America/Sao_Paulo', now()))::date
        ), 0) AS daily_finished,
        COALESCE(SUM(duration_seconds) FILTER (
            WHERE created_at >= date_trunc('week', (now() AT TIME ZONE 'America/Sao_Paulo')) AT TIME ZONE 'America/Sao_Paulo'
        ), 0) AS weekly_finished
    FROM study_sessions
    GROUP BY user_id
)
SELECT 
    p.id AS user_id,
    p.name,
    p.photo_url,
    p.streak,
    -- Tempo de Hoje = Sessões finalizadas hoje + Cronômetro rodando agora
    (COALESCE(st.daily_finished, 0) + COALESCE(at.running_seconds, 0)) AS daily_seconds,
    -- Tempo da Semana = Sessões da semana + Cronômetro rodando agora
    (COALESCE(st.weekly_finished, 0) + COALESCE(at.running_seconds, 0)) AS weekly_seconds,
    -- Tempo Geral = Total no perfil + Cronômetro rodando agora
    (COALESCE(p.total_seconds, 0) + COALESCE(at.running_seconds, 0)) AS total_seconds_all_time,
    -- Campos de controle (tempo fixo já salvo)
    COALESCE(st.daily_finished, 0) as daily_finished,
    COALESCE(st.weekly_finished, 0) as weekly_finished,
    COALESCE(p.total_seconds, 0) as total_finished
FROM profiles p
LEFT JOIN session_totals st ON p.id = st.user_id
LEFT JOIN active_timer at ON p.id = at.user_id;

-- 3. RPC PARA BUSCAR RANKING GLOBAL SEM BLOQUEIO E COM TRANSPARÊNCIA
CREATE OR REPLACE FUNCTION public.get_global_ranking_v3()
RETURNS SETOF public.user_study_stats AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.user_study_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNÇÕES DE SUPORTE PARA O APP (START/END SESSION)
CREATE OR REPLACE FUNCTION public.start_study_session(p_user_id UUID, p_subject TEXT, p_initial_seconds INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET 
        active_session_type = 'stopwatch',
        active_session_start = NOW(),
        active_session_subject = p_subject,
        active_session_initial_seconds = p_initial_seconds
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.end_study_session(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_start TIMESTAMPTZ;
    v_subject TEXT;
    v_duration INTEGER;
BEGIN
    SELECT active_session_start, active_session_subject INTO v_start, v_subject
    FROM profiles
    WHERE id = p_user_id;

    IF v_start IS NULL THEN RETURN 0; END IF;

    v_duration := EXTRACT(EPOCH FROM (NOW() - v_start))::INTEGER;

    IF v_duration > 0 THEN
        INSERT INTO study_sessions (user_id, subject, duration_seconds, created_at)
        VALUES (p_user_id, COALESCE(v_subject, 'Geral'), v_duration, NOW());

        UPDATE profiles
        SET 
            total_seconds = COALESCE(total_seconds, 0) + v_duration,
            active_session_type = NULL,
            active_session_start = NULL,
            active_session_subject = NULL,
            active_session_initial_seconds = 0
        WHERE id = p_user_id;
    ELSE
        UPDATE profiles
        SET active_session_type = NULL, active_session_start = NULL, active_session_initial_seconds = 0
        WHERE id = p_user_id;
    END IF;

    RETURN v_duration;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. PERMISSÕES
GRANT SELECT ON public.user_study_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_ranking_v3() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_study_session(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_study_session(UUID) TO authenticated;
