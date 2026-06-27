-- ============================================================
-- SIMULADO 2 APMBB - Legado Militar PM SP Oficial
-- 80 questões com gabarito
-- ============================================================

-- Inserir as 80 questões
INSERT INTO questions (id, subject, topic, text, options, correct_option_index, org, year, difficulty, institution) VALUES

-- HISTÓRIA (1-6)
(gen_random_uuid(), 'História', 'Democracia Antiga e Moderna',
'A democracia ateniense da Antiguidade clássica baseava-se na participação direta dos cidadãos nas decisões políticas, restrita a um grupo específico da população. Mulheres, estrangeiros e escravizados eram excluídos desse processo. Ainda assim, a experiência ateniense é frequentemente tomada como referência para reflexões sobre a democracia nas sociedades contemporâneas. A partir do excerto, é correto afirmar que a relação entre a democracia antiga e a moderna se estabelece pela',
to_jsonb(ARRAY['manutenção integral dos critérios de cidadania adotados na Antiguidade clássica.', 'ampliação histórica dos direitos políticos, apesar da permanência de mecanismos de exclusão social.', 'substituição completa da participação direta pelo exercício do poder por elites políticas.', 'negação do legado político grego, considerado incompatível com o mundo moderno.', 'igualdade de acesso aos direitos políticos desde suas origens históricas.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'História', 'Feudalismo',
'O feudalismo estruturou-se a partir de relações pessoais de dependência, como os vínculos entre senhores e vassalos, baseados na posse da terra e na prestação de serviços. Ao longo do tempo, especialmente a partir do Iluminismo, essa organização social passou a ser interpretada como símbolo de atraso e opressão, visão que influenciou a memória histórica da Idade Média. Com base no texto, é correto concluir que',
to_jsonb(ARRAY['a interpretação negativa do feudalismo foi construída exclusivamente durante o período medieval.', 'o feudalismo eliminou conflitos sociais ao garantir estabilidade política e econômica.', 'a visão crítica sobre a Idade Média resulta de leituras posteriores, influenciadas por valores modernos.', 'a sociedade feudal caracterizou-se pela igualdade entre os diferentes grupos sociais.', 'os pensadores iluministas defenderam a preservação das estruturas feudais.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'História', 'Mercantilismo',
'As práticas econômicas mercantilistas, adotadas no contexto da formação dos Estados modernos europeus, estavam voltadas ao fortalecimento do poder estatal. Nesse sentido, o mercantilismo representou',
to_jsonb(ARRAY['a acumulação de riquezas por meio da exploração colonial e da adoção de políticas protecionistas.', 'a expansão do comércio internacional baseada na livre concorrência entre as nações.', 'a diminuição da intervenção do Estado na economia, regulada pelas forças do mercado.', 'a defesa dos interesses da burguesia industrial como eixo central das decisões econômicas.', 'a superação das formas compulsórias de trabalho como condição para o crescimento econômico.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'História', 'Brasil Colonial',
'A produção açucareira no Brasil colonial inseriu-se em uma dinâmica econômica mais ampla, articulada ao sistema colonial e às demandas do mercado europeu. Nesse contexto, a atividade açucareira esteve associada',
to_jsonb(ARRAY['à pequena propriedade rural, ao trabalho livre e ao abastecimento prioritário do mercado interno.', 'ao emprego predominante da mão de obra indígena e à autonomia econômica da colônia.', 'à formação do latifúndio, ao uso do trabalho escravizado africano e à exportação para a Europa.', 'à diversificação produtiva, à industrialização local e à redução da dependência externa.', 'ao comércio regional com outras colônias americanas e à descentralização da produção.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'História', 'República Velha',
'A política dos governadores, implementada durante a Primeira República, buscou garantir a estabilidade política do regime republicano por meio de acordos entre o governo federal e as lideranças estaduais. Essa política caracterizou-se, principalmente,',
to_jsonb(ARRAY['pelo fortalecimento do poder central por meio da intervenção direta nos governos estaduais.', 'pela imposição de reformas eleitorais que garantiam eleições livres e competitivas.', 'pelo apoio do governo federal às oligarquias estaduais em troca de sustentação política no Congresso.', 'pela exclusão das elites regionais do processo decisório nacional.', 'pela centralização administrativa inspirada nos modelos europeus de Estado.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'História', 'Crise de 1929 e Keynesianismo',
'Durante a crise econômica mundial iniciada em 1929, o economista John Maynard Keynes defendeu a adoção de políticas que rompessem com os princípios clássicos do liberalismo econômico, atribuindo ao Estado um papel ativo na recuperação da economia. A posição defendida por Keynes caracterizava-se, fundamentalmente,',
to_jsonb(ARRAY['pela defesa do equilíbrio orçamentário e da redução dos gastos públicos em períodos de crise.', 'pela valorização do livre mercado como mecanismo exclusivo de autorregulação econômica.', 'pela intervenção do Estado na economia como forma de estimular a produção e o emprego.', 'pela crítica ao capitalismo industrial e pela proposta de sua superação por um modelo socialista.', 'pela ênfase no controle da inflação como principal instrumento de crescimento econômico.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- FILOSOFIA (7-10)
(gen_random_uuid(), 'Filosofia', 'Nazifascismo',
'A reflexão sobre o nazifascismo envolve o debate acerca da responsabilidade individual, da participação social e das características dos regimes políticos autoritários no século XX. Nesse sentido, a experiência nazifascista pode ser compreendida como',
to_jsonb(ARRAY['uma forma de governo democrática, sustentada pela participação direta da população nas decisões políticas.', 'um regime autoritário de caráter totalitário, marcado pelo controle do Estado sobre a sociedade e pela repressão às liberdades individuais.', 'um modelo político liberal, baseado na livre concorrência partidária e no pluralismo ideológico.', 'uma expressão exclusiva do antissemitismo europeu, sem relação com a estrutura do Estado.', 'um sistema político transitório, incapaz de mobilizar amplos setores da sociedade.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Filosofia', 'Platão e Arte',
'Na filosofia platônica, a reflexão sobre a arte está diretamente relacionada à distinção entre aparência e essência, bem como ao problema do conhecimento verdadeiro. Nesse sentido, para Platão, a produção artística',
to_jsonb(ARRAY['contribui diretamente para o acesso ao conhecimento verdadeiro das ideias.', 'deve ser valorizada por sua capacidade de representar fielmente a realidade sensível.', 'afasta o indivíduo do conhecimento racional, por se basear na imitação das aparências.', 'exerce função educativa central na formação moral dos cidadãos da pólis.', 'supera a filosofia ao permitir a apreensão imediata da verdade.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Filosofia', 'Epistemologia Moderna',
'Na filosofia moderna, o problema do conhecimento deu origem a diferentes correntes epistemológicas, que buscaram explicar a origem e os limites das ideias humanas. Nesse contexto, o debate central estabeleceu-se entre',
to_jsonb(ARRAY['racionalistas e empiristas, que divergiam quanto à origem do conhecimento.', 'sofistas e socráticos, em torno da relatividade da verdade.', 'escolásticos e iluministas, a respeito da relação entre fé e razão.', 'platônicos e aristotélicos, sobre a existência do mundo das ideias.', 'positivistas e criticistas, quanto ao método científico.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Filosofia', 'Contratualismo',
'No debate contratualista da filosofia moderna, diferentes autores formularam explicações distintas sobre a origem do Estado e os fundamentos do poder político, especialmente no que se refere aos direitos naturais e ao contrato social. Nesse contexto, é correto afirmar que',
to_jsonb(ARRAY['Rousseau defendia um Estado autoritário como forma de garantir a ordem social.', 'Hobbes sustentava o direito de resistência como princípio central do contrato social.', 'Locke afirmava que o Estado deveria proteger direitos naturais, como a vida, a liberdade e a propriedade.', 'o estado de natureza, para os contratualistas, caracterizava-se pela harmonia entre os indivíduos.', 'o contrato social eliminava a necessidade de qualquer forma de governo civil.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- SOCIOLOGIA (11-14)
(gen_random_uuid(), 'Sociologia', 'Filosofia da Ciência',
'Sobre a divergência entre Karl Popper e Thomas Kuhn acerca do progresso científico, assinale a alternativa correta:',
to_jsonb(ARRAY['Para Popper, a ciência progride por acúmulo de verdades absolutas; para Kuhn, o processo é irracional.', 'Kuhn defende o falsificacionismo como motor da ciência, enquanto Popper foca na análise dos paradigmas.', 'Popper propõe que a ciência avança pelo descarte de teorias refutadas; Kuhn afirma que ela muda por revoluções de paradigmas.', 'Ambos concordam que a ciência normal é o estado ideal e definitivo da investigação científica.', 'Popper sustenta o método indutivo como base da ciência, enquanto Kuhn defende o dogmatismo científico permanente.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Sociologia', 'Democracia e Direitos',
'Nos Estados modernos representativos, as liberdades civis e a participação política são elementos interdependentes, fundamentais para a consolidação do regime democrático. A esse respeito, é correto afirmar que',
to_jsonb(ARRAY['a democracia contemporânea dispensa garantias institucionais para o exercício das liberdades civis.', 'o modelo democrático brasileiro caracteriza-se pela restrição do direito ao voto por critérios econômicos.', 'os Estados democráticos contemporâneos reconhecem e protegem os direitos humanos em âmbito internacional.', 'todo regime democrático adota obrigatoriamente o presidencialismo como forma de governo.', 'a participação popular torna desnecessária a atuação coercitiva do Estado.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Sociologia', 'Feminismo e Raça',
'A reflexão apresentada destaca a importância de considerar simultaneamente as dimensões de raça e gênero na análise dos movimentos sociais contemporâneos, evidenciando tensões internas no interior do feminismo. A partir desse debate histórico, é correto afirmar que',
to_jsonb(ARRAY['os movimentos feministas sempre incorporaram de maneira homogênea as pautas raciais.', 'as lutas por direitos civis e por igualdade de gênero constituem processos históricos concluídos.', 'a conquista de direitos por mulheres e pela população negra resultou de mobilizações sociais ainda em desenvolvimento.', 'as reivindicações do movimento negro limitaram-se exclusivamente ao campo econômico.', 'as diferenças raciais foram irrelevantes na organização do feminismo ao longo do século XX.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Sociologia', 'Violência contra a Mulher',
'A violência contra a mulher constitui um problema social de grande relevância no Brasil, exigindo a atuação do Estado por meio de instrumentos jurídicos específicos de proteção e enfrentamento. Nesse contexto, destaca-se como marco legal no combate à violência doméstica e familiar contra a mulher',
to_jsonb(ARRAY['a Constituição de 1824, que instituiu direitos civis no período imperial.', 'a Declaração Universal dos Direitos Humanos, incorporada automaticamente ao ordenamento brasileiro.', 'o Estatuto da Criança e do Adolescente, voltado à proteção integral da juventude.', 'a Lei nº 11.340/2006, conhecida como Lei Maria da Penha.', 'o Código Civil de 1916, que regulamentou as relações familiares no início da República.']),
3, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- GEOGRAFIA (15-20)
(gen_random_uuid(), 'Geografia', 'Urbanização de São Paulo',
'A frase "aqui nasce o rio Saracura", presente em área urbana da cidade de São Paulo, evidencia transformações ocorridas no espaço urbano ao longo do processo de urbanização. A partir dessa informação, é correto afirmar que',
to_jsonb(ARRAY['o crescimento urbano implicou a canalização e o ocultamento de cursos d''água originalmente visíveis na paisagem.', 'os rios urbanos mantiveram suas características naturais, mesmo diante da expansão da cidade.', 'a urbanização paulista priorizou a preservação integral das nascentes e margens fluviais.', 'a expansão da cidade ocorreu sem impactos significativos sobre a rede hidrográfica local.', 'os recursos hídricos deixaram de exercer influência sobre a organização do espaço urbano.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Geografia', 'Industrialização do Nordeste',
'A instalação do Polo Industrial de Camaçari, na Bahia, representou uma mudança significativa na estrutura produtiva do estado, ao integrar-se ao processo de industrialização brasileira no século XX.',
to_jsonb(ARRAY['da desconcentração industrial, com a interiorização e regionalização dos investimentos produtivos no território nacional.', 'da consolidação das zonas francas voltadas exclusivamente à exportação de produtos primários.', 'da centralização industrial no eixo Rio–São Paulo, intensificada no final do século XX.', 'da substituição das atividades industriais por serviços especializados no Nordeste.', 'da implantação de políticas neoliberais voltadas à redução da presença estatal no setor produtivo.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Geografia', 'BRICS',
'Em 2009, países emergentes realizaram sua primeira reunião de cúpula com o objetivo de fortalecer a cooperação econômica e ampliar sua influência nas decisões do sistema financeiro internacional. Esse grupo de países corresponde',
to_jsonb(ARRAY['ao MERCOSUL, bloco regional voltado à integração comercial sul-americana.', 'ao G7, formado pelas principais economias industrializadas do mundo.', 'ao BRICS, articulação entre economias emergentes com atuação conjunta em temas estratégicos globais.', 'à União Europeia, organização supranacional de integração política e monetária.', 'ao NAFTA, acordo comercial estabelecido entre países da América do Norte.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q18 tem imagem (mapa) - incluir sem imagem
(gen_random_uuid(), 'Geografia', 'Questão Agrária no Brasil',
'O mapa que apresenta a distribuição de assassinatos no campo brasileiro entre 1986 e 2006 evidencia a concentração de conflitos em determinadas áreas do território nacional. Com base nessa informação e nos conhecimentos sobre a questão agrária no Brasil, é correto afirmar que',
to_jsonb(ARRAY['as áreas de maior incidência de violência coincidem com regiões de expansão da fronteira agrícola.', 'a violência rural está concentrada nas regiões de agricultura tradicional do Sudeste.', 'os conflitos no campo decorrem exclusivamente de disputas entre pequenos produtores familiares.', 'a distribuição dos assassinatos revela homogeneidade na ocupação agrária brasileira.', 'os índices de violência rural diminuíram nas áreas de recente ocupação territorial.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q19 tem imagem (rocha) - incluir sem imagem
(gen_random_uuid(), 'Geografia', 'Geologia - Rochas',
'A rocha analisada tem como característica a',
to_jsonb(ARRAY['intrusão ígnea', 'solidificação do magma', 'recristalização do magma', 'formação em alta pressão', 'presença de estratificação']),
4, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q20 tem imagem (gráfico) - incluir sem imagem
(gen_random_uuid(), 'Geografia', 'Transição Demográfica',
'O gráfico apresenta a evolução das taxas de natalidade e mortalidade entre os séculos XIX e XXI, evidenciando transformações no padrão demográfico ao longo do tempo. A análise do gráfico permite afirmar que',
to_jsonb(ARRAY['o crescimento vegetativo manteve-se elevado em todo o período analisado.', 'a redução da mortalidade precedeu a queda significativa da natalidade, característica da transição demográfica.', 'a natalidade aumentou progressivamente com a industrialização.', 'a mortalidade voltou a crescer no final do século XX.', 'o equilíbrio entre natalidade e mortalidade indica estagnação populacional desde o século XIX.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- PORTUGUÊS (21-38)
(gen_random_uuid(), 'Português', 'Morfologia',
'Texto I (Questões 21 a 25)\n"A linguagem não é apenas um código de transmissão; é um organismo vivo que respira as ambiguidades da alma humana. Frequentemente, nos perdemos em labirintos gramaticais, esquecendo que a norma culta existe para iluminar, e não para obscurecer o sentido. O escritor que domina a palavra sabe que um adjetivo mal colocado é como uma nota dissonante em uma sinfonia. É preciso analisar o silêncio, pois ele contém as sílabas que ainda não ousamos pronunciar."\n\nNo trecho "A linguagem não é apenas um código de transmissão; é um organismo vivo...", a palavra destacada funciona morfologicamente como:',
to_jsonb(ARRAY['Substantivo concreto, designando um ser biológico.', 'Adjetivo, qualificando o substantivo "organismo" e atribuindo-lhe uma característica dinâmica.', 'Advérbio de modo, indicando como a linguagem se comporta.', 'Particípio verbal com valor passivo.', 'Pronome indefinido, indicando uma generalização.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Fonologia',
'Sobre a palavra labirintos, assinale a alternativa correta quanto à sua fonologia:',
to_jsonb(ARRAY['É uma paroxítona que possui um dígrafo vocálico', 'Apresenta nove letras e nove fonemas, sem presença de dígrafos.', 'Contém um hiato e um dígrafo consonantal.', 'Possui dois dígrafos vocálicos ("in" e "on") e um encontro', 'É uma palavra proparoxítona com um ditongo decrescente.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Ortografia',
'A palavra analisar é grafada com "s" porque deriva do substantivo "análise". Assinale a alternativa em que a palavra apresenta erro de grafia pelo mesmo princípio:',
to_jsonb(ARRAY['Improvisar (de improviso).', 'Pesquisar (de pesquisa).', 'Civilizar (de civil).', 'Amenisar (de ameno).', 'Paralisar (de paralisia).']),
3, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Concordância',
'"O escritor que domina a palavra sabe que um adjetivo mal colocado é como uma nota dissonante...". Se o sujeito "O escritor" fosse passado para o plural, quantas outras palavras no trecho destacado deveriam obrigatoriamente sofrer flexão para manter a concordância?',
to_jsonb(ARRAY['Duas.', 'Três.', 'Quatro.', 'Cinco.', 'Seis.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Pronomes',
'De acordo com o texto na frase a seguir "...pois ele contém as sílabas que ainda não ousamos pronunciar", o pronome destacado retoma o termo:',
to_jsonb(ARRAY['Sentido.', 'Escritor.', 'Organismo.', 'Silêncio.', 'Adjetivo.']),
3, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Formação de Palavras',
'Texto II (Questões 26 a 30)\n"O tempo é um rio que me arrebata, mas eu sou o rio. Os homens de armas, em sua ascensão constante, acreditam que a força bruta resolve a incerteza do amanhã. Mal sabem que a vitória se constrói na paciência. Se eles mantivessem a calma, talvez enxergassem que o inimigo mais perigoso é o próprio orgulho. A honra, porém, não lhes permite o recuo."s palavras ascensão e incerteza apresentam, respectivamente, os seguintes processos de formação ou grafia:\n\nAnalise a estrutura da palavra "incerteza", sublinhada no trecho: "A incerteza quanto ao futuro assolava os candidatos." Assinale a alternativa que apresenta uma palavra formada pelo mesmo processo de derivação',
to_jsonb(ARRAY['Infelizmente', 'Anoitecer', 'Planalto', 'Passatempo', 'Ilegal']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Verbos',
'No trecho "Se eles mantivessem a calma, talvez enxergassem...", os verbos estão flexionados no:',
to_jsonb(ARRAY['Pretérito perfeito do indicativo, indicando ações concluídas.', 'Futuro do pretérito do indicativo, indicando possibilidade futura.', 'Pretérito imperfeito do subjuntivo, indicando uma condição hipotética no passado/presente.', 'Presente do subjuntivo, expressando um desejo atual.', 'Infinitivo pessoal, indicando a intenção dos sujeitos.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Pronomes',
'Sobre o uso do pronome em "...não lhes permite o recuo", assinale a alternativa que descreve corretamente sua função e referência:',
to_jsonb(ARRAY['Pronome pessoal do caso reto, funcionando como sujeito de "permite".', 'Pronome pessoal oblíquo átono, funcionando como objeto indireto e retomando "Os homens de armas".', 'Pronome possessivo, indicando posse em relação ao "recuo".', 'Pronome demonstrativo, apontando para a "incerteza".', 'Partícula de realce, sem valor sintático.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Acentuação',
'Assinale a alternativa que apresenta uma palavra do Texto II com acento tônico na mesma posição de vitória e que também seja acentuada pela mesma regra:',
to_jsonb(ARRAY['Rio.', 'Próprio.', 'Paciência.', 'Força.', 'Incerteza.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Partícula "se"',
'A frase "Mal sabem que a vitória se constrói na paciência" contém uma partícula "se". Ela é classificada como:',
to_jsonb(ARRAY['Pronome reflexivo.', 'Pronome apassivador (A vitória é construída).', 'Índice de indeterminação do sujeito.', 'Conjunção condicional.', 'Parte integrante do verbo "saber".']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Figuras de Linguagem',
'Texto III (Fragmento Literário)\n"E o caso se vai seguindo, estória sem história. Uma única, silenciosa, sombra se instalou: de noite, a mãe deixou de dormir. Horas a fio a sua cabeça anda em serviço de escutar, a ver se regressam as vozearias das aves." (Mia Couto)\n\nNo trecho "Uma única, silenciosa, sombra se instalou", o uso das vírgulas e a escolha dos adjetivos visam:',
to_jsonb(ARRAY['Enumerar ações rápidas da personagem.', 'Enfatizar a natureza opressiva e solitária do luto da mãe.', 'Corrigir um erro de concordância nominal.', 'Indicar que a sombra é um personagem físico que entrou no quarto.', 'Separar orações coordenadas sindéticas.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Fonologia',
'A palavra vozearias possui:',
to_jsonb(ARRAY['Um ditongo e um hiato.', 'Dois ditongos crescentes.', 'Apenas um encontro consonantal.', 'Três sílabas e dois dígrafos.', 'Um tritongo na última sílaba.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Verbos',
'Em "...a sua cabeça anda em serviço de escutar", o verbo andar está sendo usado com valor:',
to_jsonb(ARRAY['De movimento físico/locomoção.', 'Auxiliar, indicando uma ação que se prolonga no tempo (aspecto durativo).', 'De ligação, indicando um estado permanente.', 'Transitivo direto, exigindo complemento de lugar.', 'Impessoal, sem sujeito definido.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Substantivo',
'Assinale a alternativa em que a palavra retirada do texto é um substantivo abstrato:',
to_jsonb(ARRAY['Cabeça.', 'Aves.', 'Serviço.', 'Mãe.', 'Noite.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Acentuação',
'Quanto à acentuação, as palavras história e silenciosa diferenciam-se porque:',
to_jsonb(ARRAY['Ambas são paroxítonas, mas apenas a primeira termina em ditongo crescente.', 'A primeira é proparoxítona e a segunda é oxítona.', 'A primeira é paroxítona terminada em ditongo acentuada, a segunda é paroxítona terminada em "a" não acentuada.', 'Ambas possuem hiato tônico.', 'A regra de acentuação é a mesma para ambas.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Uso dos Porquês',
'Assinale a alternativa que preenche, correta e respectivamente, as lacunas do texto abaixo: "O oficial não explicou o ________ de tamanha urgência, ________ acreditava que todos já sabiam a razão. Perguntei lhe, então: ________ tanta pressa, se o prazo é longo? E ele não respondeu ________?',
to_jsonb(ARRAY['por que - porquê - Por quê - porque', 'porquê - porque - Por que - por quê', 'por quê - por que - Por que - porquê', 'porquê - por que - Por quê - porque', 'por que - porque - Por que - por quê']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Classes de Palavras',
'Assinale a alternativa em que o termo destacado é um advérbio:\n',
to_jsonb(ARRAY['"A menina tinha o rosto muito pálido."', '"A mãe sentiu o seu próprio cheiro."', '"Aquela era a única filha."', '"O médico era um homem sério."', '"As flores eram belas."']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Encontros Consonantais',
'Identifique a alternativa que apresenta uma palavra com encontro consonantal impróprio (na mesma sílaba) e uma com dígrafo consonantal, respectivamente:',
to_jsonb(ARRAY['Prata / Unha.', 'Sangue / Roxo.', 'Pássaro / Estrela.', 'Blusa / Campo.', 'Carro / Chave.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- INGLÊS (39-44)
(gen_random_uuid(), 'Inglês', 'Interpretação de Texto',
'Texto para as questões de 39 a 42\nThe Rise of Artificial Intelligence in Public Safety\nThe integration of Artificial Intelligence (AI) into law enforcement and public safety is no longer a futuristic concept but a present reality. Proponents argue that AI-driven tools, such as predictive policing algorithms and facial recognition, can enhance the efficiency of police forces by identifying crime hotspots and locating missing persons more quickly. Moreover, these technologies can process vast amounts of data far beyond human capability, potentially preventing incidents before they occur.\nDespite these advantages, the use of AI in policing is not without controversy. Civil liberties advocates express significant concerns regarding privacy, surveillance, and the potential for algorithmic bias. If the data used to train these systems contains historical prejudices, the AI may inadvertently perpetuate or even amplify discrimination against certain communities. Therefore, many jurisdictions are now calling for strict regulations to ensure that AI is used ethically and transparently accountably.\nThe challenge for the future lies in balancing the benefits of technological innovation with the protection of fundamental human rights. As AI continues to evolve, public safety agencies must remain vigilant to ensure that these tools serve the entire population fairly.\n\nCom base no primeiro parágrafo, uma das vantagens atribuídas ao uso da Inteligência Artificial na segurança pública é:',
to_jsonb(ARRAY['A substituição total de oficiais humanos por algoritmos autônomos.', 'A capacidade de processar grandes volumes de dados para prever incidentes.', 'A eliminação imediata de todos os crimes em áreas urbanas.', 'O fim da necessidade de patrulhamento em áreas consideradas de risco.', 'A redução dos custos de treinamento para novos recrutas da polícia.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Conectivos',
'No trecho do primeiro parágrafo — Moreover, these technologies can process vast amounts of data... — o termo sublinhado estabelece uma relação de:',
to_jsonb(ARRAY['Contradição.', 'Conclusão.', 'Alternativa.', 'Adição.', 'Causa.']),
3, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Vocabulário',
'No trecho do segundo parágrafo — Despite these advantages, the use of AI in policing is not without controversy. — o termo em destaque pode ser substituído, sem alteração de sentido, por:',
to_jsonb(ARRAY['Due to.', 'In spite of.', 'Because of.', 'Since.', 'Rather than.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Interpretação de Texto',
'Read the text below:\n"Cybersecurity is no longer just an IT issue; it is a strategic priority for modern governments. As digital threats become more sophisticated, protecting national infrastructure requires constant innovation and international cooperation." The main argument of the text is that:',
to_jsonb(ARRAY['IT departments should be the only ones responsible for digital security.', 'National infrastructure is currently safe from any kind of digital attack.', 'Modern governments must treat cybersecurity as a vital strategic matter.', 'International cooperation has failed to prevent sophisticated cyber threats.', 'Innovation in technology is unnecessary if governments work together.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Conectivos',
'Texto para as questões 43 e 44\nClimate Change and Coastal Defense\nRising sea levels pose a direct threat to coastal cities worldwide. To mitigate this, engineers are developing sophisticated sea walls and natural barriers. Unless governments invest heavily in these defense systems now, the economic and human cost of flooding will become unsustainable by 2050. These projects are expensive; nevertheless, they are essential for the survival of millions of people living in low-lying areas.\n\nNo trecho — Unless governments invest heavily in these defense systems now... — a palavra sublinhada introduz uma:',
to_jsonb(ARRAY['Concessão.', 'Condição negativa (A menos que).', 'Finalidade.', 'Proporção.', 'Certeza absoluta.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Conectivos',
'No trecho — These projects are expensive; nevertheless, they are essential... — o termo em destaque expressa ideia de:',
to_jsonb(ARRAY['Explicação.', 'Soma de ideias.', 'Contraste ou oposição.', 'Tempo decorrido.', 'Comparação de igualdade.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- MATEMÁTICA (45-56)
(gen_random_uuid(), 'Matemática', 'Porcentagem',
'Em dezembro de 2025, um equipamento de segurança custava um determinado valor V. Em janeiro de 2026, esse valor sofreu um reajuste de 15%. Em fevereiro, devido a uma promoção, foi aplicado um desconto de 20% sobre o valor de janeiro. Sabendo que o preço final após o desconto foi de R$ 1.104,00, o valor do desconto de 20% foi de:',
to_jsonb(ARRAY['R$ 260,00.', 'R$ 264,00.', 'R$ 272,00.', 'R$ 276,00.', 'R$ 280,00.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Progressão Aritmética',
'Os números k, k + 2, 3k, nessa ordem, formam os três primeiros termos de uma progressão aritmética crescente. O valor do sétimo elemento dessa sequência é:',
to_jsonb(ARRAY['14.', '28.', '32.', '36.', '40.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Probabilidade',
'Em um batalhão com 600 soldados, foi feito um levantamento sobre aptidões técnicas: 350 são aptos em Informática, 210 são aptos em Idiomas e 90 não possuem aptidão em nenhuma dessas duas áreas. Escolhendo-se um soldado ao acaso, a probabilidade de ele ser apto em Idiomas, mas não ser apto em Informática é de:',
to_jsonb(ARRAY['1/12.', '2/15.', '4/15.', '1/6.', '8/25.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q48 tem imagem (triângulos)
(gen_random_uuid(), 'Matemática', 'Geometria - Triângulos',
'A figura abaixo (fora de escala) representa o trajeto de uma viatura. Os triângulos ABC e CDE são retângulos em B e D, respectivamente. Sabe-se que AB = 6 km, BC = 8 km, CD = 12 km e DE = 5 km.\n\nA distância total percorrida de A até E, passando por C, é de:',
to_jsonb(ARRAY['21 km.', '23 km.', '25 km.', '31 km.', '33 km.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Função do 1º Grau',
'Uma unidade da Polícia Militar observou que o custo total mensal (C) para a manutenção de um sistema de rádio é composto por uma taxa fixa de manutenção, somada a um valor variável que depende do número de horas (h) de uso técnico especializado. Sabe-se que, em um mês em que foram utilizadas 40 horas técnicas, o custo total foi de R$ 2.600,00. Em outro mês, com a utilização de 60 horas técnicas, o custo total subiu para R$ 3.400,00. Considerando que a relação entre o custo total e o número de horas técnicas é uma função do 1º grau, o valor da taxa fixa de manutenção desse sistema é de:',
to_jsonb(ARRAY['R$ 800,00', 'R$ 1.000,00', 'R$ 1.200,00', 'R$ 1.400,00', 'R$ 1.600,00']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Logaritmos',
'Determine o valor de x na equação logarítmica log₂(x + 3) = 5',
to_jsonb(ARRAY['x = 13', 'x = 22', 'x = 27', 'x = 29', 'x = 32']),
3, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Equações',
'Um oficial comprou uma quantidade x de medalhas para uma cerimônia por R$ 2.400,00. Após uma semana, ele precisou comprar mais 10 medalhas. Como o fornecedor deu um desconto de R$ 20,00 em cada unidade (tanto nas novas quanto nas antigas), o custo total subiu para R$ 3.000,00. O valor original de cada medalha era:',
to_jsonb(ARRAY['R$ 80,00.', 'R$ 100,00.', 'R$ 120,00.', 'R$ 140,00.', 'R$ 160,00.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Função Quadrática',
'Um radar monitora a trajetória de um drone que segue uma curva parabólica. O drone decola da origem (0,0), atinge uma altura máxima de 40 metros quando percorre uma distância horizontal de 100 metros e volta ao solo. A equação que descreve essa trajetória é:',
to_jsonb(ARRAY['y = -0,004x² + 0,8x', 'y = -0,01x² + x', 'y = -0,002x² + 0,4x', '250y = 100x - x²', '100 = 40x - x²']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q53 tem imagem (matrizes)
(gen_random_uuid(), 'Matemática', 'Matrizes',
'Na criptografia de mensagens militares, utilizou-se a matriz de codificação M = [3 1; 4 2]. Para decifrar a mensagem, o receptor deve utilizar a matriz inversa M⁻¹. A matriz de decodificação é:',
to_jsonb(ARRAY['[1 -0,5; -2 1,5]', '[2 -1; -4 3]', '[1,5 -0,5; -2 1]', '[-3 -1; -4 -2]', '[1 1; 1 1]']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Polinômios',
'Determine o valor de M para que o resto da divisão do polinômio P(x) = x³ - 2x² + mx - 4 por (x - 2) seja igual a 6.',
to_jsonb(ARRAY['1.', '3.', '5.', '7.', '9.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Logaritmos',
'Considere as aproximações log 2 = 0,30 e log 3 = 0,48. Um perito calculou o valor da expressão L = (1,5) + (12). O resultado encontrado foi:',
to_jsonb(ARRAY['1,08.', '1,26.', '1,32.', '1,54.', '1,60.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Função por Partes',
'A tarifa de transporte de carga em uma transportadora é composta por um valor fixo de R$ 15,00 e um valor variável por km rodado. Até 50 km, cobra-se R$ 2,00 por km. Para a distância que exceder os 50 km, o valor por km passa a ser R$ 1,50. Se uma carga foi transportada por 80 km, o valor total da conta foi:',
to_jsonb(ARRAY['R$ 145,00.', 'R$ 160,00.', 'R$ 175,00.', 'R$ 180,00.', 'R$ 215,00.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- FÍSICA (57-62)
(gen_random_uuid(), 'Física', 'Cinemática - MUV',
'Uma viatura da Polícia Militar, partindo do repouso, inicia a perseguição a um veículo suspeito em uma avenida retilínea. A viatura desenvolve uma aceleração constante de 2,0 m/s². No mesmo instante em que a viatura inicia o movimento, o veículo suspeito passa por ela com uma velocidade constante de 20 m/s.\n\nConsiderando que ambos mantêm essas condições de movimento, a distância percorrida pela viatura até alcançar o veículo suspeito será de:',
to_jsonb(ARRAY['200 metros', '400 metros', '600 metros', '800 metros', '900 metros']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Lançamento Horizontal',
'Um drone de patrulhamento da Polícia Militar voa horizontalmente com velocidade constante de 20 m/s a uma altura de 80 m do solo. Em determinado instante, ele libera um kit de primeiros socorros. Desprezando a resistência do ar e adotando g = 10 m/s², a distância horizontal percorrida pelo kit desde o instante em que é solto até atingir o solo e a trajetória vista por um observador fixo no solo são, respectivamente:',
to_jsonb(ARRAY['40 m e reta vertical.', '80 m e arco de parábola.', '40 m e arco de parábola.', '80 m e reta vertical.', '100 m e arco de parábola.']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Movimento Circular',
'Um motor de uma viatura possui uma polia que gira com uma frequência constante de 10 Hz. Sabendo que o raio dessa polia é de 0,2 m e adotando π=3, a velocidade linear de um ponto na extremidade dessa polia é de: desconsidere a massa',
to_jsonb(ARRAY['15 m/s.', '20 m/s.', '12 m/s.', '10 m/s.', '22 m/s']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Calorimetria',
'Um componente metálico de uma viatura, com massa de 500g, sofre uma variação de temperatura de 20°C para 60°C ao absorver uma certa quantidade de calor. Sabendo que o calor específico do metal é 0,11 cal/g.°C, a quantidade de calor absorvida, em calorias, é:',
to_jsonb(ARRAY['220.', '1.100', '2.200', '3.300', '4.400']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Elevador - Força Normal',
'Um cadete de 80 kg está sobre uma balança (graduada em Newtons) dentro de um elevador na Academia do Barro Branco. O elevador começa a subir com uma aceleração constante de 2 m/s². Considerando g = 10 m/s², a leitura da balança durante essa aceleração e a comparação entre a força normal (N) e o peso (P) do cadete são:',
to_jsonb(ARRAY['640 N e N < P.', '800 N e N = P.', '960 N e N > P.', '960 N e N < P.', '160 N e N = P.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Equilíbrio - Prancha',
'Uma equipe de resgate da Polícia Militar utiliza uma prancha rígida e homogênea de 3,0 m de comprimento e massa de 20 kg para atravessar um vão entre dois escombros. A prancha está apoiada em suas extremidades A e B. Um oficial de 80 kg caminha sobre a prancha partindo do ponto A em direção ao ponto B. No instante em que o oficial está a exatamente 1,0 m de distância do ponto A, a intensidade da força de reação normal no apoio B é:\n\n(Considere g = 10 m/s²)',
to_jsonb(ARRAY['333,3 N', '366,7 N', '433,3 N', '500,0 N', '600,0 N']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- QUÍMICA (63-68)
(gen_random_uuid(), 'Química', 'Modelos Atômicos',
'O modelo atômico que descreve o átomo como uma esfera de carga positiva com elétrons incrustados é atribuído a:',
to_jsonb(ARRAY['Rutherford, teoria da lâmina de ouro', 'Thomson, teoria pudim de passas', 'Dalton, maciço, indivisível e indestrutível', 'Bohr, teoria do subnível', 'Chadwick, teoria newtoniana']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q64 tem imagem (filtração/funil)
(gen_random_uuid(), 'Química', 'Separação de Misturas',
'Para separar uma mistura heterogênea composta de água e areia, o método físico laboratorial mais adequado e rápido é a:',
to_jsonb(ARRAY['Cristalização fracionada.', 'Sublimação direta.', 'Decantação estática.', 'Destilação simples.', 'Filtração comum.']),
4, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q65 tem imagem (funil de decantação)
(gen_random_uuid(), 'Química', 'Separação de Misturas',
'Considere que em um processo físico de separação de misturas foi empregado um funil em que foram adicionadas as substâncias álcool etílico (d = 0,789 g/cm³) e óleo (d = 0,91 g/cm³). Após a agitação e o repouso do funil, observou-se a formação de duas fases líquidas diferentes, A e B, que podiam ser separadas após a abertura da torneira desse funil.\n\nO processo de separação descrito foi empregado para separar uma mistura ________ de líquidos ________. No béquer, foi recolhida a substância ________ densa.\n\nAs lacunas do texto são preenchidas, respectivamente, por:',
to_jsonb(ARRAY['heterogênea, imiscíveis e mais.', 'heterogênea, imiscíveis e menos.', 'heterogênea, miscíveis e mais.', 'homogênea, imiscíveis e mais.', 'homogênea, miscíveis e menos.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- Q66 tem imagem (tabela periódica)
(gen_random_uuid(), 'Química', 'Tabela Periódica',
'Durante uma instrução sobre materiais perigosos, um cadete analisa quatro elementos químicos genéricos (X, Y, Z e W) localizados na Tabela Periódica. Sabe-se que:\nX pertence ao Grupo 1 (Metais Alcalinos) e ao 3º período.\nY é um halogênio localizado no mesmo período de X.\nZ possui maior raio atômico que X.\nW possui maior eletronegatividade que Y.\n\nCom base nas tendências das propriedades periódicas, é correto afirmar que:',
to_jsonb(ARRAY['O elemento X possui maior energia de ionização que o elemento Y.', 'O elemento Y é um excelente condutor de eletricidade e calor em condições ambientes.', 'O elemento Z está localizado em um período acima do elemento X.', 'O elemento W possui um número atômico menor que o elemento Y.', 'A ligação química formada entre X e Y terá caráter predominantemente covalente.']),
3, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Mudanças de Estado',
'O aquecimento de uma substância pura em um sistema aberto permite observar diferentes fenômenos físicos. Sobre essas transformações, assinale a alternativa correta.',
to_jsonb(ARRAY['A sublimação consiste na passagem direta do estado sólido para o gasoso sem passar pelo líquido.', 'A fusão de uma substância pura ocorre com aumento progressivo da temperatura durante a mudança.', 'A calefação é o nome dado à passagem do estado líquido para o sólido com a perda de energia.', 'A ebulição é um processo de vaporização muito lento que ocorre apenas na superfície do líquido.', 'A condensação é um processo endotérmico que exige a absorção de calor do ambiente externo.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Ligações Químicas',
'As propriedades físicas das substâncias estão diretamente ligadas ao tipo de interação entre seus átomos. Sobre as ligações químicas, assinale a alternativa correta.',
to_jsonb(ARRAY['Compostos iônicos são conhecidos por conduzir corrente elétrica de forma eficiente no estado sólido.', 'Compostos moleculares apresentam pontos de fusão e ebulição muito superiores aos dos compostos iônicos.', 'A ligação iônica é caracterizada pelo compartilhamento de pares eletrônicos entre os núcleos dos átomos.', 'Substâncias metálicas apresentam alta condutibilidade térmica e elétrica devido aos seus elétrons livres.', 'Ligações covalentes ocorrem tipicamente entre um elemento metálico e um elemento de alta eletronegatividade']),
3, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- BIOLOGIA (69-74)
(gen_random_uuid(), 'Biologia', 'Artrópodes',
'Os artrópodes representam o maior filo em número de espécies, apresentando grande diversidade morfológica e relevância médica. Entre eles, os carrapatos são aracnídeos ectoparasitas que desempenham papel fundamental como vetores de patógenos, como a bactéria causadora da Febre Maculosa. Sobre as características morfológicas e biológicas desses animais, é correto afirmar que:',
to_jsonb(ARRAY['Apresentam o corpo dividido em cabeça, tórax e abdome, possuindo três pares de patas articuladas na fase adulta.', 'Possuem um par de antenas sensitivas e realizam a respiração por meio de estruturas branquiais ou pulmões foliáceos.', 'São caracterizados por possuírem quatro pares de patas, ausência de antenas e o corpo fundido em cefalotórax e abdome.', 'Desenvolvem metamorfose completa durante o ciclo de vida, passando pelas fases distintas de ovo, lagarta, crisálida e adulto.', 'Excretam seus resíduos metabólicos exclusivamente através de glândulas verdes localizadas na região anterior da cabeça.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Organelas Celulares',
'No contexto da perícia criminal e identificação por DNA, é fundamental compreender a estrutura das células. Qual das organelas citoplasmáticas abaixo possui seu próprio material genético (DNA), permitindo a análise de linhagens maternas, mesmo em amostras onde o DNA nuclear está degradado?',
to_jsonb(ARRAY['Complexo de Golgi', 'Lisossomos', 'Mitocôndrias', 'Retículo Endoplasmático Rugoso', 'Ribossomos']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Genética Molecular',
'Sobre o processo de transmissão e tradução da informação genética, assinale a alternativa que descreve corretamente o processo de Transcrição:',
to_jsonb(ARRAY['É a produção de uma molécula de RNA a partir de um molde de DNA, ocorrendo no núcleo das células eucarióticas.', 'É a leitura do RNA mensageiro pelos ribossomos para a formação de uma sequência de aminoácidos.', 'É a duplicação exata da molécula de DNA que ocorre durante a fase S da intérfase.', 'É a remoção de íntrons do pré-RNA para a formação do RNA maduro, processo exclusivo de procariontes.', 'É a passagem direta da informação do DNA para as proteínas sem intermediários.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Genética - Tipagem Sanguínea',
'Um casal, ambos com tipo sanguíneo A, possui um filho com tipo sanguíneo O. Caso este casal decida ter um segundo filho, qual a probabilidade de ser um menino com o tipo sanguíneo A?',
to_jsonb(ARRAY['12,5%', '25%', '37,5%', '50%', '75%']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Divisão Celular',
'Em relação à divisão celular, um evento fundamental para a variabilidade genética ocorre exclusivamente na Meiose I. Esse evento é conhecido como:',
to_jsonb(ARRAY['Citocinese', 'Crossing-over (Permuta)', 'Separação das cromátides irmãs', 'Condensação da cromatina', 'Formação do fuso mitótico']),
1, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Imunologia',
'Em missões de policiamento em áreas rurais ou de mata, os oficiais da PM estão expostos a acidentes com animais peçonhentos, como serpentes. Caso um oficial seja picado por uma jararaca, o protocolo médico exige a administração imediata de soro antiofídico. Sobre esse método de imunização e o funcionamento do sistema imune, é correto afirmar:',
to_jsonb(ARRAY['O soro é um tipo de imunização ativa, pois estimula o organismo do oficial a produzir seus próprios anticorpos e células de memória.', 'A vacina difere do soro por ser uma imunização passiva, contendo anticorpos prontos para combater o antígeno imediatamente.', 'O soro antiofídico é uma imunização passiva artificial, que fornece anticorpos prontos para neutralizar o veneno, mas não gera memória legitimamente duradoura.', 'Os linfócitos T são as células responsáveis pela produção direta dos anticorpos que compõem o soro antiofídico.', 'A imunidade humoral, mediada por anticorpos, não atua em casos de toxinas animais, sendo necessária apenas a imunidade celular.']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- ADMINISTRAÇÃO PÚBLICA (75-76)
(gen_random_uuid(), 'Administração Pública', 'Segurança Pública',
'De acordo com a Constituição Federal de 1988, a segurança pública, dever do Estado, direito e responsabilidade de todos, é exercida para a preservação da ordem pública e da incolumidade das pessoas e do patrimônio. Sobre os órgãos que compõem a segurança pública, assinale a alternativa correta:',
to_jsonb(ARRAY['As polícias militares e os corpos de bombeiros militares são forças reservas e auxiliares do Exército.', 'A polícia ferroviária federal é subordinada diretamente aos governadores dos Estados e do Distrito Federal.', 'Às polícias civis, dirigidas por delegados de polícia de carreira, incumbem as funções de polícia ostensiva e a preservação da ordem pública.', 'As polícias militares subordinam-se aos prefeitos dos municípios onde estão sediados seus batalhões.', 'A guarda municipal possui as mesmas competências investigativas das polícias civis no âmbito dos crimes municipais.']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Administração Pública', 'Princípios Administrativos',
'O Artigo 37 da Constituição Federal estabelece que a administração pública direta e indireta de qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios obedecerá a determinados princípios. O princípio que impõe ao administrador público o dever de buscar o melhor resultado com o menor custo possível, otimizando o uso dos recursos públicos, é o princípio da:',
to_jsonb(ARRAY['Legalidade.', 'Impessoalidade.', 'Moralidade.', 'Publicidade.', 'Eficiência.']),
4, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

-- INFORMÁTICA (77-80)
(gen_random_uuid(), 'Informática', 'Windows',
'No sistema operacional Windows 10, um cadete deseja alternar rapidamente entre as janelas dos aplicativos que estão abertos no momento, visualizando todas as miniaturas de uma vez em uma "Visão de Tarefas". O atalho de teclado que permite essa ação é:',
to_jsonb(ARRAY['Windows + L', 'Alt + F4', 'Windows + Tab', 'Ctrl + Shift + Esc', 'Windows + D']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Informática', 'E-mail',
'Ao enviar um e-mail com diretrizes estratégicas para diferentes setores, um Oficial deseja que os destinatários recebam a mensagem, mas que um dos setores receba uma "cópia oculta", de modo que os outros destinatários não saibam que esse setor específico também recebeu o e-mail. Para isso, ele deve inserir o endereço desse setor no campo:',
to_jsonb(ARRAY['Para (To)', 'Cc (Com Cópia)', 'Assunto (Subject)', 'Cco (Bcc)', 'Anexo (Attachment)']),
3, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Informática', 'Excel',
'Um Oficial da PM utiliza uma planilha de Excel para controlar a pontuação de tiro dos cadetes. Na célula A1 consta a nota do aluno. Ele deseja que na célula B1 apareça a palavra "APROVADO" caso a nota seja maior ou igual a 7, e "REPROVADO" caso seja menor. A fórmula correta para realizar essa operação é:',
to_jsonb(ARRAY['=SE(A1>=7;"APROVADO";"REPROVADO")', '=SE(A1<7;"APROVADO";"REPROVADO")', '=SOMA(A1>=7;"APROVADO")', '=PROCV(A1;7;"APROVADO")', '=CONDICIONAL(A1>=7;"APROVADO")']),
0, 'Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Informática', 'Segurança da Informação',
'No contexto da segurança da informação, um tipo de software malicioso (malware) que infecta o computador, criptografa os arquivos do usuário e exige o pagamento de um "resgate" (geralmente em criptomoedas) para que os arquivos sejam liberados é conhecido como:',
to_jsonb(ARRAY['Spyware.', 'Phishing.', 'Ransomware.', 'Adware.', 'Trojan (Cavalo de Troia).']),
2, 'Legado Militar', '2026', 'Médio', 'VUNESP');


-- Agora criar o simulado referenciando as questões inseridas
-- Primeiro, pegar os IDs das questões recém-inseridas (pela org e institution)
DO $$
DECLARE
  v_simulado_id UUID;
  v_question_ids UUID[];
  v_q UUID;
  v_idx INTEGER := 0;
BEGIN
  -- Buscar as 80 questões recém-inseridas
  SELECT array_agg(id ORDER BY created_at)
  INTO v_question_ids
  FROM questions
  WHERE org = 'Legado Militar'
    AND year = '2026'
  ORDER BY created_at;

  -- Limitar às últimas 80
  v_question_ids := v_question_ids[array_length(v_question_ids, 1) - 79 : array_length(v_question_ids, 1)];

  -- Criar o simulado
  INSERT INTO simulados (id, title, description, concurso, total_time_minutes, is_published, questions)
  VALUES (
    gen_random_uuid(),
    '2° Simulado Legado - PM SP Oficial',
    'Simulado direcionado ao concurso de Oficial da PM-SP. 80 questões inéditas elaboradas com base no perfil da VUNESP.',
    'PM-SP Oficial',
    360,
    true,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'question_id', q.id::text,
          'order_index', row_number() OVER (ORDER BY q.created_at) - 1,
          'subject_group', q.subject
        )
      )
      FROM (
        SELECT id, subject, created_at
        FROM questions
        WHERE org = 'Legado Militar' AND year = '2026'
        ORDER BY created_at DESC
        LIMIT 80
      ) q
    )
  );
END $$;
