-- ============================================================
-- FIX: Ranking "Geral" mostrando tempo absurdo
-- O total_seconds_all_time estava somando running_seconds
-- da sessão ativa, causando valores inflados quando o
-- cronômetro ficava ligado por muito tempo.
-- Agora usa apenas o tempo consolidado (total_seconds do profiles)
-- para o ranking geral, enquanto diário e semanal continuam
-- somando a sessão ativa normalmente.
-- ============================================================

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
    (COALESCE(st.daily_finished, 0) + COALESCE(at.running_seconds, 0)) AS daily_seconds,
    (COALESCE(st.weekly_finished, 0) + COALESCE(at.running_seconds, 0)) AS weekly_seconds,
    COALESCE(p.total_seconds, 0) AS total_seconds_all_time,
    COALESCE(st.daily_finished, 0) as daily_finished,
    COALESCE(st.weekly_finished, 0) as weekly_finished,
    COALESCE(p.total_seconds, 0) as total_finished
FROM profiles p
LEFT JOIN session_totals st ON p.id = st.user_id
LEFT JOIN active_timer at ON p.id = at.user_id;

-- Recriar a função RPC (depende da view)
CREATE OR REPLACE FUNCTION public.get_global_ranking_v3()
RETURNS SETOF public.user_study_stats AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.user_study_stats ORDER BY daily_seconds DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT ON public.user_study_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_ranking_v3() TO anon, authenticated;
