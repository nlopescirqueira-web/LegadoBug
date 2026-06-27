-- ============================================================
-- SIMULADO 3 APMBB - Parte 2 (Questões 35-80)
-- Aguardando Parte 1 (Q1-34) para montar o simulado completo
-- ============================================================

INSERT INTO questions (id, subject, topic, text, options, correct_option_index, org, year, difficulty, institution) VALUES

-- PORTUGUÊS (35-38)
(gen_random_uuid(), 'Português', 'Classes Gramaticais',
'Analise o termo destacado no trecho adaptado do texto: "A dúvida científica cedeu espaço à presunção tecnológica. O que se observa hoje é que o perfil digital tornou-se mais relevante do que o de carne e osso."\n\nAssinale a alternativa que classifica, correta e respectivamente, as classes gramaticais dos termos destacados:',
to_jsonb(ARRAY['Pronome demonstrativo; artigo definido; pronome demonstrativo.', 'Artigo definido; artigo definido; artigo definido.', 'Pronome pessoal oblíquo; pronome demonstrativo; artigo definido.', 'Pronome demonstrativo; pronome pessoal oblíquo; artigo definido.', 'Artigo definido; pronome demonstrativo; pronome demonstrativo.']),
4, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Verbos',
'No trecho: "Hoje, Descartes se reviraria no seu túmulo [...] caso pudesse observar o que se passa na cabeça dos seres humanos.", o verbo destacado expressa:',
to_jsonb(ARRAY['Uma ação habitual no passado, que se repete no presente de forma incontestável.', 'Uma capacidade física ou intelectual plenamente realizada pelo sujeito da oração.', 'Uma hipótese ou condição improvável, situada no campo da irrealidade.', 'Uma permissão concedida por uma autoridade superior no contexto tecnológico.', 'Uma certeza futura, indicando que o filósofo eventualmente observará a sociedade.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Semântica e Interpretação',
'Analise os termos destacados nos trechos abaixo e assinale a alternativa correta quanto à sua função ou sentido.',
to_jsonb(ARRAY['Em "Se alguém me curte, posso adquirir certeza...", o verbo destacado indica uma obrigação imposta pelas regras sociais.', 'No trecho "...não há como verificar a veracidade dele e, assim, mergulho na frustração...", o conectivo estabelece uma relação de oposição.', 'Em "As redes sociais deram origem a universos de consenso absoluto", o termo "origem" funciona como o núcleo do sujeito da oração.', 'No período "Quem curte não curte algo, mas curte o próprio ato de curtir", a conjunção destaca uma ressalva que anula a ideia anterior.', 'Em "O mundo, em suma, não pode existir...", a expressão destacada tem valor conclusivo, sintetizando a ideia exposta anteriormente.']),
4, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Regência e Crase',
'Assinale a alternativa que preenche, correta e respectivamente, as lacunas da frase a seguir, de acordo com a norma-padrão:\n\nO Oficial dirigiu-se ____ sala de reuniões disposto ____ discutir as novas diretrizes de policiamento, visando ____ melhoria da segurança urbana e pedindo atenção ____ todas as sugestões apresentadas.',
to_jsonb(ARRAY['à ... a ... a ... a', 'a ... à ... à ... à', 'à ... a ... à ... a', 'a ... a ... à ... à', 'à ... à ... a ... a']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- INGLÊS (39-44)
(gen_random_uuid(), 'Inglês', 'Interpretação de Texto',
'The Evolution of Proactive Policing in Brazil\n\nThe traditional model of policing in Brazil, historically centered on reactive measures and military-style interventions, has undergone significant scrutiny as crime dynamics evolved in urban centers. During the late 20th century, the focus was primarily on "incident-driven" responses, where police efficiency was measured by the speed of reaction and the number of arrests made. However, this approach often failed to address the root causes of violence, leading to a persistent feeling of insecurity among the population.\n\nIn response to these challenges, several Brazilian states began to experiment with "proximity policing" (policiamento de proximidade). This model seeks to bridge the gap between law enforcement agencies and local residents, fostering mutual trust and cooperation. By integrating social services with strategic patrols, proximity policing aims not only to deter criminal activity but also to revitalize neglected public spaces.\n\nDespite some successful local initiatives, the nationwide implementation of such preventive strategies faces structural obstacles. Limited coordination between the Military and Civil Police forces, coupled with severe budgetary constraints, frequently forces administrators to revert to short-term, repressive tactics. Furthermore, the politicization of security debates often complicates the transition toward a more scientific and evidence-based public safety policy.\n\nAccording to the text, the transition from traditional reactive policing to "proximity policing" in Brazil is primarily motivated by:',
to_jsonb(ARRAY['the military''s demand for more autonomy in urban interventions and strategic arrests.', 'the recognition that simply reacting to incidents was insufficient to tackle the underlying causes of crime.', 'the decrease in urban crime rates observed across all Brazilian capitals during the late 20th century.', 'a nationwide mandate that successfully eliminated the gap between police forces and local residents.', 'the availability of unlimited federal resources specifically allocated for social services in neglected areas.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Interpretação de Texto',
'Based on the fourth paragraph, the increase in municipal and federal involvement in public security in Brazil is primarily a consequence of:',
to_jsonb(ARRAY['the official mandates that strictly prohibit state investments in crime control.', 'the financial constraints that have limited the states'' ability to invest in the sector.', 'a decrease in citizens'' perceptions of insecurity over the last decade.', 'the successful results of state police forces in eliminating organized crime.', 'a political agreement between states to reduce their own police mandates.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Voz Passiva e Ativa',
'Consider the excerpt: "The topic of criminality was seen as a right-wing issue..."\n\nThe underlined verbal structure is in the Passive Voice. Choose the alternative that correctly transforms the following sentence into the Active Voice:\n"Concrete proposals were developed by progressive sectors."',
to_jsonb(ARRAY['Progressive sectors develop concrete proposals.', 'Progressive sectors developed concrete proposals.', 'Progressive sectors are developing concrete proposals.', 'Progressive sectors have developed concrete proposals.', 'Progressive sectors will develop concrete proposals.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Vocabulário',
'In the final paragraph, the text mentions that financial difficulties have "hindered significant investment" in public security.\n\nChoose the alternative that presents a word with a different meaning from the underlined term.',
to_jsonb(ARRAY['obstructed', 'impeded', 'hampered', 'facilitated', 'restricted']),
3, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Conectivos',
'In the sentence: "Regardless of their official mandates, authorities are being pressured to take steps in public security."\n\nThe expression "Regardless of" can be replaced, without changing the meaning of the text, by:',
to_jsonb(ARRAY['Because of', 'In spite of', 'Due to', 'According to', 'Instead of']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Conectivos',
'Consider the sentence: "The financial difficulties faced by the states have hindered significant investment; however, municipal powers have increased in this field."\n\nThe word "however" establishes a relationship of:',
to_jsonb(ARRAY['Conclusion, equivalent to "therefore".', 'Addition, equivalent to "furthermore".', 'Contrast, equivalent to "nevertheless".', 'Condition, equivalent to "provided that".', 'Cause, equivalent to "since".']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- MATEMÁTICA (45-56)
(gen_random_uuid(), 'Matemática', 'Conjuntos e Porcentagem',
'Em um batalhão da Polícia Militar, foi realizada uma pesquisa sobre a especialização dos Oficiais. Sabe-se que:\n\n20% dos oficiais especializados em Policiamento Rodoviário afirmaram, por equívoco no formulário, serem especializados em Policiamento Ambiental;\n\n10% dos oficiais especializados em Policiamento Ambiental também se equivocaram e afirmaram ser do Policiamento Rodoviário;\n\nTodos os demais oficiais das duas áreas preencheram o formulário corretamente;\n\nAo final, o relatório indicou que exatamente 30% do total desses oficiais declararam ser do Policiamento Ambiental.\n\nConsiderando o grupo total formado apenas por esses dois tipos de especialistas, o percentual real de Oficiais de Policiamento Ambiental é de:',
to_jsonb(ARRAY['11,50%', '14,28%', '20,00%', '28,57%', '33,33%']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Divisibilidade',
'Um Oficial de Logística está organizando um lote de munições para um treinamento de tiro. O lote contém entre 400 e 500 cartuchos. Ao tentar organizar esses cartuchos em caixas menores contendo 12, 15 ou 20 unidades cada, o Oficial percebeu que, em qualquer uma dessas formas de agrupamento, sempre sobravam 7 cartuchos fora das caixas.\n\nCom base nessas informações, a soma dos algarismos do número total de cartuchos desse lote é:',
to_jsonb(ARRAY['11', '12', '13', '14', '15']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Sistemas de Equações',
'Um grupo é formado por 80 pessoas, entre homens, mulheres e crianças.\nO número de crianças no grupo é o triplo do número de mulheres menos 2.\n\nSabendo que nesse grupo há menos de 10 homens, a diferença entre o número de mulheres e o número de homens é igual a:',
to_jsonb(ARRAY['4', '5', '6', '7', '8']),
4, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q48 tem imagem (figura geométrica)
(gen_random_uuid(), 'Matemática', 'Geometria - Triângulos',
'Um terreno possui o formato de um quadrilátero conforme a figura abaixo (composta por dois triângulos retângulos). O triângulo PQR possui catetos medindo 20m e 21m. O triângulo PRS possui um cateto RS que mede 20m, e o lado PR é a hipotenusa comum aos dois triângulos.\n\nCom base nessas dimensões, a área total desse terreno e a medida do perímetro externo (lados PQ + QR + RS + SP) são, respectivamente:',
to_jsonb(ARRAY['420m² e 82m', '500m² e 90m', '420m² e 100m', '420m² e 90m', '500m² e 100m']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Geometria Espacial',
'Um batalhão recebeu uma remessa de kits de primeiros socorros acondicionados em uma caixa master com formato de paralelepípedo reto-retângulo, cujas dimensões internas são 80 cm de comprimento, 50 cm de largura e 30 cm de altura. Sabe-se que a caixa está completamente preenchida por 40 estojos individuais idênticos, também em formato de paralelepípedo, sem que haja qualquer espaço vazio entre eles.\n\nCom base nessas informações, o volume de cada estojo individual, em decímetros cúbicos (dm³), é:',
to_jsonb(ARRAY['2,0', '2,5', '3,0', '3,5', '4,0']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q50 tem imagem (tabela)
(gen_random_uuid(), 'Matemática', 'Estatística',
'Um batalhão realizou um teste de aptidão física com um grupo de 50 recrutas. A tabela abaixo apresenta a distribuição das notas obtidas, em uma escala de 0 a 10:\n\nNota 6,0 → 10 recrutas\nNota 7,0 → 15 recrutas\nNota 8,0 → 20 recrutas\nNota 9,0 → 5 recrutas\n\nCom base nos dados apresentados, assinale a alternativa que contém a afirmação correta.',
to_jsonb(ARRAY['A média aritmética das notas dos recrutas foi exatamente 7,5.', 'Exatamente 20% dos recrutas obtiveram nota superior a 8,0.', 'O percentual de recrutas que obtiveram nota 8,0 foi de 40%.', 'Mais de 60% dos recrutas obtiveram nota igual ou inferior a 7,0.', 'A nota média do grupo seria superior a 8,0 se os recrutas de nota 6,0 tivessem tirado 7,0.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Função Quadrática',
'Durante um treinamento de tiro, um projétil é disparado verticalmente para cima. A altura h, em metros, atingida pelo projétil após t segundos é dada pela expressão:\n\nh(t) = −5t² + 20t\n\nSabendo que o projétil atinge 15 metros de altura, o tempo t, em segundos, em que isso ocorre é:',
to_jsonb(ARRAY['1 e 3', '2 e 3', '1 e 2', '2 e 4', '3 e 4']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q52 tem imagem (polígono)
(gen_random_uuid(), 'Matemática', 'Geometria Plana',
'Observe o polígono a seguir.\n\nOs lados AC e BC são paralelos, respectivamente, aos lados ED e FD. Além disso, EF = 1/3 AB, e a área do triângulo ABC mede 81 cm².\n\nA área do polígono ACBFDE é:',
to_jsonb(ARRAY['54 cm²', '57 cm²', '63 cm²', '69 cm²', '72 cm²']),
4, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Logaritmos',
'O valor de X que satisfaz a equação\n\nlog₂(x − 1) + log₂(x − 3) = 3\n\né:',
to_jsonb(ARRAY['3', '4', '5', '6', '7']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Trigonometria',
'Durante um treinamento de orientação, um cadete observa o topo de uma torre sob um ângulo de elevação de 30°. Sabendo que a distância horizontal entre o cadete e a base da torre é de 20 m, e considerando tan30°≈0,577, a altura aproximada da torre, em metros, é:',
to_jsonb(ARRAY['9,5', '10,2', '11,5', '12,8', '14,0']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Equações do 1º Grau',
'Em um treinamento tático, três pelotões participaram de uma corrida. O segundo pelotão possui 8 integrantes a mais que o primeiro, e o terceiro pelotão possui o dobro de integrantes do primeiro.\n\nSabendo que, ao todo, os três pelotões possuem 68 integrantes, o número de integrantes do segundo pelotão é:',
to_jsonb(ARRAY['20', '22', '24', '26', '28']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Proporção e Mistura',
'Um químico preparou duas soluções misturando álcool e água.\n\nNa primeira solução, as quantidades de álcool e água estavam na proporção de 1 para 2.\n\nNa segunda solução, a quantidade de água era o dobro da quantidade de álcool.\n\nDesejando obter uma nova solução, ele misturou quantidades iguais das duas soluções já preparadas, formando uma terceira solução.\n\nA composição da terceira solução é formada por',
to_jsonb(ARRAY['duas partes de álcool e três partes de água.', 'três partes de álcool e cinco partes de água.', 'duas partes de álcool e quatro partes de água.', 'três partes de álcool e quatro partes de água.', 'quatro partes de álcool e cinco partes de água.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- FÍSICA (57-62)
(gen_random_uuid(), 'Física', 'Queda Livre',
'Em um relatório da perícia, foi indicado que um objeto caiu da janela de um apartamento localizado no 12° andar de um prédio. Considerando que cada andar possui altura de 3 m, que a gravidade vale 10 m/s² e desprezando a resistência do ar, determine o tempo de queda do objeto, em segundos:',
to_jsonb(ARRAY['2 s', '2,4s', '2,7s', '3s', '3,6s']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q58 tem imagem (gráfico velocidade x tempo)
(gen_random_uuid(), 'Física', 'Atrito',
'Um motorista trafegava por uma estrada plana e retilínea. Ao perceber um obstáculo na pista, ele começou a frear.\n\nObserva-se que:\n• De 10 s a 20 s, a velocidade diminuiu de 30 m/s para 20 m/s.\n• Nesse intervalo, a única força horizontal atuando é a força de atrito entre os pneus e a pista.\n\nConsidere: g = 10m/s²\n\nQual o valor do coeficiente de atrito?',
to_jsonb(ARRAY['0,05', '0,10', '0,20', '0,30', '0,50']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Trabalho e Energia',
'Durante um treinamento operacional da Polícia Militar em uma pista de testes retilínea e horizontal, uma viatura de massa M mantém uma velocidade constante sob a ação de uma força motora de intensidade F. Sabe-se que as forças de resistência ao movimento (atrito e resistência do ar) somam uma intensidade de 500 N e atuam em sentido oposto ao deslocamento.\n\nConsiderando que a viatura percorre uma distância de 400 m nessas condições e que a aceleração da gravidade local é g = 10 m/s², o trabalho realizado pela força de reação normal exercida pela pista sobre o veículo e o trabalho realizado pela força resultante sobre a viatura são, respectivamente:',
to_jsonb(ARRAY['0 J e 0 J', '200kJ e 0 J', '0 J e 200 kJ', '200 kJ e 200 kJ', '40 kJ e 40 kJ']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Energia Cinética',
'Em uma simulação de perícia de acidente de trânsito, a Polícia Militar analisa o comportamento de uma viatura que se deslocava por uma avenida retilínea. Inicialmente, o veículo de massa m desenvolvia uma velocidade constante de 72 km/h. Após o acionamento do sistema de aceleração em uma perseguição, a energia cinética da viatura foi quadruplicada em relação ao valor inicial.\n\nConsiderando que a massa do veículo permaneceu constante durante o trajeto, o novo valor da velocidade escalar da viatura, expresso em metros por segundo (m/s), é:',
to_jsonb(ARRAY['10', '20', '40', '80', '144']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Circuitos Elétricos',
'Em uma aula prática de manutenção de equipamentos eletrônicos no Curso de Formação de Oficiais, um cadete estuda a função e o comportamento de diversos componentes utilizados em circuitos de corrente contínua. Ao analisar os dispositivos de segurança e medição, bem como elementos de armazenamento de carga, ele deve identificar a afirmação tecnicamente correta sob a ótica da Física Clássica. Considerando as propriedades ideais dos componentes elétricos, assinale a alternativa correta:',
to_jsonb(ARRAY['O voltímetro ideal deve ser conectado em série ao ramo do circuito onde se deseja medir a tensão, apresentando resistência interna nula.', 'O fusível é um dispositivo de segurança projetado para interromper o fluxo de corrente elétrica, fundindo-se quando a intensidade supera um valor nominal.', 'O capacitor, após atingir sua carga máxima em um circuito de corrente contínua, comporta-se como um condutor perfeito, facilitando a passagem da corrente.', 'O amperímetro ideal, para realizar a medição da intensidade de corrente sem interferir no circuito, deve possuir uma resistência interna tendendo ao infinito.', 'A Ponte de Wheatstone tem como finalidade principal a amplificação da força eletromotriz de geradores reais quando o circuito está em equilíbrio.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q62 tem imagem (tabela energia)
(gen_random_uuid(), 'Física', 'Energia Elétrica',
'A tabela apresenta parte das informações contidas em uma conta de energia elétrica de determinada residência.\n\nConsumo de energia mensal (kWh): 140 → Valor a ser pago: R$ 70,00\n\nConsidere que, nessa residência, 10 lâmpadas de 100 W fiquem acesas durante 6 horas por dia, durante um mês de 30 dias. O valor a ser pago pelo consumo exclusivamente das lâmpadas será de:',
to_jsonb(ARRAY['R$50,00', 'R$70,00', 'R$90,00', 'R$100,00', 'R$10,00']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- QUÍMICA (63-68)
(gen_random_uuid(), 'Química', 'Funções Inorgânicas',
'Em um laboratório de química, um estudante se deparou com diferentes substâncias inorgânicas e precisava classificá-las corretamente. Considerando as funções inorgânicas, assinale a alternativa correta:',
to_jsonb(ARRAY['O HCl é um ácido fraco, pois quando dissolvido em água produz uma solução pouco ionizada.', 'O NaOH é uma base forte, pois quando dissolvido em água libera uma grande quantidade de íons OH⁻.', 'O CaO é um óxido ácido, pois é formado pela reação entre um ácido e uma base.', 'O H₂SO₄ é um óxido sulfurado, pois é formado pela combinação do enxofre com o oxigênio.', 'O NaCl é um sal ácido, pois quando dissolvido em água libera íons H⁺.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Modelos Atômicos',
'Acerca do modelo atômico moderno e da distribuição eletrônica dos átomos, assinale a alternativa correta:',
to_jsonb(ARRAY['No modelo atômico moderno, os elétrons giram em órbitas circulares ao redor do núcleo, a maior parte do tempo vazio.', 'O princípio da exclusão de Pauli afirma que dois elétrons em um mesmo átomo não podem ter os quatro números quânticos iguais.', 'A eletronegatividade de um elemento químico é a tendência desse elemento em doar elétrons durante uma reação química.', 'O número atômico de um elemento químico representa a quantidade de nêutrons presentes no núcleo do átomo.', 'O modelo atômico de Rutherford propôs a existência de subníveis e orbitais eletrônicos.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Tabela Periódica',
'Os elementos químicos são organizados na tabela periódica de acordo com suas propriedades e características. A tabela periódica atual é uma evolução da proposta inicialmente por Dmitri Mendeleev em 1871. Com base nessa evolução, sobre a tabela periódica e suas propriedades periódicas, assinale a alternativa correta:',
to_jsonb(ARRAY['A tabela periódica de Mendeleev foi organizada com base no número atômico dos elementos.', 'Os elementos do mesmo grupo ou família na tabela periódica possuem propriedades químicas distintas.', 'O raio atômico dos elementos tende a aumentar da esquerda para a direita em um mesmo período.', 'Os elementos da família VIIA da tabela periódica são conhecidos como halogênios.', 'A tabela periódica atual é organizada com base na massa atômica dos elementos.']),
3, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Ligações Químicas',
'Assinale a alternativa correta sobre as ligações químicas e suas propriedades.',
to_jsonb(ARRAY['A ligação covalente ocorre quando há transferência total de elétrons entre átomos, resultando na formação de íons carregados.', 'A ligação iônica é caracterizada pelo compartilhamento de elétrons entre átomos com eletronegatividades próximas.', 'A geometria molecular tetraédrica ocorre em moléculas que possuem quatro pares de elétrons ao redor do átomo central.', 'As forças de ligação de hidrogênio são um tipo de ligação covalente que ocorre entre átomos de hidrogênio e metais.', 'A polaridade das moléculas não influencia as propriedades físicas e químicas das substâncias.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Estequiometria',
'Em laboratórios de pesquisa, cientistas têm explorado a conversão de algas em biocombustível. Uma das substâncias isoladas a partir dessas algas é a fictícia algolina (C₁₂H₂₄O₇). Considere a reação de combustão total da algolina, balanceada com os menores coeficientes inteiros, produzindo dióxido de carbono e água. A soma desses coeficientes é igual a:',
to_jsonb(ARRAY['246', '236', '123', '133', '90']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Separação de Misturas',
'Em uma análise laboratorial para a identificação de evidências, um perito recebe uma amostra contendo uma mistura de três substâncias: limalha de ferro (ferro em pó), sal de cozinha (cloreto de sódio) e areia. Para separar completamente esses componentes e recuperá-los de forma isolada, o perito deve realizar uma sequência de processos físicos.\n\nAssinale a alternativa que apresenta a sequência correta e ordenada dos métodos de separação para esse caso:',
to_jsonb(ARRAY['Separação magnética, adição de água seguida de filtração, e posterior evaporação ou destilação da fase líquida.', 'Filtração direta da mistura sólida, seguida de decantação e sublimação do ferro.', 'Destilação fracionada para remover o sal, seguida de levigação para separar o ferro da areia.', 'Dissolução fracionada em álcool, seguida de centrifugação e cristalização do ferro.', 'Tamisação (peneiração) para remover o ferro, seguida de flotação para separar o sal da areia.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- BIOLOGIA (69-74)
(gen_random_uuid(), 'Biologia', 'Organelas Celulares',
'O funcionamento harmonioso de uma célula eucariótica depende da especialização de suas organelas citoplasmáticas. Em uma situação de intenso esforço físico, como durante um treinamento de alto rendimento físico na Academia de Polícia Militar do Barro Branco, as células musculares dos cadetes demandam uma conversão rápida de energia química e uma síntese proteica eficiente para a reparação tecidual.\n\nConsidere as funções das organelas celulares e assinale a alternativa que relaciona corretamente a estrutura à sua respectiva função biológica:',
to_jsonb(ARRAY['Lisossomos: responsáveis pela síntese de lipídios e pela desintoxicação celular, atuando principalmente no fígado.', 'Complexo de Golgi: realiza a respiração celular aeróbica, produzindo moléculas de ATP a partir da oxidação da glicose.', 'Ribossomos: atuam na digestão intracelular de partículas fagocitadas ou de organelas obsoletas da própria célula.', 'Mitocôndrias: possuem DNA próprio e são as centrais energéticas da célula, convertendo nutrientes em energia utilizável (ATP).', 'Retículo Endoplasmático Rugoso: armazena, modifica e empacota secreções em vesículas para serem enviadas ao meio extracelular.']),
3, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Vitaminas',
'As vitaminas são compostos orgânicos essenciais que, embora necessários em pequenas quantidades, desempenham funções vitais como cofatores enzimáticos e antioxidantes. Um Oficial da Polícia Militar, atento à saúde e ao vigor físico de sua tropa, deve compreender que a carência vitamínica pode comprometer seriamente a capacidade operacional e a saúde do policial. Sobre as vitaminas e as consequências de suas deficiências no organismo humano, assinale a alternativa correta:',
to_jsonb(ARRAY['A vitamina C (ácido ascórbico) é uma vitamina lipossolúvel cuja carência prolongada leva ao raquitismo, caracterizado pelo enfraquecimento dos ossos.', 'A vitamina K atua diretamente no processo de coagulação sanguínea, e sua deficiência pode resultar em dificuldades de cicatrização e hemorragias.', 'A vitamina A (retinol) é essencial para a saúde visual; sua falta causa o escorbuto, doença que provoca sangramento nas gengivas e queda de dentes.', 'O complexo B é formado por vitaminas lipossolúveis, sendo a vitamina B12 fundamental para evitar a cegueira noturna em ambientes de baixa luminosidade.', 'A vitamina D é produzida exclusivamente por ingestão de frutas cítricas e sua ausência no organismo humano está relacionada à ocorrência do Beribéri.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Parasitologia',
'Em uma atividade de educação sanitária, um grupo de alunos estudou algumas doenças parasitárias comuns no Brasil. Durante a apresentação, foi explicado que determinada doença é causada por um protozoário, transmitida principalmente pela ingestão de água ou alimentos contaminados por cistos, podendo provocar diarreia, dor abdominal e má absorção de nutrientes.\n\nA doença descrita é denominada:',
to_jsonb(ARRAY['Ascaridíase', 'Teníase', 'Giardíase', 'Esquistossomose', 'Ancilostomose']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Genética - Hereditariedade',
'A transmissão das características genéticas entre as gerações ocorre por meio da hereditariedade. Esse processo envolve estruturas celulares e mecanismos responsáveis pela variabilidade genética.\n\nSobre as bases da hereditariedade, é correto afirmar:',
to_jsonb(ARRAY['Os genes são estruturas celulares responsáveis por produzir cromossomos durante a divisão celular.', 'Durante a meiose, cromossomos homólogos podem trocar segmentos de DNA, aumentando a variabilidade genética.', 'A formação dos gametas ocorre por meio da mitose, garantindo que todos tenham o mesmo material genético.', 'Os alelos de um gene permanecem sempre juntos durante a formação dos gametas.', 'Os cromossomos são formados por proteínas e não possuem relação com o DNA.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q73 tem imagem (diagrama cadeia alimentar)
(gen_random_uuid(), 'Biologia', 'Ecologia - Cadeia Alimentar',
'Em uma área de preservação ambiental monitorada pela Polícia Militar Ambiental, biólogos esquematizaram as interações tróficas de um ecossistema local. O diagrama representa as relações de transferência de matéria e energia entre diferentes grupos de organismos.\n\nConsiderando o funcionamento desse ecossistema e as leis da termodinâmica aplicadas à biologia, assinale a alternativa que descreve corretamente a dinâmica dessa cadeia alimentar:',
to_jsonb(ARRAY['Os decompositores atuam exclusivamente sobre os consumidores terciários, garantindo que a energia retorne integralmente aos produtores para reiniciar o ciclo.', 'A quantidade de energia disponível aumenta à medida que se caminha dos produtores em direção aos consumidores de topo, devido ao acúmulo de biomassa.', 'Os organismos produtores ocupam o primeiro nível trófico e são responsáveis por converter a energia luminosa em energia química, que será transferida de forma unidirecional.', 'Um consumidor secundário, ao alimentar-se de um consumidor primário, adquire a mesma quantidade de energia que o produtor fixou inicialmente através da fotossíntese.', 'A transferência de matéria entre os níveis tróficos é unidirecional e finita, enquanto o fluxo de energia é cíclico, sendo reaproveitado totalmente pelos níveis inferiores.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Genética - Cromossomos',
'Durante uma aula de genética, um professor explicou que algumas condições humanas são causadas por alterações no número de cromossomos, decorrentes de falhas na separação cromossômica durante a meiose. Uma dessas condições é caracterizada pela presença de três cromossomos no par 21, resultando em um conjunto cromossômico com 47 cromossomos. Essa alteração cromossômica corresponde à',
to_jsonb(ARRAY['monossomia do cromossomo X.', 'trissomia do cromossomo 21.', 'deleção do cromossomo 5.', 'duplicação do cromossomo 18.', 'trissomia do cromossomo 18.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- ADMINISTRAÇÃO PÚBLICA (75-76)
(gen_random_uuid(), 'Administração Pública', 'Direitos e Deveres Fundamentais',
'De acordo com a Constituição da República Federativa do Brasil de 1988, os direitos e deveres individuais e coletivos garantem a proteção das liberdades fundamentais dos cidadãos, ao mesmo tempo em que estabelecem limites e responsabilidades no convívio em sociedade.\nEntre esses direitos e deveres, é correto afirmar que',
to_jsonb(ARRAY['é livre a manifestação do pensamento, sendo permitido o anonimato para garantir a liberdade de expressão.', 'todos podem reunir-se pacificamente, sem armas, em locais abertos ao público, independentemente de autorização, desde que não frustrem outra reunião anteriormente convocada para o mesmo local.', 'a casa é asilo inviolável do indivíduo, podendo qualquer autoridade pública nela entrar durante a noite, sem consentimento do morador, em caso de investigação criminal.', 'é plena a liberdade de associação, sendo permitida a criação de associações de caráter paramilitar.', 'o sigilo das comunicações telefônicas pode ser quebrado por qualquer autoridade administrativa quando houver interesse público.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Administração Pública', 'Princípios Administrativos',
'Um Oficial da Polícia Militar, responsável pela gestão de recursos humanos em um batalhão, recebe uma solicitação para priorizar a escala de férias de um subordinado que é seu familiar próximo, preterindo outros policiais com maior tempo de serviço e que já haviam protocolado o pedido anteriormente. O Oficial nega o pedido, justificando que sua decisão deve ser pautada pela neutralidade e pela busca do interesse público, e não por simpatias ou vínculos privados.\nA conduta do Oficial, ao negar o tratamento preferencial baseado em vínculos de parentesco, atende primordialmente ao princípio constitucional da:',
to_jsonb(ARRAY['Publicidade, que obriga a transparência absoluta de todos os atos internos da caserna, independentemente do teor.', 'Legalidade, que permite ao administrador público fazer tudo aquilo que a lei não proíbe expressamente no âmbito privado.', 'Eficiência, que busca a redução de custos operacionais por meio da centralização das decisões administrativas no Comando.', 'Impessoalidade, que veda o tratamento discriminatório ou a concessão de privilégios indevidos a particulares no exercício da função.', 'Moralidade, que se resume apenas ao cumprimento estrito do dever legal, desconsiderando juízos de ética ou honestidade.']),
3, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- INFORMÁTICA (77-80)
(gen_random_uuid(), 'Informática', 'E-mail',
'Um Oficial da Polícia Militar precisa enviar um comunicado oficial sobre as diretrizes de uma operação para três destinatários distintos. Ele deseja que:\n\n1- O Coronel Comandante receba o e-mail diretamente como destinatário principal;\n2- O Major Chefe da Seção receba uma cópia, ficando visível para o Coronel que ele também recebeu o documento;\n3- O serviço de inteligência receba uma cópia de forma sigilosa, de modo que nem o Coronel nem o Major saibam que o e-mail foi enviado para este terceiro endereço.\n\nConsiderando as funcionalidades padrão de ferramentas de e-mail (como Outlook ou Gmail), o Oficial deve inserir os endereços do Coronel, do Major e da Inteligência, respectivamente, nos campos:',
to_jsonb(ARRAY['Para; Cco; Cc.', 'Para; Cc; Cco.', 'Cc; Para; Cco.', 'Cco; Cc; Para.', 'Cc; Cco; Para.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Informática', 'Word',
'No Microsoft Word, quando desejamos centralizar um texto ou parágrafo, podemos utilizar um atalho de teclado específico.\nAssinale a alternativa que apresenta o atalho correto para centralizar o texto:',
to_jsonb(ARRAY['Ctrl + L', 'Ctrl + C', 'Ctrl + E', 'Ctrl + R', 'Ctrl + B']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Informática', 'Word',
'Ao redigir um Relatório de Ocorrência no Microsoft Word, em sua configuração padrão, um Oficial da Polícia Militar deseja verificar a existência de espaços extras, quebras de página ou parágrafos vazios que não estão visíveis na impressão. Para visualizar esses caracteres não imprimíveis, o usuário deve clicar no ícone representado pelo símbolo ¶, localizado no grupo Parágrafo da guia Página Inicial. Além disso, para ajustar o texto de modo que ele fique alinhado simultaneamente às margens esquerda e direita, conferindo um aspecto mais formal ao documento, o Oficial deve utilizar o comando de alinhamento:',
to_jsonb(ARRAY['Centralizar.', 'Alinhar à Esquerda.', 'Justificar.', 'Alinhar à Direita.', 'Distribuir.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Informática', 'Protocolos de Internet',
'O protocolo responsável por realizar a troca de páginas entre computadores é o:',
to_jsonb(ARRAY['SMTP', 'POP', 'HTTP', 'IRC', 'FTP']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP');
