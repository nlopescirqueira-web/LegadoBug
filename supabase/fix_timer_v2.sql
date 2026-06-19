-- ============================================================
-- FIX TIMER SYSTEM v2
-- Corrige o problema de contagem dupla/tripla de horas
-- ============================================================
-- PROBLEMA:
-- 1. Syncs periódicos (a cada 60s) inserem linhas em study_sessions
-- 2. end_study_session TAMBÉM insere uma linha com a duração TOTAL da sessão
-- 3. end_study_session TAMBÉM faz total_seconds += duration (duplicado com o trigger)
-- 4. Resultado: horas infladas 2-3x no banco
-- ============================================================
-- SOLUÇÃO:
-- end_study_session apenas limpa o estado da sessão ativa, sem inserir linhas
-- O cliente (browser) é responsável por inserir as linhas via syncs periódicos
-- ============================================================

-- 1. CORRIGIR end_study_session: NÃO inserir linhas, NÃO atualizar total_seconds
CREATE OR REPLACE FUNCTION public.end_study_session(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_start TIMESTAMPTZ;
    v_duration INTEGER;
BEGIN
    SELECT active_session_start INTO v_start
    FROM profiles
    WHERE id = p_user_id;

    IF v_start IS NULL THEN
        RETURN 0;
    END IF;

    v_duration := EXTRACT(EPOCH FROM (NOW() - v_start))::INTEGER;

    UPDATE profiles
    SET
        active_session_type = NULL,
        active_session_start = NULL,
        active_session_subject = NULL,
        active_session_initial_seconds = 0,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN v_duration;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RECALCULAR profiles.total_seconds a partir das sessões reais
-- Isso corrige valores inflados de sessões passadas
UPDATE profiles p
SET total_seconds = (
    SELECT COALESCE(SUM(duration_seconds), 0)
    FROM study_sessions
    WHERE user_id = p.id
);

-- 3. GARANTIR PERMISSÕES
GRANT EXECUTE ON FUNCTION public.end_study_session(UUID) TO authenticated;
