-- MASTER FIX FOR RANKING V5 - AGGREGATING ALL SOURCES
-- Este script garante que o ranking pegue o tempo de TODAS as fontes possíveis (profiles e study_sessions)
-- e resolve o erro onde o tempo local não batia com o ranking.

-- 1. VIEW DE RANKING REAL-TIME ROBUSTA
CREATE OR REPLACE VIEW public.user_study_stats AS
WITH active_timer AS (
    -- Tempo do cronômetro que está rodando AGORA
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
    -- Somas das sessões finalizadas na tabela study_sessions
    SELECT 
        user_id,
        COALESCE(SUM(duration_seconds) FILTER (
            WHERE (timezone('America/Sao_Paulo', created_at))::date = (timezone('America/Sao_Paulo', now()))::date
        ), 0) AS daily_finished,
        COALESCE(SUM(duration_seconds) FILTER (
            WHERE created_at >= date_trunc('week', (now() AT TIME ZONE 'America/Sao_Paulo')) AT TIME ZONE 'America/Sao_Paulo'
        ), 0) AS weekly_finished,
        COALESCE(SUM(duration_seconds), 0) AS total_history_finished
    FROM study_sessions
    GROUP BY user_id
)
SELECT 
    p.id AS user_id,
    p.name,
    p.photo_url,
    p.streak,
    -- Diário: Máximo entre o campo no perfil (se atualizado) e a soma das sessões, + tempo rodando agora
    (GREATEST(COALESCE(ss.daily_finished, 0), 0) + COALESCE(at.running_seconds, 0)) AS daily_seconds,
    -- Semanal: Soma das sessões da semana + tempo rodando agora
    (COALESCE(ss.weekly_finished, 0) + COALESCE(at.running_seconds, 0)) AS weekly_seconds,
    -- Geral: O MAIOR entre total_seconds (salvo no profile) e a soma total de todas as sessões, + tempo rodando agora
    (GREATEST(COALESCE(p.total_seconds, 0), COALESCE(ss.total_history_finished, 0)) + COALESCE(at.running_seconds, 0)) AS total_seconds_all_time,
    -- Metadados para o app
    COALESCE(ss.daily_finished, 0) as daily_finished,
    COALESCE(ss.weekly_finished, 0) as weekly_finished,
    GREATEST(COALESCE(p.total_seconds, 0), COALESCE(ss.total_history_finished, 0)) as total_finished
FROM profiles p
LEFT JOIN session_stats ss ON p.id = ss.user_id
LEFT JOIN active_timer at ON p.id = at.user_id;

-- 2. RECRIA A FUNÇÃO RPC (GARANTE QUE ELA USE A VIEW ATUALIZADA)
CREATE OR REPLACE FUNCTION public.get_global_ranking_v3()
RETURNS SETOF public.user_study_stats AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.user_study_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PERMISSÕES
GRANT SELECT ON public.user_study_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_ranking_v3() TO anon, authenticated;
