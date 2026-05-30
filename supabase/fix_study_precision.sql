-- AI Studio Build - Final Study Precision & Sync
-- This script ensures the stopwatch and daily totals are mathematically impossible to desync

-- 1. Extend profile to store the "Initial Today Seconds" at session start
-- This allows us to resume any session and know exactly what the "Total Today" was
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_session_initial_seconds INTEGER DEFAULT 0;

-- 2. Precision Daily Stats View
-- This view calculates today's total DIRECTLY from the durable session records
-- It is the ultimate source of truth for "Total Hoje"
CREATE OR REPLACE VIEW public.user_study_stats AS
SELECT 
    p.id AS user_id,
    p.name,
    p.photo_url,
    p.streak,
    COALESCE(SUM(s.duration_seconds) FILTER (
        WHERE (timezone('America/Sao_Paulo', s.created_at))::date = (timezone('America/Sao_Paulo', now()))::date
    ), 0) AS daily_seconds,
    COALESCE(SUM(s.duration_seconds) FILTER (
        WHERE s.created_at >= date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo'
    ), 0) AS weekly_seconds,
    p.total_seconds AS total_seconds_all_time
FROM profiles p
LEFT JOIN study_sessions s ON p.id = s.user_id
GROUP BY p.id, p.name, p.photo_url, p.streak, p.total_seconds;

-- 3. Durable Session Start Function
-- Records exactly when and with how many "today seconds" a session started
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

-- 4. Durable Session End Function
-- Calculates the FINAL duration server-side to avoid client-side drift or tab throttling issues
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

    -- Calculate duration in seconds
    v_duration := EXTRACT(EPOCH FROM (NOW() - v_start))::INTEGER;

    IF v_duration > 0 THEN
        -- Insert the session record
        INSERT INTO study_sessions (user_id, subject, duration_seconds, created_at)
        VALUES (p_user_id, COALESCE(v_subject, 'Geral'), v_duration, NOW());

        -- Update total time in profile
        UPDATE profiles
        SET 
            total_seconds = COALESCE(total_seconds, 0) + v_duration,
            active_session_type = NULL,
            active_session_start = NULL,
            active_session_subject = NULL,
            active_session_initial_seconds = 0,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        -- Also update streak if needed (atomic)
        PERFORM update_study_streak(p_user_id);
    ELSE
        -- Just clear the session if invalid duration
        UPDATE profiles
        SET active_session_type = NULL, active_session_start = NULL, active_session_initial_seconds = 0
        WHERE id = p_user_id;
    END IF;

    RETURN v_duration;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
