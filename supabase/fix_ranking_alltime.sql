-- ============================================================
-- FIX: Ranking "Geral" mostrando tempo absurdo
-- Precisa dropar a função primeiro (depende da view),
-- depois dropar a view, e recriar ambas.
-- ============================================================

-- 1. Dropar função que depende da view
DROP FUNCTION IF EXISTS public.get_global_ranking_v3() CASCADE;

-- 2. Dropar a view
DROP VIEW IF EXISTS public.user_study_stats CASCADE;

-- 3. Recriar a view corrigida
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
        ), 0)::INTEGER AS daily_finished,
        COALESCE(SUM(duration_seconds) FILTER (
            WHERE created_at >= date_trunc('week', (now() AT TIME ZONE 'America/Sao_Paulo')) AT TIME ZONE 'America/Sao_Paulo'
        ), 0)::INTEGER AS weekly_finished
    FROM study_sessions
    GROUP BY user_id
)
SELECT
    p.id AS user_id,
    p.name,
    p.photo_url,
    p.streak,
    (COALESCE(st.daily_finished, 0) + COALESCE(at.running_seconds, 0))::INTEGER AS daily_seconds,
    (COALESCE(st.weekly_finished, 0) + COALESCE(at.running_seconds, 0))::INTEGER AS weekly_seconds,
    COALESCE(p.total_seconds, 0)::INTEGER AS total_seconds_all_time,
    COALESCE(st.daily_finished, 0)::INTEGER AS daily_finished,
    COALESCE(st.weekly_finished, 0)::INTEGER AS weekly_finished,
    COALESCE(p.total_seconds, 0)::INTEGER AS total_finished
FROM profiles p
LEFT JOIN session_totals st ON p.id = st.user_id
LEFT JOIN active_timer at ON p.id = at.user_id;

-- 4. Recriar a função RPC
CREATE OR REPLACE FUNCTION public.get_global_ranking_v3()
RETURNS SETOF public.user_study_stats AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.user_study_stats ORDER BY daily_seconds DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Permissões
GRANT SELECT ON public.user_study_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_ranking_v3() TO anon, authenticated;
