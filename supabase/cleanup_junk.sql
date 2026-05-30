-- CLEANUP SCRIPT: DELETE ALL EXCEPT APMBB
-- Este script remove todas as questões do banco que NÃO são da APMBB.

DELETE FROM public.questions
WHERE LOWER(org) != 'apmbb' OR org IS NULL;
