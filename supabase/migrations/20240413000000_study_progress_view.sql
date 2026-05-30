-- View for study progress (daily, weekly, total) per user
-- This provides a single source of truth for study time calculations
CREATE OR REPLACE VIEW user_study_stats AS
WITH daily_stats AS (
    SELECT 
        user_id,
        SUM(duration_seconds) as daily_seconds
    FROM study_sessions
    WHERE created_at >= (CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo')
    GROUP BY user_id
),
weekly_stats AS (
    SELECT 
        user_id,
        SUM(duration_seconds) as weekly_seconds
    FROM study_sessions
    WHERE created_at >= (date_trunc('week', CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo'))
    GROUP BY user_id
),
total_stats AS (
    SELECT 
        user_id,
        SUM(duration_seconds) as total_seconds
    FROM study_sessions
    GROUP BY user_id
)
SELECT 
    p.id as user_id,
    p.name,
    p.photo_url,
    p.email,
    COALESCE(d.daily_seconds, 0) as daily_seconds,
    COALESCE(w.weekly_seconds, 0) as weekly_seconds,
    COALESCE(t.total_seconds, 0) as total_seconds_all_time,
    COALESCE(p.streak, 0) as streak
FROM profiles p
LEFT JOIN daily_stats d ON p.id = d.user_id
LEFT JOIN weekly_stats w ON p.id = w.user_id
LEFT JOIN total_stats t ON p.id = t.user_id;
