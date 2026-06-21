-- ============================================================
-- ADMIN DELETE USER
-- Função para excluir permanentemente um usuário
-- Deleta de auth.users (cascade remove profiles e tabelas filhas)
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_admin_id UUID, p_target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_admin_email TEXT;
BEGIN
  -- Verificar se o caller é admin
  SELECT email INTO v_admin_email
  FROM auth.users
  WHERE id = p_admin_id;

  IF v_admin_email NOT IN ('victorpedrorb6@gmail.com', 'pedroxygaming@gmail.com', 'pedrohribeiro35@gmail.com') THEN
    RAISE EXCEPTION 'Unauthorized: not an admin';
  END IF;

  -- Não permitir auto-exclusão
  IF p_admin_id = p_target_user_id THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  -- Limpar dados relacionados (para tabelas sem CASCADE)
  DELETE FROM study_sessions WHERE user_id = p_target_user_id;
  DELETE FROM simulado_attempts WHERE user_id = p_target_user_id::TEXT OR user_id::TEXT = p_target_user_id::TEXT;
  DELETE FROM question_responses WHERE user_id = p_target_user_id;
  DELETE FROM question_comments WHERE user_id = p_target_user_id;
  DELETE FROM flashcards WHERE user_id = p_target_user_id;
  DELETE FROM profiles WHERE id = p_target_user_id;

  -- Deletar do auth.users (remove login permanentemente)
  DELETE FROM auth.users WHERE id = p_target_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID, UUID) TO authenticated;
