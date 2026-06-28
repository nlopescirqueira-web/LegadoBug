-- Add question_number column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_number INTEGER;

-- Set question_number for Simulado 02 based on PDF order
-- Q01-Q06: História
UPDATE questions SET question_number = 1 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'A democracia ateniense da Antiguidade clássica%';
UPDATE questions SET question_number = 2 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'O feudalismo estruturou-se a partir de relações%';
UPDATE questions SET question_number = 3 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'As práticas econômicas mercantilistas%';
UPDATE questions SET question_number = 4 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'A produção açucareira no Brasil colonial%';
UPDATE questions SET question_number = 5 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'A política dos governadores%';
UPDATE questions SET question_number = 6 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Durante a crise econômica mundial iniciada em 1929%';

-- Q07-Q10: Filosofia
UPDATE questions SET question_number = 7 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'A reflexão sobre o nazifascismo%';
UPDATE questions SET question_number = 8 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Na filosofia platônica%';
UPDATE questions SET question_number = 9 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Na filosofia moderna, o problema do conhecimento%';
UPDATE questions SET question_number = 10 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'No debate contratualista%';

-- Q11-Q14: Sociologia
UPDATE questions SET question_number = 11 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Sobre a divergência entre Karl Popper%';
UPDATE questions SET question_number = 12 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Nos Estados modernos representativos%';
UPDATE questions SET question_number = 13 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'A reflexão apresentada destaca%';
UPDATE questions SET question_number = 14 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'A violência contra a mulher%';

-- Q15-Q20: Geografia
UPDATE questions SET question_number = 15 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%aqui nasce o rio Saracura%';
UPDATE questions SET question_number = 16 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'A instalação do Polo Industrial de Camaçari%';
UPDATE questions SET question_number = 17 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Em 2009, países emergentes%';
UPDATE questions SET question_number = 18 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'O mapa que apresenta a distribuição de assassinatos%';
UPDATE questions SET question_number = 19 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'A rocha analisada%';
UPDATE questions SET question_number = 20 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'O gráfico apresenta a evolução das taxas%';

-- Q21-Q38: Português
UPDATE questions SET question_number = 21 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%A linguagem não é apenas um código de transmissão%';
UPDATE questions SET question_number = 22 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Sobre a palavra labirintos%';
UPDATE questions SET question_number = 23 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'A palavra analisar%';
UPDATE questions SET question_number = 24 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%escritor que domina a palavra sabe%';
UPDATE questions SET question_number = 25 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'De acordo com o texto na frase%';
UPDATE questions SET question_number = 26 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Analise a estrutura da palavra%incerteza%';
UPDATE questions SET question_number = 27 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%Se eles mantivessem a calma%';
UPDATE questions SET question_number = 28 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Sobre o uso do pronome%';
UPDATE questions SET question_number = 29 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Assinale a alternativa que apresenta uma palavra%Texto II%';
UPDATE questions SET question_number = 30 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%Mal sabem que a vitória se constrói%';
UPDATE questions SET question_number = 31 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%Uma única, silenciosa%';
UPDATE questions SET question_number = 32 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%palavra vozearias%';
UPDATE questions SET question_number = 33 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%a sua cabeça anda em serviço de escutar%';
UPDATE questions SET question_number = 34 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Assinale a alternativa em que a palavra%substantivo abstrato%';
UPDATE questions SET question_number = 35 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Quanto à acentuação%';
UPDATE questions SET question_number = 36 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Assinale a alternativa que preenche%';
UPDATE questions SET question_number = 37 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Assinale a alternativa em que o termo destacado%advérbio%';
UPDATE questions SET question_number = 38 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Identifique a alternativa que apresenta%encontro consonantal%';

-- Q39-Q44: Inglês
UPDATE questions SET question_number = 39 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Com base no primeiro parágrafo%Inteligência Artificial%';
UPDATE questions SET question_number = 40 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%Moreover%these technologies can process%';
UPDATE questions SET question_number = 41 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%Despite%the use of AI in policing%';
UPDATE questions SET question_number = 42 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%Cybersecurity is no longer just an IT issue%';
UPDATE questions SET question_number = 43 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%Unless%governments invest heavily%';
UPDATE questions SET question_number = 44 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%These projects are expensive%nevertheless%';

