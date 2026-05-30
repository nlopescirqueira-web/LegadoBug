-- AI Studio Build - Essential Fixes for Study Streak and Performance
-- This script implements server-side logic for durable study streaks and robust performance tracking

-- 1. Performance: Indexes for fast querying (Today, 7 days, 30 days, etc.)
CREATE INDEX IF NOT EXISTS idx_question_responses_user_created ON question_responses(user_id, created_at);

-- 2. Streak Logic: Stored Function to handle streak updates atomically in DB
-- This avoids client-side race conditions and timezone inconsistencies
CREATE OR REPLACE FUNCTION public.update_study_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_last_study DATE;
    v_today DATE;
    v_streak INTEGER;
    v_new_streak INTEGER;
BEGIN
    -- Get today's date in Brasilia time (offset -03)
    -- This ensures consistency between client and server
    v_today := (timezone('America/Sao_Paulo', now()))::date;
    
    -- Get current streak and last study date from profile
    SELECT streak, last_login_date::date INTO v_streak, v_last_study
    FROM profiles
    WHERE id = p_user_id;

    IF v_last_study IS NULL THEN
        -- First time studying
        v_new_streak := 1;
    ELSIF v_last_study = v_today THEN
        -- Already studied today, keep current streak
        v_new_streak := v_streak;
    ELSIF v_last_study = v_today - INTERVAL '1 day' THEN
        -- Studied yesterday, increment streak
        v_new_streak := COALESCE(v_streak, 0) + 1;
    ELSE
        -- Missed a day or more, restart streak at 1
        v_new_streak := 1;
    END IF;

    -- Update the profile
    UPDATE profiles
    SET 
        streak = v_new_streak,
        last_login_date = v_today::text,
        updated_at = now()
    WHERE id = p_user_id;

    RETURN v_new_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Proactive Streak Check: Function to reset streak to 0 if a day was missed
-- Can be called on login or via manual refresh
CREATE OR REPLACE FUNCTION public.check_streak_health(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_last_study DATE;
    v_today DATE;
    v_streak INTEGER;
BEGIN
    v_today := (timezone('America/Sao_Paulo', now()))::date;
    
    SELECT streak, last_login_date::date INTO v_streak, v_last_study
    FROM profiles
    WHERE id = p_user_id;

    -- If last study was NOT today AND NOT yesterday, the streak is officially broken (0)
    IF v_last_study IS NOT NULL AND v_last_study < v_today - INTERVAL '1 day' THEN
        UPDATE profiles
        SET streak = 0
        WHERE id = p_user_id;
        RETURN 0;
    END IF;

    RETURN COALESCE(v_streak, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure created_at is always set correctly in sessions
ALTER TABLE study_sessions ALTER COLUMN created_at SET DEFAULT NOW();
