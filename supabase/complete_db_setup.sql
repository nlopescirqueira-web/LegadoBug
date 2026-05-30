-- AI Studio Build - MESTRE DE REPARO DO BANCO DE DADOS
-- Este script garante que todas as colunas, funções e views existam para o cronômetro e ranking.

-- 1. GARANTE QUE AS COLUNAS EXISTAM NA TABELA PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_session_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_session_start TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_session_subject TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_session_initial_seconds INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_date TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_seconds INTEGER DEFAULT 0;

-- 2. FUNÇÃO PARA ATUALIZAR STREAK (ATÔMICA)
CREATE OR REPLACE FUNCTION public.update_study_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_last_study DATE;
    v_today DATE;
    v_streak INTEGER;
    v_new_streak INTEGER;
BEGIN
    v_today := (timezone('America/Sao_Paulo', now()))::date;
    
    SELECT streak, last_login_date::date INTO v_streak, v_last_study
    FROM profiles
    WHERE id = p_user_id;

    IF v_last_study IS NULL THEN
        v_new_streak := 1;
    ELSIF v_last_study = v_today THEN
        v_new_streak := v_streak;
    ELSIF v_last_study = v_today - INTERVAL '1 day' THEN
        v_new_streak := COALESCE(v_streak, 0) + 1;
    ELSE
        v_new_streak := 1;
    END IF;

    UPDATE profiles
    SET 
        streak = v_new_streak,
        last_login_date = v_today::text,
        updated_at = now()
    WHERE id = p_user_id;

    RETURN v_new_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNÇÃO PARA INICIAR SESSÃO DURÁVEL
CREATE OR REPLACE FUNCTION public.start_study_session(p_user_id UUID, p_subject TEXT, p_initial_seconds INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET 
        active_session_type = 'stopwatch',
        active_session_start = NOW(),
        active_session_subject = p_subject,
        active_session_initial_seconds = p_initial_seconds,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNÇÃO PARA ENCERRAR SESSÃO COM PRECISÃO MATEMÁTICA
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

    IF v_start IS NULL THEN
        RETURN 0;
    END IF;

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
            active_session_initial_seconds = 0,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        PERFORM update_study_streak(p_user_id);
    ELSE
        UPDATE profiles
        SET active_session_type = NULL, active_session_start = NULL, active_session_initial_seconds = 0
        WHERE id = p_user_id;
    END IF;

    RETURN v_duration;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VIEW DE RANKING GLOBAL (SOMA TEMPO REAL + TEMPO SALVO)
CREATE OR REPLACE VIEW public.user_study_stats AS
WITH active_sessions AS (
    SELECT 
        id as user_id,
        CASE 
            WHEN active_session_start IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (NOW() - active_session_start))::INTEGER
            ELSE 0 
        END as running_seconds
    FROM profiles
),
session_aggregates AS (
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
    (COALESCE(sa.daily_finished, 0) + COALESCE(asess.running_seconds, 0)) AS daily_seconds,
    (COALESCE(sa.weekly_finished, 0) + COALESCE(asess.running_seconds, 0)) AS weekly_seconds,
    (COALESCE(p.total_seconds, 0) + COALESCE(asess.running_seconds, 0)) AS total_seconds_all_time,
    COALESCE(sa.daily_finished, 0) as daily_finished,
    COALESCE(sa.weekly_finished, 0) as weekly_finished,
    COALESCE(p.total_seconds, 0) as total_finished,
    p.updated_at
FROM profiles p
LEFT JOIN session_aggregates sa ON p.id = sa.user_id
LEFT JOIN active_sessions asess ON p.id = asess.user_id;

-- 6. RPC PARA BUSCAR RANKING GLOBAL SEM BLOQUEIO
CREATE OR REPLACE FUNCTION public.get_global_ranking_v3()
RETURNS SETOF public.user_study_stats AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.user_study_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. PERMISSÕES FINALIZADAS
GRANT SELECT ON public.user_study_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_ranking_v3() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_study_session(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_study_session(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_study_streak(UUID) TO authenticated;