-- Q45-Q56: Matemática
UPDATE questions SET question_number = 45 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Em dezembro de 2025, um equipamento de segurança%';
UPDATE questions SET question_number = 46 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Os números k, k + 2, 3k%';
UPDATE questions SET question_number = 47 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Em um batalhão com 600 soldados%';
UPDATE questions SET question_number = 48 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'A figura abaixo (fora de escala)%trajeto de uma viatura%';
UPDATE questions SET question_number = 49 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Uma unidade da Polícia Militar observou%custo total mensal%';
UPDATE questions SET question_number = 50 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Determine o valor de x na equação logarítmica%';
UPDATE questions SET question_number = 51 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Um oficial comprou uma quantidade x de medalhas%';
UPDATE questions SET question_number = 52 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Um radar monitora a trajetória de um drone%';
UPDATE questions SET question_number = 53 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE '%criptografia de mensagens militares%';
UPDATE questions SET question_number = 54 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Determine o valor de M%resto da divisão%';
UPDATE questions SET question_number = 55 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Considere as aproximações log 2%';
UPDATE questions SET question_number = 56 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'A tarifa de transporte de carga%';

-- Q57-Q62: Física
UPDATE questions SET question_number = 57 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Uma viatura da Polícia Militar, partindo do repouso%';
UPDATE questions SET question_number = 58 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Um drone de patrulhamento%';
UPDATE questions SET question_number = 59 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Um motor de uma viatura possui uma polia%';
UPDATE questions SET question_number = 60 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Um componente metálico de uma viatura%';
UPDATE questions SET question_number = 61 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Um cadete de 80 kg%';
UPDATE questions SET question_number = 62 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Uma equipe de resgate%prancha%';

-- Q63-Q68: Química
UPDATE questions SET question_number = 63 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'O modelo atômico que descreve%';
UPDATE questions SET question_number = 64 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Para separar uma mistura heterogênea%';
UPDATE questions SET question_number = 65 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Considere que em um processo físico de separação%';
UPDATE questions SET question_number = 66 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Durante uma instrução sobre materiais perigosos%';
UPDATE questions SET question_number = 67 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'O aquecimento de uma substância pura%';
UPDATE questions SET question_number = 68 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'As propriedades físicas das substâncias%';

-- Q69-Q74: Biologia
UPDATE questions SET question_number = 69 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Os artrópodes representam%';
UPDATE questions SET question_number = 70 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'No contexto da perícia criminal%';
UPDATE questions SET question_number = 71 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Sobre o processo de transmissão e tradução%';
UPDATE questions SET question_number = 72 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Um casal, ambos com tipo sanguíneo A%';
UPDATE questions SET question_number = 73 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Em relação à divisão celular%';
UPDATE questions SET question_number = 74 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Em missões de policiamento em áreas rurais%';

-- Q75-Q76: Administração Pública
UPDATE questions SET question_number = 75 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'De acordo com a Constituição Federal de 1988%segurança pública%';
UPDATE questions SET question_number = 76 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'O Artigo 37 da Constituição Federal%';

-- Q77-Q80: Informática
UPDATE questions SET question_number = 77 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'No sistema operacional Windows 10%';
UPDATE questions SET question_number = 78 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Ao enviar um e-mail%';
UPDATE questions SET question_number = 79 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'Um Oficial da PM utiliza uma planilha%';
UPDATE questions SET question_number = 80 WHERE org = 'Simulado 02 Legado Militar' AND text LIKE 'No contexto da segurança da informação%';

-- Verify: show any questions without a number
SELECT id, left(text, 60) as texto, question_number
FROM questions
WHERE org = 'Simulado 02 Legado Militar'
ORDER BY question_number NULLS LAST;
