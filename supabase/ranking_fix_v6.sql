-- RANKING REPAIR & SYNC SCRIPT (V6)
-- Este script limpa inconsistências e garante que o ranking seja 100% real-time e preciso.

-- 1. RECALCULA O TOTAL DOS PERFIS BASEADO NAS SESSÕES SALVAS
-- Isso resolve o problema de usuários com tempo "sumido" no ranking mas presente no histórico
UPDATE profiles p
SET total_seconds = GREATEST(
    COALESCE(p.total_seconds, 0),
    (SELECT COALESCE(SUM(duration_seconds), 0) FROM study_sessions WHERE user_id = p.id)
);

-- 2. VIEW DE RANKING REAL-TIME (SOMA TUDO)
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
session_stats AS (
    SELECT 
        user_id,
        COALESCE(SUM(duration_seconds) FILTER (
            WHERE (timezone('America/Sao_Paulo', created_at))::date = (timezone('America/Sao_Paulo', now()))::date
        ), 0) AS daily_finished,
        COALESCE(SUM(duration_seconds) FILTER (
            WHERE created_at >= date_trunc('week', (now() AT TIME ZONE 'America/Sao_Paulo')) AT TIME ZONE 'America/Sao_Paulo'
        ), 0) AS weekly_finished,
        COALESCE(SUM(duration_seconds), 0) AS total_history
    FROM study_sessions
    GROUP BY user_id
)
SELECT 
    p.id AS user_id,
    p.name,
    p.photo_url,
    p.streak,
    -- DIARIO: SESSÕES DE HOJE + CRONÔMETRO ATUAL
    (COALESCE(ss.daily_finished, 0) + COALESCE(at.running_seconds, 0)) AS daily_seconds,
    -- SEMANAL: SESSÕES DA SEMANA + CRONÔMETRO ATUAL
    (COALESCE(ss.weekly_finished, 0) + COALESCE(at.running_seconds, 0)) AS weekly_seconds,
    -- GERAL: O MAIOR ENTRE (TOTAL SALVO NO PERFIL) E (SOMA DE TODAS AS SESSÕES) + CRONÔMETRO ATUAL
    (GREATEST(COALESCE(p.total_seconds, 0), COALESCE(ss.total_history, 0)) + COALESCE(at.running_seconds, 0)) AS total_seconds_all_time,
    -- METADADOS PARA O APP
    COALESCE(ss.daily_finished, 0) as daily_finished,
    COALESCE(ss.weekly_finished, 0) as weekly_finished,
    GREATEST(COALESCE(p.total_seconds, 0), COALESCE(ss.total_history, 0)) as total_finished
FROM profiles p
LEFT JOIN session_stats ss ON p.id = ss.user_id
LEFT JOIN active_timer at ON p.id = at.user_id;

-- 3. RECRIA O RPC COM A NOVA LÓGICA
CREATE OR REPLACE FUNCTION public.get_global_ranking_v3()
RETURNS SETOF public.user_study_stats AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.user_study_stats ORDER BY total_seconds_all_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. GARANTE PERMISSÕES
GRANT SELECT ON public.user_study_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_ranking_v3() TO anon, authenticated;
