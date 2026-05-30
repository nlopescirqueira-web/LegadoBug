-- RANKING REPAIR & SYNC SCRIPT (V7) - SOLVING TYPE ERROR
-- Este script resolve o erro de "cannot change data type of view column" e garante ranking real-time.

-- 1. DROPA DEPENDÊNCIAS PARA EVITAR ERRO DE TIPO (BIGINT VS INTEGER)
DROP FUNCTION IF EXISTS public.get_global_ranking_v3 CASCADE;
DROP VIEW IF EXISTS public.user_study_stats CASCADE;

-- 2. RECALCULA O TOTAL DOS PERFIS BASEADO NAS SESSÕES SALVAS (Opcional, mas garante consistência)
UPDATE profiles p
SET total_seconds = GREATEST(
    COALESCE(p.total_seconds, 0),
    (SELECT COALESCE(SUM(duration_seconds), 0) FROM study_sessions WHERE user_id = p.id)
);

-- 3. RECRIAR A VIEW DE RANKING REAL-TIME
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
    (COALESCE(ss.daily_finished, 0) + COALESCE(at.running_seconds, 0))::INTEGER AS daily_seconds,
    -- SEMANAL: SESSÕES DA SEMANA + CRONÔMETRO ATUAL
    (COALESCE(ss.weekly_finished, 0) + COALESCE(at.running_seconds, 0))::INTEGER AS weekly_seconds,
    -- GERAL: O MAIOR ENTRE (TOTAL SALVO NO PERFIL) E (SOMA DE TODAS AS SESSÕES) + CRONÔMETRO ATUAL
    (GREATEST(COALESCE(p.total_seconds, 0), COALESCE(ss.total_history, 0)) + COALESCE(at.running_seconds, 0))::INTEGER AS total_seconds_all_time,
    -- METADADOS PARA O APP
    COALESCE(ss.daily_finished, 0)::INTEGER as daily_finished,
    COALESCE(ss.weekly_finished, 0)::INTEGER as weekly_finished,
    GREATEST(COALESCE(p.total_seconds, 0), COALESCE(ss.total_history, 0))::INTEGER as total_finished
FROM profiles p
LEFT JOIN session_stats ss ON p.id = ss.user_id
LEFT JOIN active_timer at ON p.id = at.user_id;

-- 4. RECRIA O RPC COM A NOVA LÓGICA E SECURITY DEFINER
-- O security definer garante que a função veja todos os usuários ignorando RLS restritivo se houver.
CREATE OR REPLACE FUNCTION public.get_global_ranking_v3()
RETURNS SETOF public.user_study_stats AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.user_study_stats ORDER BY total_seconds_all_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. GARANTE PERMISSÕES
GRANT SELECT ON public.user_study_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_ranking_v3() TO anon, authenticated;
