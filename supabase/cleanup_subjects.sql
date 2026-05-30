-- CLEANUP SCRIPT: DELETE SUBJECTS NOT IN THE ALLOWED LIST
-- O usuário solicitou que apenas 5 matérias existissem. 
-- Este script remove as questões indesejadas que poluem o banco.

DELETE FROM public.questions
WHERE LOWER(subject) NOT IN (
    'português', 
    'portugues', 
    'sociologia', 
    'inglês', 
    'ingles', 
    'espanhol', 
    'direito administrativo'
);
