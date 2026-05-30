-- AI Studio Build - Final Ranking Precision SQL
-- This script fixes the ranking desync by including active session time in real-time calculations

-- 1. Precision Ranking View including RUNNING sessions
-- This ensures that if a user is studying right now, their time increases in the ranking every refresh
CREATE OR REPLACE VIEW public.user_study_stats AS
WITH active_sessions AS (
    -- Calculate how many seconds each user has been studying in their CURRENT session
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
    -- Standard aggregates from finished sessions
    SELECT 
        user_id,
        COALESCE(SUM(duration_seconds) FILTER (
            WHERE (timezone('America/Sao_Paulo', created_at))::date = (timezone('America/Sao_Paulo', now()))::date
        ), 0) AS daily_finished,
        COALESCE(SUM(duration_seconds) FILTER (
            -- Monday of current week in Brasilia
            -- Standard monday week calculation
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
    -- Today = Finished today + current running session
    (COALESCE(sa.daily_finished, 0) + COALESCE(asess.running_seconds, 0)) AS daily_seconds,
    -- Weekly = Finished this week + current running session
    (COALESCE(sa.weekly_finished, 0) + COALESCE(asess.running_seconds, 0)) AS weekly_seconds,
    -- All Time = Profile total + current running session
    (COALESCE(p.total_seconds, 0) + COALESCE(asess.running_seconds, 0)) AS total_seconds_all_time,
    COALESCE(sa.daily_finished, 0) as daily_finished,
    COALESCE(sa.weekly_finished, 0) as weekly_finished,
    COALESCE(p.total_seconds, 0) as total_finished,
    p.updated_at
FROM profiles p
LEFT JOIN session_aggregates sa ON p.id = sa.user_id
LEFT JOIN active_sessions asess ON p.id = asess.user_id;

-- 2. RPC to fetch ranking bypassing RLS for global transparency
-- This ensures everyone sees the same global ranking
CREATE OR REPLACE FUNCTION public.get_global_ranking_v3()
RETURNS SETOF public.user_study_stats AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.user_study_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant permissions
GRANT SELECT ON public.user_study_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_ranking_v3() TO anon, authenticated;

-- 4. Trigger to ensure total_seconds is updated if sessions are manually inserted/updated (safety)
CREATE OR REPLACE FUNCTION update_profile_total_seconds()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE profiles SET total_seconds = COALESCE(total_seconds, 0) + NEW.duration_seconds WHERE id = NEW.user_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE profiles SET total_seconds = COALESCE(total_seconds, 0) - OLD.duration_seconds WHERE id = OLD.user_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE profiles SET total_seconds = COALESCE(total_seconds, 0) - OLD.duration_seconds + NEW.duration_seconds WHERE id = NEW.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DROP IF EXISTS to avoid duplication
DROP TRIGGER IF EXISTS tr_update_profile_total_seconds ON study_sessions;

CREATE TRIGGER tr_update_profile_total_seconds
AFTER INSERT OR UPDATE OR DELETE ON study_sessions
FOR EACH ROW EXECUTE FUNCTION update_profile_total_seconds();
