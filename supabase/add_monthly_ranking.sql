-- ADD MONTHLY RANKING SUPPORT
-- Recreates the view with monthly_seconds column

-- 1. Drop dependencies
DROP FUNCTION IF EXISTS public.get_global_ranking_v3 CASCADE;
DROP VIEW IF EXISTS public.user_study_stats CASCADE;

-- 2. Recreate view with monthly column
CREATE VIEW public.user_study_stats AS
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
session_stats AS (
    SELECT
        user_id,
        COALESCE(SUM(duration_seconds) FILTER (
            WHERE (timezone('America/Sao_Paulo', created_at))::date = (timezone('America/Sao_Paulo', now()))::date
        ), 0) AS daily_finished,
        COALESCE(SUM(duration_seconds) FILTER (
            WHERE created_at >= date_trunc('week', (now() AT TIME ZONE 'America/Sao_Paulo')) AT TIME ZONE 'America/Sao_Paulo'
        ), 0) AS weekly_finished,
        COALESCE(SUM(duration_seconds) FILTER (
            WHERE created_at >= date_trunc('month', (now() AT TIME ZONE 'America/Sao_Paulo')) AT TIME ZONE 'America/Sao_Paulo'
        ), 0) AS monthly_finished,
        COALESCE(SUM(duration_seconds), 0) AS total_history
    FROM study_sessions
    GROUP BY user_id
)
SELECT
    p.id AS user_id,
    p.name,
    p.photo_url,
    p.streak,
    (COALESCE(ss.daily_finished, 0) + COALESCE(at.running_seconds, 0))::INTEGER AS daily_seconds,
    (COALESCE(ss.weekly_finished, 0) + COALESCE(at.running_seconds, 0))::INTEGER AS weekly_seconds,
    (COALESCE(ss.monthly_finished, 0) + COALESCE(at.running_seconds, 0))::INTEGER AS monthly_seconds,
    (GREATEST(COALESCE(p.total_seconds, 0), COALESCE(ss.total_history, 0)) + COALESCE(at.running_seconds, 0))::INTEGER AS total_seconds_all_time,
    COALESCE(ss.daily_finished, 0)::INTEGER as daily_finished,
    COALESCE(ss.weekly_finished, 0)::INTEGER as weekly_finished,
    COALESCE(ss.monthly_finished, 0)::INTEGER as monthly_finished,
    GREATEST(COALESCE(p.total_seconds, 0), COALESCE(ss.total_history, 0))::INTEGER as total_finished
FROM profiles p
LEFT JOIN session_stats ss ON p.id = ss.user_id
LEFT JOIN active_timer at ON p.id = at.user_id;

-- 3. Recreate RPC
CREATE OR REPLACE FUNCTION public.get_global_ranking_v3()
RETURNS SETOF public.user_study_stats AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.user_study_stats ORDER BY total_seconds_all_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Permissions
GRANT SELECT ON public.user_study_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_ranking_v3() TO anon, authenticated;
