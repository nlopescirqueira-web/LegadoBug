-- Fix Q24 text-base: remove question_number from Texto I row
UPDATE questions SET question_number = NULL
WHERE org = 'Simulado 02 Legado Militar'
AND text LIKE 'Texto I (Questões 21 a 25)%';

-- Insert 5 missing questions for Simulado 02

-- Q21 - Português / Morfologia
INSERT INTO questions (id, subject, topic, text, options, correct_option_index, org, year, difficulty, institution, question_number)
VALUES (
  gen_random_uuid(), 'Português', 'Morfologia',
  'Texto I (Questões 21 a 25)
"A linguagem não é apenas um código de transmissão; é um organismo vivo que respira as ambiguidades da alma humana. Frequentemente, nos perdemos em labirintos gramaticais, esquecendo que a norma culta existe para iluminar, e não para obscurecer o sentido. O escritor que domina a palavra sabe que um adjetivo mal colocado é como uma nota dissonante em uma sinfonia. É preciso analisar o silêncio, pois ele contém as sílabas que ainda não ousamos pronunciar."

No trecho "A linguagem não é apenas um código de transmissão; é um organismo vivo...", a palavra destacada funciona morfologicamente como:',
  to_jsonb(ARRAY['Substantivo concreto, designando um ser biológico.', 'Adjetivo, qualificando o substantivo "organismo" e atribuindo-lhe uma característica dinâmica.', 'Advérbio de modo, indicando como a linguagem se comporta.', 'Particípio verbal com valor passivo.', 'Pronome indefinido, indicando uma generalização.']),
  1, 'Simulado 02 Legado Militar', '2026', 'Médio', 'VUNESP', 21
);

-- Q26 - Português / Formação de Palavras
INSERT INTO questions (id, subject, topic, text, options, correct_option_index, org, year, difficulty, institution, question_number)
VALUES (
  gen_random_uuid(), 'Português', 'Formação de Palavras',
  'Texto II (Questões 26 a 30)
"O tempo é um rio que me arrebata, mas eu sou o rio. Os homens de armas, em sua ascensão constante, acreditam que a força bruta resolve a incerteza do amanhã. Mal sabem que a vitória se constrói na paciência. Se eles mantivessem a calma, talvez enxergassem que o inimigo mais perigoso é o próprio orgulho. A honra, porém, não lhes permite o recuo."

Analise a estrutura da palavra "incerteza", sublinhada no trecho: "A incerteza quanto ao futuro assolava os candidatos." Assinale a alternativa que apresenta uma palavra formada pelo mesmo processo de derivação',
  to_jsonb(ARRAY['Infelizmente', 'Anoitecer', 'Planalto', 'Passatempo', 'Ilegal']),
  0, 'Simulado 02 Legado Militar', '2026', 'Médio', 'VUNESP', 26
);

-- Q31 - Português / Figuras de Linguagem
INSERT INTO questions (id, subject, topic, text, options, correct_option_index, org, year, difficulty, institution, question_number)
VALUES (
  gen_random_uuid(), 'Português', 'Figuras de Linguagem',
  'Texto III (Fragmento Literário)
"E o caso se vai seguindo, estória sem história. Uma única, silenciosa, sombra se instalou: de noite, a mãe deixou de dormir. Horas a fio a sua cabeça anda em serviço de escutar, a ver se regressam as vozearias das aves." (Mia Couto)

No trecho "Uma única, silenciosa, sombra se instalou", o uso das vírgulas e a escolha dos adjetivos visam:',
  to_jsonb(ARRAY['Enumerar ações rápidas da personagem.', 'Enfatizar a natureza opressiva e solitária do luto da mãe.', 'Corrigir um erro de concordância nominal.', 'Indicar que a sombra é um personagem físico que entrou no quarto.', 'Separar orações coordenadas sindéticas.']),
  1, 'Simulado 02 Legado Militar', '2026', 'Médio', 'VUNESP', 31
);

-- Q39 - Inglês / Interpretação de Texto
INSERT INTO questions (id, subject, topic, text, options, correct_option_index, org, year, difficulty, institution, question_number)
VALUES (
  gen_random_uuid(), 'Inglês', 'Interpretação de Texto',
  'Texto para as questões de 39 a 42
The Rise of Artificial Intelligence in Public Safety
The integration of Artificial Intelligence (AI) into law enforcement and public safety is no longer a futuristic concept but a present reality. Proponents argue that AI-driven tools, such as predictive policing algorithms and facial recognition, can enhance the efficiency of police forces by identifying crime hotspots and locating missing persons more quickly. Moreover, these technologies can process vast amounts of data far beyond human capability, potentially preventing incidents before they occur.
Despite these advantages, the use of AI in policing is not without controversy. Civil liberties advocates express significant concerns regarding privacy, surveillance, and the potential for algorithmic bias. If the data used to train these systems contains historical prejudices, the AI may inadvertently perpetuate or even amplify discrimination against certain communities. Therefore, many jurisdictions are now calling for strict regulations to ensure that AI is used ethically and transparently accountably.
The challenge for the future lies in balancing the benefits of technological innovation with the protection of fundamental human rights. As AI continues to evolve, public safety agencies must remain vigilant to ensure that these tools serve the entire population fairly.

Com base no primeiro parágrafo, uma das vantagens atribuídas ao uso da Inteligência Artificial na segurança pública é:',
  to_jsonb(ARRAY['A substituição total de oficiais humanos por algoritmos autônomos.', 'A capacidade de processar grandes volumes de dados para prever incidentes.', 'A eliminação imediata de todos os crimes em áreas urbanas.', 'O fim da necessidade de patrulhamento em áreas consideradas de risco.', 'A redução dos custos de treinamento para novos recrutas da polícia.']),
  1, 'Simulado 02 Legado Militar', '2026', 'Médio', 'VUNESP', 39
);

-- Q43 - Inglês / Conectivos
INSERT INTO questions (id, subject, topic, text, options, correct_option_index, org, year, difficulty, institution, question_number)
VALUES (
  gen_random_uuid(), 'Inglês', 'Conectivos',
  'Texto para as questões 43 e 44
Climate Change and Coastal Defense
Rising sea levels pose a direct threat to coastal cities worldwide. To mitigate this, engineers are developing sophisticated sea walls and natural barriers. Unless governments invest heavily in these defense systems now, the economic and human cost of flooding will become unsustainable by 2050. These projects are expensive; nevertheless, they are essential for the survival of millions of people living in low-lying areas.

No trecho — Unless governments invest heavily in these defense systems now... — a palavra sublinhada introduz uma:',
  to_jsonb(ARRAY['Concessão.', 'Condição negativa (A menos que).', 'Finalidade.', 'Proporção.', 'Certeza absoluta.']),
  1, 'Simulado 02 Legado Militar', '2026', 'Médio', 'VUNESP', 43
);

-- Verify: show all questions ordered by question_number
SELECT question_number, subject, left(text, 80) as texto
FROM questions
WHERE org = 'Simulado 02 Legado Militar'
ORDER BY question_number NULLS LAST;
