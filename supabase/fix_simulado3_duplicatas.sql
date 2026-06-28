-- ============================================================
-- FIX: Remover duplicatas do Simulado 3 e restaurar Simulado 2
--
-- O que aconteceu: O UPDATE mudou questões do Simulado 2 para
-- org='Simulado 3 Legado Militar', criando 128 questões ao invés de 80.
--
-- RODE ESTE SQL COMPLETO NO SQL EDITOR DO SUPABASE
-- ============================================================

-- PASSO 1: Deletar TODAS as questões com org='Simulado 3 Legado Militar'
-- (inclui tanto as do Simulado 3 quanto as do Simulado 2 que foram renomeadas por engano)
DELETE FROM questions WHERE org = 'Simulado 3 Legado Militar';

-- PASSO 2: Deletar o simulado entry se já foi criado
DELETE FROM simulados WHERE title = '3° Simulado Legado - PM SP Oficial';

-- PASSO 3: Verificar se o Simulado 2 perdeu questões e restaurá-las
-- Se o Simulado 2 ficou com menos de 80 questões, é porque foram renomeadas.
-- Nesse caso, você precisará rodar novamente o simulado2_apmbb.sql.
-- Verifique com: SELECT COUNT(*) FROM questions WHERE org = 'Legado Militar';

-- PASSO 4: Inserir TODAS as 80 questões do Simulado 3 de uma vez
-- (org = 'Simulado 3 Legado Militar' para não conflitar com Simulado 2)

INSERT INTO questions (id, subject, topic, text, options, correct_option_index, org, year, difficulty, institution) VALUES

-- ========== HISTÓRIA (Q1-6) ==========
(gen_random_uuid(), 'História', 'História Universal e do Brasil',
'Em 1823, o presidente James Monroe declarou ao Congresso: "Os continentes americanos, pela condição livre e independente que assumiram e mantêm, não devem mais ser considerados, daqui em diante, como objetos de futura colonização por parte de quaisquer potências europeias". Quase dois séculos depois, em 2013, o então Secretário de Estado, John Kerry, afirmou perante a OEA que "a era da Doutrina Monroe acabou", defendendo uma relação baseada em interesses comuns e responsabilidades partilhadas.

A análise dos dois momentos da política externa estadunidense e o contexto em que a Doutrina Monroe foi formulada permitem afirmar que ela:',
to_jsonb(ARRAY['consolidou uma aliança militar imediata entre os EUA e as recém-formadas nações latino-americanas para impedir o avanço do imperialismo britânico no Atlântico Sul.', 'visava resguardar a soberania dos países americanos frente às ameaças de restauração monárquica da Santa Aliança, ao mesmo tempo que pavimentava a futura influência dos EUA na região.', 'foi recebida com entusiasmo unânime pelas lideranças sul-americanas, como Simón Bolívar, que viram nela a garantia definitiva contra qualquer forma de intervenção estrangeira.', 'estabeleceu o "Destino Manifesto", princípio que justificava a expansão territorial dos Estados Unidos em direção ao Sul, visando a anexação direta de antigas colônias espanholas.', 'perdeu sua validade prática ainda no século XIX, visto que os Estados Unidos optaram pelo isolacionismo absoluto, abstendo-se de intervir em conflitos regionais no continente.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'História', 'História Universal e do Brasil',
'"Para o povo americano, a guerra não era mais uma questão de ideologia ou de contenção do comunismo em terras distantes; era uma questão de imagens que jantavam com eles todas as noites. Pela primeira vez, o horror das frentes de batalha entrou nas salas de estar sem censura prévia, corroendo o apoio doméstico que qualquer governo necessita para sustentar um esforço militar prolongado." (Adaptado de: KARNAL, L. História dos Estados Unidos: das origens ao século XXI)

O fragmento faz referência ao envolvimento dos Estados Unidos no conflito do Vietnã (1959-1975). Sobre o desenrolar dessa guerra e o contexto de sua conclusão, é correto afirmar que:',
to_jsonb(ARRAY['a intervenção militar estadunidense fundamentou-se na "Teoria do Dominó", que previa a queda em cascata de regimes capitalistas no sudeste asiático caso o Vietnã do Sul fosse derrotado.', 'o governo de Richard Nixon intensificou a presença terrestre de tropas em 1973, visando forçar uma rendição incondicional das forças de Ho Chi Minh antes da assinatura dos Acordos de Paris.', 'o conflito encerrou-se imediatamente após a retirada oficial das tropas norte-americanas, resultando na manutenção da divisão do país entre o Norte socialista e o Sul capitalista.', 'a superioridade bélica dos EUA, marcada pelo uso de armas químicas como o agente laranja, foi suficiente para neutralizar as táticas de guerrilha utilizadas pelos vietcongues em ambiente de selva.', 'a opinião pública americana manteve-se favorável ao conflito até o fim, mobilizada pelo sentimento patriótico e pela censura rigorosa que o governo impunha aos principais canais de televisão.']),
0, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'História', 'História do Brasil',
'"O Manifesto Republicano de 1870 e a fundação do Partido Republicano Paulista (PRP), em 1873, evidenciaram que o arranjo político do Segundo Reinado não mais comportava as ambições das novas elites econômicas. Enquanto o Vale do Paraíba permanecia vinculado às estruturas tradicionais e ao apoio direto à Monarquia, o Oeste Paulista clamava por uma descentralização que permitisse maior autonomia administrativa e aplicação dos lucros do café em infraestrutura regional." (Adaptado de: FAUSTO, Boris. História do Brasil. Ed. USP)

Considerando o contexto de crise da Monarquia brasileira na segunda metade do século XIX, é correto afirmar que a elite cafeicultora do Oeste Paulista:',
to_jsonb(ARRAY['manteve-se fiel ao gabinete ministerial do Império até a Proclamação da República, temendo que o federalismo prejudicasse a política de valorização do café.', 'liderou o movimento abolicionista desde o início, visando desestabilizar a base de apoio da Monarquia, que dependia exclusivamente do trabalho escravo no Vale do Paraíba.', 'defendeu o modelo federativo de Estado para garantir que a arrecadação de impostos sobre a exportação permanecesse nas províncias, fortalecendo o poder político local.', 'opôs-se à aliança com os setores jovens do Exército (positivistas), por considerar que o autoritarismo militar era incompatível com o liberalismo econômico do café.', 'promoveu o isolamento dos setores médios urbanos, por entender que a República deveria ser um projeto exclusivamente agrário e aristocrático, sem participação popular.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'História', 'História Antiga',
'A democracia ateniense, consolidada no século V a.C. (o "Século de Péricles"), é frequentemente citada como um dos maiores legados da Antiguidade Clássica para o mundo ocidental. No entanto, sua aplicação prática na pólis grega possuía características muito específicas que a diferenciavam das democracias representativas contemporâneas.

Sobre o funcionamento e a estrutura da democracia em Atenas, assinale a alternativa correta:',
to_jsonb(ARRAY['Baseava-se em um sistema representativo, no qual os cidadãos de todas as classes sociais elegiam deputados para compor o Conselho dos Quinhentos.', 'Caracterizava-se por ser direta e participativa, permitindo que todos os cidadãos tivessem direito ao uso da palavra e ao voto nas assembleias (Eclésia).', 'Promovia a igualdade jurídica plena entre todos os habitantes da pólis, incluindo mulheres, estrangeiros (metecos) e escravos.', 'Instituiu o Ostracismo como uma honraria concedida aos generais que se destacavam nas Guerras Médicas contra os persas.', 'Teve como principal legislador Clístenes, que aboliu a escravidão por dívidas e restringiu o poder de decisão apenas aos proprietários de terras (eupátridas).']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'História', 'História do Brasil Colonial',
'"O Diretório dos Índios (1757-1798) partia do pressuposto de que a ''selvageria'' era um estado transitório. Ao proibir o uso de línguas nativas, incentivar o casamento entre colonos e indígenas e transformar as antigas missões em vilas com nomes portugueses, o Estado pombalino buscava converter o ''gentio'' em súdito útil e consumidor da metrópole." (Adaptado de: ALMEIDA, M. R. C. Os índios na história do Brasil)

Com base no texto e no contexto das Reformas Pombalinas na América Portuguesa, é correto afirmar que o Diretório dos Índios:',
to_jsonb(ARRAY['reafirmou o poder temporal das ordens religiosas, especialmente a Companhia de Jesus, delegando aos missionários a gestão exclusiva da mão de obra indígena na Amazônia.', 'visava a integração cultural e biológica dos indígenas à sociedade colonial, buscando apagar identidades étnicas específicas em favor de uma identidade súdita e lusitana.', 'estabeleceu a imediata e plena autonomia política das comunidades nativas, garantindo-lhes a posse definitiva das terras sem a interferência de administradores civis.', 'proibiu definitivamente o uso do trabalho compulsório indígena em todo o território nacional, substituindo-o integralmente pelo tráfico transatlântico de escravizados africanos.', 'resultou na preservação das línguas gerais e dos costumes ancestrais, visto que a Coroa Portuguesa compreendia a diversidade cultural como um ativo econômico para o Império.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'História', 'História do Brasil República',
'"Aquela face da revolta que os jornais da capital descreviam como um plano monarquista restaurador era, no fundo, a resistência desesperada de uma coletividade que a República recém-nascida não soube incluir. Canudos não era um exército organizado; era um ajuntamento de desvalidos sob uma mística messiânica, transformado em ameaça pela incapacidade do Estado de compreender o próprio sertão." (Adaptado de: SEVCENKO, Nicolau. Literatura como Missão)

Sobre a Guerra de Canudos (1896-1897) e a obra Os Sertões, de Euclides da Cunha, é correto afirmar que:',
to_jsonb(ARRAY['O movimento de Canudos tinha como principal objetivo restaurar a monarquia no Brasil, organizando um exército regular para enfrentar o governo republicano.', 'A comunidade de Canudos era formada majoritariamente por grandes proprietários de terra do sertão, que resistiam à cobrança de impostos pela República.', 'O arraial de Canudos, liderado por Antônio Conselheiro, reunia sertanejos pobres e marginalizados, sendo interpretado pelas autoridades republicanas como uma ameaça à ordem estabelecida.', 'A guerra terminou após um acordo pacífico entre o governo federal e os líderes de Canudos, garantindo autonomia política ao arraial.', 'A obra Os Sertões apresenta Canudos como um movimento urbano liderado por intelectuais que defendiam reformas sociais no Brasil.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

-- ========== FILOSOFIA (Q7-10) ==========
(gen_random_uuid(), 'Filosofia', 'Filosofia Política',
'"Aquele que se alimenta das bolotas que colheu sob um carvalho, ou das maçãs que colheu nas árvores da floresta, certamente as apropriou para si. Ninguém pode negar que a alimentação é sua. Pergunto, então: quando começaram a ser dele? [...] É o trabalho que estabelece a distinção de valor entre as coisas; e se considerarmos o que nos é útil, veremos que a maior parte do que desfrutamos nesta vida provém do esforço humano, e não apenas da natureza." (Adaptado de: LOCKE, John. Segundo Tratado sobre o Governo Civil)

O pensamento de John Locke, um dos principais expoentes do liberalismo clássico, fundamenta a legitimidade da propriedade privada em um estágio anterior à formação do Estado civil. De acordo com a teoria contratualista deste autor, é correto afirmar que:',
to_jsonb(ARRAY['a propriedade privada é um direito natural inerente ao indivíduo, fundamentado no trabalho, sendo a preservação desse direito um dos fins principais da união dos homens em sociedade.', 'o surgimento da propriedade privada foi o marco inicial da degeneração moral da humanidade, transformando o "bom selvagem" em um ser corrompido pela ganância e pela desigualdade.', 'a desigualdade de posses é uma criação exclusiva das leis positivas do Estado, visto que, no estado de natureza, a escassez de recursos impedia qualquer forma de acumulação de bens.', 'o direito de posse deve ser submetido à vontade absoluta do soberano, pois apenas um poder centralizado e inquestionável pode garantir a paz e evitar a "guerra de todos contra todos".', 'a propriedade privada constitui a estrutura básica de opressão da classe trabalhadora, devendo ser abolida para que a verdadeira liberdade e igualdade jurídica sejam estabelecidas.']),
0, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Filosofia', 'Ética e Filosofia Política',
'"A corrupção administrativa não é apenas um desvio de conduta individual ou um crime tipificado no Código Penal; ela representa, sobretudo, a erosão do princípio republicano, que exige a primazia do interesse público sobre os apetites particulares. Combater tal patologia social requer mais do que a aplicação de penas: exige o fortalecimento de uma ética que fundamente a transparência e a responsabilidade nas relações de poder." (Adaptado de: BOBBIO, N. O Futuro da Democracia)

Com base na reflexão sobre a Ética Republicana e sua importância para as instituições democráticas, é correto afirmar que a Ética, nesse contexto, deve ser compreendida como:',
to_jsonb(ARRAY['um conjunto de normas dogmáticas e imutáveis, herdadas da tradição religiosa, que determinam o comportamento ideal dos magistrados e servidores.', 'a análise crítica e racional sobre os fundamentos da ação humana, visando orientar a conduta de modo a preservar e promover o bem-estar da coletividade.', 'a submissão cega do indivíduo às leis vigentes, independentemente de sua justiça ou eficácia, visando manter a ordem social a qualquer custo.', 'uma técnica de persuasão utilizada por governantes para alinhar a opinião pública aos interesses estratégicos do Estado em momentos de crise.', 'a aplicação subjetiva de valores morais privados na esfera pública, permitindo que o administrador decida com base em suas convicções pessoais.']),
0, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Filosofia', 'Teoria do Conhecimento',
'"Até agora se supunha que todo o nosso conhecimento tinha que se regular pelos objetos; porém, todas as tentativas de estabelecer sobre eles algo a priori por meio de conceitos, através do que o nosso conhecimento seria ampliado, fracassaram sob esta pressuposição. Por isso, tente-se uma vez ver se não progrediremos melhor nas tarefas da metafísica admitindo que os objetos têm que se regular pelo nosso conhecimento." (KANT, Immanuel. Crítica da Razão Pura. Adaptado)

O fragmento acima descreve a mudança de paradigma proposta por Immanuel Kant na modernidade. Sobre as correntes da teoria do conhecimento e a síntese kantiana, é correto afirmar que:',
to_jsonb(ARRAY['o Racionalismo, representado por autores como René Descartes, sustenta que o conhecimento seguro é derivado exclusivamente da experiência sensível e da indução de casos particulares.', 'o Empirismo clássico defende a existência de ideias inatas, argumentando que a mente humana possui conceitos prévios ao nascimento que independem de qualquer percepção externa.', 'o Ceticismo Pirrônico estabelece que a razão humana é plenamente capaz de atingir a verdade absoluta das coisas, desde que utilize o método dedutivo matemático de forma rigorosa.', 'o Criticismo Kantiano propõe que o conhecimento é o resultado da interação entre os dados da experiência (sensibilidade) e as categorias puras do intelecto (entendimento).', 'o Dogmatismo filosófico é a base do pensamento crítico, pois estimula a dúvida constante sobre a capacidade do sujeito em conhecer a realidade objetiva sem o auxílio da fé.']),
3, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Filosofia', 'Filosofia Contemporânea',
'"A nossa ciência, que se pretende universal, é, na verdade, uma ciência regional: ela é europeia. Ela se baseia em uma ideia de humanidade que exclui todas as outras formas de estar no mundo que não sejam pautadas pelo consumo e pela exploração da natureza. O que chamamos de ''avanço tecnológico'' é, muitas vezes, apenas o refinamento de ferramentas de exaustão da vida para sustentar um progresso que não nos inclui." (Adaptado de: KRENAK, Ailton. Ideias para adiar o fim do mundo)

A reflexão de Ailton Krenak propõe uma análise crítica sobre a relação entre ciência, tecnologia e humanidade no mundo contemporâneo. De acordo com o pensamento do autor e a crítica à racionalidade instrumental, é correto afirmar que:',
to_jsonb(ARRAY['a tecnologia deve ser priorizada em relação à ciência pura, pois somente o desenvolvimento técnico-industrial pode garantir a preservação dos ecossistemas e a sobrevivência das comunidades tradicionais.', 'a ciência moderna, ao se desvincular da ética e dos saberes tradicionais, frequentemente atua como um instrumento de dominação que privilegia interesses corporativos em detrimento da manutenção da vida na Terra.', 'os investimentos em exploração espacial representam o ápice do desenvolvimento humano, servindo como modelo para a solução de crises humanitárias e sociais em países subdesenvolvidos.', 'a ciência e a tecnologia são neutras por natureza, sendo a desigualdade social um subproduto inevitável do progresso, que não depende das escolhas políticas ou das visões de mundo de quem as produz.', 'a superação da crise ambiental depende exclusivamente do aperfeiçoamento dos recursos tecnológicos atuais, sem a necessidade de revisão dos paradigmas de consumo e produção da sociedade ocidental.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

-- ========== SOCIOLOGIA (Q11-14) ==========
(gen_random_uuid(), 'Sociologia', 'Durkheim e Coesão Social',
'"A divisão do trabalho social não tem por objetivo apenas tornar possível ou mais produtivo o exercício de funções especializadas; sua verdadeira função é criar entre duas ou mais pessoas um sentimento de solidariedade. Seja qual for a forma pela qual esse resultado é obtido, é ela que integra o corpo social e garante a sua unidade." (Adaptado de: DURKHEIM, Émile. Da Divisão do Trabalho Social)

Considerando a teoria desse autor sobre os mecanismos de coesão social nas sociedades tradicionais e modernas, é correto afirmar que:',
to_jsonb(ARRAY['a solidariedade mecânica é característica de sociedades complexas, onde a diferenciação de funções individuais gera uma forte dependência mútua entre os membros.', 'a solidariedade orgânica prevalece em sociedades de baixo desenvolvimento tecnológico, onde a consciência coletiva coincide quase totalmente com as consciências individuais.', 'o aumento da divisão do trabalho social nas sociedades modernas promove a transição para a solidariedade orgânica, na qual a união se dá pela complementaridade das funções.', 'a anomia social ocorre quando as normas de solidariedade mecânica são tão rígidas que impedem o desenvolvimento da liberdade individual e do progresso econômico.', 'o Direito Restitutivo, focado em reparar danos e restabelecer o estado anterior, é a principal expressão jurídica das sociedades marcadas pela solidariedade mecânica.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Sociologia', 'Formação da Sociologia',
'"A Sociologia é a ''ciência da crise''. Ela nasce da necessidade de se compreender as rupturas causadas pelo desmoronamento de um mundo centrado na tradição, no campo e na religião, e a emergência de uma nova realidade urbana, industrial e laica. Sem o choque das transformações setecentistas, o olhar sociológico não teria tido o estímulo necessário para se sistematizar como ciência." (Adaptado de: QUINTANEIRO, T. Um Toque de Clássicos: Marx, Durkheim e Weber)

Sobre o contexto histórico de formação da Sociologia como disciplina científica, é correto afirmar que:',
to_jsonb(ARRAY['consolidou-se como um prolongamento do pensamento teológico-metafísico, buscando na providência divina as explicações para os novos conflitos urbanos.', 'emergiu no século XIX como uma tentativa de restaurar as estruturas feudais e os privilégios da nobreza, abalados pelas revoltas camponesas e pelo iluminismo.', 'resultou das transformações estruturais da Modernidade, impulsionadas pela Revolução Industrial e pela Revolução Francesa, que alteraram as formas de convivência humana.', 'surgiu na Antiguidade Clássica, sob a influência de filósofos como Aristóteles, que já utilizavam métodos estatísticos para analisar a mobilidade social na pólis.', 'fundamentou-se no isolamento das comunidades rurais europeias, visando preservar as tradições agrárias contra a ameaça do racionalismo científico das metrópoles.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Sociologia', 'Cidadania',
'"A cidadania é um status concedido àqueles que são membros integrais de uma comunidade. Todos os que possuem o status são iguais com respeito aos direitos e obrigações pertinentes ao status. Não há nenhum princípio universal que determine o que esses direitos e obrigações devam ser, mas as sociedades nas quais a cidadania é uma instituição em desenvolvimento criam uma imagem de cidadania ideal pela qual o sucesso pode ser medido." (MARSHALL, T.H. Cidadania, Classe Social e Status. Adaptado)

A partir da análise de T.H. Marshall sobre a formação da cidadania nas sociedades ocidentais modernas, é correto afirmar que:',
to_jsonb(ARRAY['os direitos civis, centrados na liberdade individual e na igualdade perante a lei, foram os últimos a serem conquistados, surgindo apenas após a consolidação do Estado de Bem-Estar Social no século XX.', 'a cidadania plena é o resultado de uma evolução linear e automática do capitalismo, dispensando a organização de movimentos sociais ou conflitos de classe para a sua efetivação jurídica.', 'os direitos sociais, como educação e segurança econômica, visam garantir que o indivíduo possa participar da herança social e viver a vida de um ser civilizado, de acordo com os padrões da sociedade.', 'o exercício dos direitos políticos, como o voto e a participação no poder estatal, é condicionado pela biologia do indivíduo, sendo um reflexo natural das desigualdades inerentes à espécie humana.', 'a trajetória da cidadania no Brasil seguiu rigorosamente o modelo britânico descrito por Marshall, iniciando-se pelos direitos civis no período colonial e culminando nos direitos sociais no Império.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Sociologia', 'Racismo Estrutural',
'"O racismo não é um ato isolado de um indivíduo patológico ou de um grupo minoritário de ''mentes atrasadas''. Ele é, antes de tudo, um componente da organização política, econômica e jurídica da sociedade. Quando as instituições operam de modo que o resultado de suas ações — ainda que não haja uma intenção declarada — reproduza desvantagens para um grupo racial específico, estamos diante de um fenômeno que transcende o comportamento individual." (Adaptado de: ALMEIDA, Silvio. Racismo Estrutural)

Com base na análise sociológica do racismo e na formação histórica da sociedade brasileira, é correto afirmar que:',
to_jsonb(ARRAY['o racismo estrutural manifesta-se por meio de processos históricos e instituições que, ao funcionarem normalmente, perpetuam privilégios e marginalizações baseados na origem étnica.', 'a herança escravocrata brasileira foi integralmente neutralizada pela Lei Áurea, de modo que as desigualdades atuais no sistema prisional decorrem estritamente de escolhas individuais.', 'a tese do "racismo reverso" é um conceito sociológico consolidado, que explica como grupos historicamente privilegiados sofrem o mesmo tipo de exclusão sistêmica que grupos minoritários.', 'o ordenamento jurídico contemporâneo, ao tipificar o racismo como crime inafiançável e imprescritível, eliminou as raízes sociais da discriminação, tornando o fenômeno meramente residual.', 'o conceito de racismo recreativo refere-se à utilização de práticas discriminatórias em ambientes de lazer como forma de inclusão social e redução de danos psicológicos aos oprimidos.']),
0, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

-- ========== GEOGRAFIA (Q15-20) ==========
(gen_random_uuid(), 'Geografia', 'Climatologia',
'A imagem apresenta a configuração de um fenômeno climático recorrente no verão brasileiro, resultante da interação de diferentes sistemas de circulação em altos níveis da atmosfera (250 hPa).

Com base na análise da imagem e nos conhecimentos sobre a climatologia do Brasil, é correto afirmar que a faixa de nebulosidade identificada como ZCAS:',
to_jsonb(ARRAY['decorre do fenômeno de subsidência do ar provocado pelo VCAN, o que resulta em tempo seco e estável na região central do Brasil durante o fenômeno do El Niño.', 'representa um canal de convergência de umidade que conecta a Floresta Amazônica ao Oceano Atlântico, sendo alimentada pela divergência de ventos da Alta da Bolívia.', 'tem sua formação dificultada pela presença da Alta da Bolívia, uma vez que esse sistema de alta pressão impede a subida do ar úmido necessário para a formação de nuvens.', 'manifesta-se predominantemente no inverno, quando o VCAN se desloca para o Sul do país, provocando geadas severas e queda brusca de temperatura no Sudeste.', 'é uma frente fria oceânica estática que, ao atingir o litoral do Nordeste, causa chuvas rápidas e passageiras, sem interferência dos sistemas de circulação da alta atmosfera.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Geografia', 'Climatologia',
'Analise o mapa meteorológico que ilustra a distribuição média das anomalias de temperatura da superfície do mar durante o mês de agosto de 2020. Os tons de azul no Pacífico Equatorial indicam águas mais frias que a média histórica.

Com base na interpretação da imagem e nos conhecimentos sobre a dinâmica climática global, a anomalia térmica observada nessa região é o principal indicador para a ocorrência do fenômeno:',
to_jsonb(ARRAY['El Niño, que resulta no enfraquecimento dos ventos alísios e no aumento da precipitação sobre a região Nordeste do Brasil.', 'La Niña, caracterizada pela intensificação dos ventos alísios, provocando, em decorrência, secas prolongadas no Sul do Brasil e na Argentina.', 'El Niño Modoki, fase em que o aquecimento anômalo se concentra no Pacífico Central, anulando os efeitos sobre a distribuição de chuvas no Sudeste brasileiro.', 'La Niña, cuja ocorrência inibe o processo de ressurgência na costa do Peru e do Chile, resultando no aumento da temperatura da água e no declínio da pesca local.', 'El Niño, associado ao deslocamento para leste da área de convecção tropical, o que favorece longos períodos chuvosos na região Sul do Brasil.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Geografia', 'Urbanização',
'Observe o esquema que representa a evolução da ocupação do solo em uma região metropolitana hipotética ao longo do tempo.

O processo de integração física das manchas urbanas de municípios distintos, conforme ilustrado no estágio final do diagrama, é um fenômeno central da urbanização contemporânea. Sobre esse processo e suas implicações, é correto afirmar que se trata da:',
to_jsonb(ARRAY['Gentrificação, processo que resulta na expulsão de populações de baixa renda das áreas centrais para a periferia, visando a valorização imobiliária.', 'Conurbação, que exige a integração de serviços públicos e infraestrutura de transporte, uma vez que os limites municipais tornam-se imperceptíveis no cotidiano.', 'Verticalização, fenômeno que prioriza o crescimento das cidades em direção ao topo, reduzindo a necessidade de expansão das manchas urbanas horizontais.', 'Metropolização, que ocorre quando uma cidade média passa a exercer influência econômica direta sobre a capital do estado, invertendo a hierarquia urbana.', 'Segregação Socioespacial, na qual o crescimento das cidades é interrompido por barreiras físicas naturais que impedem a junção das malhas urbanas vizinhas.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Geografia', 'Geopolítica',
'O século XXI tem sido marcado pela ascensão da China como uma "superpotência emergente", desafiando a hegemonia econômica e política dos Estados Unidos. Para sustentar seu crescimento e garantir o escoamento de sua produção, Pequim lançou a Iniciativa Belt and Road (Cinturão e Rota), também conhecida como a Nova Rota da Seda.

Sobre essa estratégia geopolítica e o atual papel da China no cenário internacional, é correto afirmar:',
to_jsonb(ARRAY['A China utiliza a Nova Rota da Seda exclusivamente para fins humanitários, visando o desenvolvimento social das nações africanas sem contrapartidas comerciais ou controle de portos.', 'O projeto chinês foca na criação de corredores de infraestrutura ferroviária e marítima que conectam a Ásia, Europa e África, ampliando a dependência de diversos países em relação ao capital e à tecnologia chineses.', 'A ascensão econômica chinesa baseia-se no modelo de "isolacionismo produtivo", no qual o país evita investimentos externos e foca apenas no fortalecimento do seu mercado consumidor interno.', 'A Nova Rota da Seda foi criada para isolar a Rússia do mercado asiático, consolidando uma aliança militar definitiva entre a China e a OTAN para o controle do Oceano Índico.', 'Apesar do crescimento econômico, a China mantém uma balança comercial deficitária com a maioria dos países da América Latina, dependendo da importação de produtos industrializados de alta tecnologia dessas nações.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Geografia', 'Demografia',
'Analise os dados estatísticos que representam a evolução da estrutura etária da população brasileira ao longo de um século (1960-2060).

A mudança no perfil demográfico brasileiro observada no gráfico, caracterizada pelo estreitamento da base e o alargamento do topo da pirâmide, é resultado de um processo conhecido como transição demográfica. Sobre esse fenômeno e seus impactos no Brasil, é correto afirmar:',
to_jsonb(ARRAY['A redução da base da pirâmide deve-se ao aumento das taxas de mortalidade infantil e à queda da expectativa de vida nas últimas décadas, decorrentes da crise no sistema público de saúde.', 'O envelhecimento populacional é impulsionado pela manutenção de elevadas taxas de fecundidade, aliada a um processo de migração interna massiva de jovens para o exterior (êxodo populacional).', 'O processo de transição demográfica gera o chamado "Bônus Demográfico", momento em que a proporção de pessoas em idade ativa é maior que a de dependentes, representando uma janela de oportunidade econômica.', 'O aumento da proporção de idosos é um fenômeno exclusivo das regiões Norte e Nordeste, onde a urbanização tardia impediu o acesso a métodos contraceptivos e ao planejamento familiar.', 'A estrutura etária projetada para 2060 indica uma sociedade com baixa carga de dependência, o que desonera o Estado de gastos com previdência social e assistência médica especializada.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Geografia', 'Hidrologia e Urbanização',
'O ciclo hidrológico é um sistema fechado que envolve a circulação contínua da água entre a atmosfera, a litosfera e a hidrosfera. No entanto, a ocupação urbana desordenada introduz variáveis que rompem o equilíbrio desse fluxo natural.

Com base na análise do diagrama e nos conhecimentos sobre a dinâmica hídrica em áreas urbanas, é correto afirmar que o processo de pavimentação e impermeabilização do solo nas grandes cidades brasileiras provoca:',
to_jsonb(ARRAY['o aumento da infiltração da água no solo, favorecendo o abastecimento imediato dos lençóis freáticos e reduzindo o risco de secas.', 'a intensificação da evapotranspiração real, uma vez que o asfalto retém a umidade e a libera gradualmente para a atmosfera ao longo do dia.', 'a redução do escoamento superficial (run-off), minimizando a pressão sobre as galerias pluviais e evitando a ocorrência de inundações bruscas.', 'o aumento da velocidade e do volume do escoamento superficial, o que antecipa o pico das cheias nos rios urbanos e potencializa a ocorrência de enchentes.', 'a estabilização do ciclo hidrológico local, já que a retirada da cobertura vegetal não interfere na capacidade de absorção de água pelas bacias hidrográficas.']),
3, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

-- ========== PORTUGUÊS (Q21-34) ==========
(gen_random_uuid(), 'Português', 'Interpretação de Texto',
'"Tolerar os defeitos do companheiro e entender que, ao firmar uma parceria, compramos um pacote completo [...] parece, cada vez mais, uma esquisita característica de uma subespécie em extinção."

Com base na leitura atenta do texto e na organização das ideias apresentadas pela autora, é correto afirmar que:',
to_jsonb(ARRAY['o fenômeno das "atrações fatais" indica que as virtudes que inicialmente atraem um parceiro são as mesmas que, por sua intensidade, podem se tornar a causa do desgaste da relação.', 'a teoria da troca social defende que as relações humanas são movidas pelo altruísmo, sendo o abandono do parceiro uma consequência da falta de alternativas viáveis no mercado afetivo.', 'a autora defende a tese de que a modernidade eliminou a subjetividade dos afetos, transformando o amor em uma ciência exata baseada exclusivamente na biologia do desejo.', 'o desfecho do texto sugere que a solução para os conflitos conjugais reside na busca por parceiros que sejam desprovidos de defeitos, garantindo a estabilidade emocional a longo prazo.', 'a socióloga Diane Felmlee concluiu, em seus estudos, que as reclamações corriqueiras sobre o excesso de trabalho dos parceiros são infundadas, uma vez que o sucesso profissional sempre fortalece o vínculo amoroso.']),
0, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Interpretação de Texto',
'No trecho: "Algum tempo depois, passou a reclamar que ''ele não levava nada a sério''. Nesse caso, também, o que era qualidade virou defeito. Deve haver alguma explicação para isso." (8º parágrafo).

Assinale a alternativa que apresenta a ideia retomada pelo pronome "isso":',
to_jsonb(ARRAY['A constatação de que o senso de humor é uma característica irrelevante para a manutenção de relacionamentos estáveis e duradouros.', 'A teoria da troca social, que será explicada na sequência do texto como a base das escolhas racionais e do custo-benefício.', 'O paradoxo de uma característica positiva ser reavaliada negativamente pelo parceiro com o decorrer da convivência.', 'A justificativa apresentada pelo garoto que terminou a relação por considerar que ela era baseada apenas no desejo carnal.', 'A escassez de tolerância nas relações modernas, o que impede que os casais consigam celebrar as conquistas um do outro.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Análise Gramatical',
'No 4º parágrafo, a autora afirma: "O grupo majoritário parece ser o dos apaixonados intolerantes. Há quem se dedique a tentar entendê-los."

Assinale a alternativa que indica corretamente o referente do pronome destacado e a classe gramatical do termo que o precede:',
to_jsonb(ARRAY['O pronome retoma "amores imperfeitos" e é precedido por um verbo no infinitivo que exige complemento direto.', 'O pronome refere-se aos "apaixonados intolerantes" e está vinculado a um verbo que expressa uma ação de esforço intelectual.', 'O termo destacado retoma "defeitos do companheiro", funcionando como objeto indireto da locução verbal "tentar entender".', 'O pronome retoma "parceiros", indicando que a ciência busca justificar o comportamento daqueles que são alvo de reclamações.', 'O termo refere-se aos "amigos que descrevem o parceiro", retomando a ideia inicial do texto sobre a insatisfação corriqueira.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Semântica',
'No primeiro parágrafo, a autora utiliza a expressão: "Quantos dos seus amigos descrevem o parceiro (ou parceira) de uma forma estranhamente dúbia?".

Assinale a alternativa em que o termo em destaque é substituído por um sinônimo adequado ao contexto, mantendo o sentido original do período.',
to_jsonb(ARRAY['Insofismável, indicando que a descrição feita pelos amigos é clara e não permite nenhum tipo de dúvida ou interpretação alternativa.', 'Equívoca, sugerindo que as descrições apresentam um caráter incerto, podendo ser interpretadas de duas ou mais maneiras contraditórias.', 'Lacônica, sinalizando que os amigos são extremamente breves e diretos ao falar sobre os defeitos e qualidades de seus parceiros.', 'Dogmática, apontando que as opiniões dos amigos são expressas de forma autoritária e baseadas em verdades absolutas e imutáveis.', 'Inteligível, ressaltando que a forma como o parceiro é descrito é de fácil compreensão e perfeitamente lógica para quem ouve.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Acentuação',
'Assinale a alternativa em que todas as palavras retiradas ou adaptadas do texto estão acentuadas corretamente, de acordo com a norma-padrão e o Acordo Ortográfico vigente.',
to_jsonb(ARRAY['Próprio, sociológica e ideía.', 'Pára, ciência e frequência.', 'Insuportável, pode e consequência.', 'Estratégia, ênfase e vôo.', 'Relativizá-lo, heroíco e dúvida.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Orações Subordinadas',
'"Ao realizar estudos com casais, a socióloga observou que as atrações fatais ocorrem com frequência; se a tolerância fosse exercitada, muitos relacionamentos não naufragariam."

As orações destacadas estabelecem, correta e respectivamente, as circunstâncias de:',
to_jsonb(ARRAY['Causa e Concessão.', 'Tempo e Condição.', 'Finalidade e Proporção.', 'Consequência e Tempo.', 'Explicação e Comparação.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Advérbios',
'Considere os trechos extraídos e adaptados do texto:\n\nI. "...talvez estranha seja a minoria que parece satisfeita..."\nII. "...trabalhava excessivamente durante a semana..."\nIII. "...uma característica que é vista como uma qualidade no início..."\nIV. "...o parceiro (ou parceira) de uma forma estranhamente dúbia..."

Assinale a alternativa que classifica, correta e respectivamente, as circunstâncias expressas pelos termos em destaque:',
to_jsonb(ARRAY['I. Afirmação; II. Modo; III. Lugar; IV. Intensidade.', 'I. Dúvida; II. Intensidade; III. Tempo; IV. Modo.', 'I. Intensidade; II. Tempo; III. Modo; IV. Dúvida.', 'I. Dúvida; II. Modo; III. Tempo; IV. Intensidade.', 'I. Afirmação; II. Intensidade; III. Lugar; IV. Modo.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Orações Adjetivas',
'Analise os dois períodos abaixo, adaptados do texto:\n\nI. "O grupo majoritário que é formado por apaixonados costuma ser intolerante."\nII. "A socióloga Diane Felmlee, que realiza estudos com casais há décadas, criou o termo atrações fatais."

Sobre a classificação e a pontuação das orações destacadas, é correto afirmar:',
to_jsonb(ARRAY['Em I, a oração é adjetiva explicativa; caso as vírgulas fossem inseridas, o sentido original de restrição seria mantido, indicando que todos os grupos são apaixonados.', 'Em II, a oração é adjetiva restritiva, pois limita o universo das sociólogas apenas àquelas que estudam casais, sendo a ausência de vírgulas obrigatória.', 'A oração em I exerce função de oração adjetiva restritiva, restringindo seu sentido; já em II, a oração tem valor de oração adjetiva explicativa, justificando o uso das vírgulas.', 'Ambas as orações são substantivas objetivas diretas, pois completam o sentido dos verbos "formar" e "realizar", respectivamente.', 'A substituição do pronome "que" por "onde" em ambos os períodos manteria a correção gramatical, uma vez que as orações indicam o lugar onde os fenômenos ocorrem.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Conjunções',
'Considere os seguintes trechos adaptados do texto:\n\nI. "A receita para evitar que as relações naufraguem é a tolerância."\nII. "É preciso relativizar os hábitos irritantes que passamos a notar."\nIII. "Diane acredita que a explicação está na teoria da troca social."

Assinale a alternativa que classifica, correta e respectivamente, a função da palavra destacada:',
to_jsonb(ARRAY['I. Conjunção Integrante; II. Pronome Relativo; III. Conjunção Integrante.', 'I. Pronome Relativo; II. Conjunção Integrante; III. Pronome Relativo.', 'I. Conjunção Integrante; II. Conjunção Integrante; III. Pronome Relativo.', 'I. Pronome Relativo; II. Pronome Relativo; III. Conjunção Integrante.', 'I. Conjunção Integrante; II. Pronome Relativo; III. Pronome Relativo.']),
0, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Conjunções e Semântica',
'Analise o período adaptado do texto:\n\n"A característica do parceiro torna-se tamanho incômodo ao longo dos anos que a convivência passa a ser considerada insuportável por uma das partes."

A relação estabelecida pela conjunção destacada, em articulação com o termo que a antecede, indica uma circunstância de:',
to_jsonb(ARRAY['Causa, uma vez que a insuportabilidade da convivência é o motivo que gera o incômodo excessivo no relacionamento.', 'Finalidade, visto que o objetivo do incômodo é forçar a revisão das qualidades do parceiro para evitar o naufrágio da relação.', 'Concessão, pois o incômodo, embora seja grande, não é suficiente para impedir que a convivência continue de forma harmônica.', 'Consequência, indicando que o desgaste da convivência é o resultado direto da intensidade do incômodo gerado por traços extremos.', 'Proporção, estabelecendo que o incômodo e a insuportabilidade da convivência aumentam na mesma medida cronológica.']),
3, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Interpretação de Texto',
'(TEXTO - Luís Antônio Giron) Com a evolução e o aumento de usuários e da importância das redes sociais, o nome e a fotografia de cada pessoa passaram a funcionar como o substituto do sujeito. O "eu" real se esvaziou para dar lugar ao "perfil". [...] Ninguém existe nas redes sociais senão como representações, que estão ali no lugar dos indivíduos. [...] O verdadeiro eu migrou do mundo off-line para o online. [...] O ato de "curtir" tem um poder ontológico: ele alterou irremediavelmente a nossa forma de encarar o mundo, os outros e a nós mesmos.

No segundo parágrafo, o autor estabelece um paralelo entre o pensamento de René Descartes e o comportamento contemporâneo nas redes sociais. A partir dessa comparação, infere-se que a "nova atitude lógica" mencionada pelo autor:',
to_jsonb(ARRAY['resgata o valor da dúvida científica ao permitir que o usuário questione a veracidade de todas as postagens antes de "curti-las".', 'promove uma involução do pensamento crítico, já que a existência humana passa a ser validada pela aprovação tecnológica e não pelo exercício do raciocínio.', 'demonstra que a presunção tecnológica é um estágio superior à dúvida metódica, aproximando o homem moderno da verdade absoluta.', 'reforça a continuidade natural entre o sujeito real e seu perfil virtual, garantindo que o pensamento cartesiano permaneça válido no século XXI.', 'comprova que o ato de "curtir" é uma forma de pensamento complexo, capaz de substituir com vantagem a antiga racionalidade do século XVII.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Interpretação de Texto',
'Analise o seguinte trecho do terceiro parágrafo:\n\n"Elas se tornam ocas para rechear de signos seus perfis. O verdadeiro eu migrou do mundo off-line para o online."

De acordo com a visão crítica do autor, esse processo de "migração" do sujeito para o universo virtual resulta na:',
to_jsonb(ARRAY['expansão da consciência individual, ao projetar ideias para um público global.', 'democratização das identidades, pois as máscaras digitais revelam a essência.', 'fragilização da subjetividade, ao priorizar a imagem externa em vez do eu real.', 'superação das falsidades sociais, impedindo a ação de vigaristas no ambiente.', 'consolidação da transparência, eliminando a distinção entre o real e o virtual.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Semântica',
'Considere o sentido das palavras destacadas nos seguintes trechos do texto:\n\nI. "...insidiosamente simular um alter ego digital." (3º parágrafo)\nII. "Os vigaristas e falsários pululam alegremente..." (3º parágrafo)\nIII. "O ato de ''curtir'' tem um poder ontológico..." (5º parágrafo)

Assinale a alternativa que apresenta sinônimos que preservam, correta e respectivamente, o sentido original desses vocábulos:',
to_jsonb(ARRAY['I. ingenuamente; II. saltam; III. histórico.', 'I. traiçoeiramente; II. abundam; III. existencial.', 'I. publicamente; II. desaparecem; III. biológico.', 'I. discretamente; II. caminham; III. místico.', 'I. apressadamente; II. gritam; III. religioso.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Pontuação',
'Assinale a alternativa em que a pontuação está em total conformidade com a norma-padrão da língua portuguesa.',
to_jsonb(ARRAY['O "eu" real, se esvaziou rapidamente para dar lugar, à representação digital dos perfis.', 'É possível afirmar que, nas redes sociais, o sujeito cede espaço a uma representação construída para agradar.', 'Os vigaristas e falsários, pululam nas redes porque, sabem que ninguém verifica a autenticidade.', 'O ato de curtir tem, um poder ontológico que alterou, irremediavelmente nossa forma de encarar o mundo.', 'Descartes se reviraria, no seu túmulo caso pudesse observar, o que se passa na cabeça dos seres humanos.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

-- ========== PORTUGUÊS (Q35-38) ==========
(gen_random_uuid(), 'Português', 'Classes Gramaticais',
'Analise o termo destacado no trecho adaptado do texto: "A dúvida científica cedeu espaço à presunção tecnológica. O que se observa hoje é que o perfil digital tornou-se mais relevante do que o de carne e osso."\n\nAssinale a alternativa que classifica, correta e respectivamente, as classes gramaticais dos termos destacados:',
to_jsonb(ARRAY['Pronome demonstrativo; artigo definido; pronome demonstrativo.', 'Artigo definido; artigo definido; artigo definido.', 'Pronome pessoal oblíquo; pronome demonstrativo; artigo definido.', 'Pronome demonstrativo; pronome pessoal oblíquo; artigo definido.', 'Artigo definido; pronome demonstrativo; pronome demonstrativo.']),
4, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Verbos',
'No trecho: "Hoje, Descartes se reviraria no seu túmulo [...] caso pudesse observar o que se passa na cabeça dos seres humanos.", o verbo destacado expressa:',
to_jsonb(ARRAY['Uma ação habitual no passado, que se repete no presente de forma incontestável.', 'Uma capacidade física ou intelectual plenamente realizada pelo sujeito da oração.', 'Uma hipótese ou condição improvável, situada no campo da irrealidade.', 'Uma permissão concedida por uma autoridade superior no contexto tecnológico.', 'Uma certeza futura, indicando que o filósofo eventualmente observará a sociedade.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Semântica e Interpretação',
'Analise os termos destacados nos trechos abaixo e assinale a alternativa correta quanto à sua função ou sentido.',
to_jsonb(ARRAY['Em "Se alguém me curte, posso adquirir certeza...", o verbo destacado indica uma obrigação imposta pelas regras sociais.', 'No trecho "...não há como verificar a veracidade dele e, assim, mergulho na frustração...", o conectivo estabelece uma relação de oposição.', 'Em "As redes sociais deram origem a universos de consenso absoluto", o termo "origem" funciona como o núcleo do sujeito da oração.', 'No período "Quem curte não curte algo, mas curte o próprio ato de curtir", a conjunção destaca uma ressalva que anula a ideia anterior.', 'Em "O mundo, em suma, não pode existir...", a expressão destacada tem valor conclusivo, sintetizando a ideia exposta anteriormente.']),
4, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Português', 'Regência e Crase',
'Assinale a alternativa que preenche, correta e respectivamente, as lacunas da frase a seguir, de acordo com a norma-padrão:\n\nO Oficial dirigiu-se ____ sala de reuniões disposto ____ discutir as novas diretrizes de policiamento, visando ____ melhoria da segurança urbana e pedindo atenção ____ todas as sugestões apresentadas.',
to_jsonb(ARRAY['à ... a ... a ... a', 'a ... à ... à ... à', 'à ... a ... à ... a', 'a ... a ... à ... à', 'à ... à ... a ... a']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

-- ========== INGLÊS (Q39-44) ==========
(gen_random_uuid(), 'Inglês', 'Interpretação de Texto',
'Read the passage below and answer the question.\n\n"The militarization of police forces across the globe has raised significant concerns among human rights organizations. While proponents argue that military-grade equipment is necessary to combat increasingly sophisticated criminal networks, critics point out that such measures often lead to disproportionate use of force, particularly in marginalized communities."\n\nAccording to the text, the main concern expressed by human rights organizations is that:',
to_jsonb(ARRAY['police forces lack the proper training to handle military equipment.', 'the use of military-grade equipment may result in excessive force against vulnerable populations.', 'criminal networks have become too powerful for conventional policing methods.', 'militarization is an effective strategy only in developed countries.', 'human rights organizations support limited militarization under strict oversight.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Vocabulário',
'In the sentence: "The officer''s unwavering commitment to justice earned him the respect of both his peers and the community he served.", the word "unwavering" is closest in meaning to:',
to_jsonb(ARRAY['questionable', 'unstable', 'firm and steady', 'temporary', 'aggressive']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Interpretação de Texto',
'Read the passage:\n\n"Community policing has emerged as a paradigm shift in law enforcement philosophy. Rather than relying solely on reactive measures — responding to crimes after they occur — this approach emphasizes proactive engagement with citizens, building trust through dialogue, transparency, and shared responsibility for public safety."\n\nThe text suggests that community policing differs from traditional methods primarily because it:',
to_jsonb(ARRAY['focuses exclusively on crime prevention through surveillance technology.', 'prioritizes building relationships with the community before crimes occur.', 'eliminates the need for traditional law enforcement officers entirely.', 'relies on military strategies adapted for urban environments.', 'reduces the budget allocated to police training programs.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Gramática',
'Choose the alternative that correctly completes the sentence:\n\n"If the police department _______ implemented the new protocol earlier, the outcome of the operation _______ significantly different."',
to_jsonb(ARRAY['has / would be', 'had / would have been', 'would have / had been', 'have / will be', 'having / would be']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Interpretação de Texto',
'Read the excerpt:\n\n"The concept of ''use of force continuum'' provides officers with a framework for escalating or de-escalating their response based on the level of threat encountered. Starting from mere officer presence, the continuum progresses through verbal commands, physical control, less-lethal methods, and ultimately, lethal force as a last resort."\n\nBased on the text, it can be inferred that the use of force continuum:',
to_jsonb(ARRAY['allows officers to use any level of force at their discretion regardless of threat level.', 'is a rigid set of rules that must be followed in exact sequential order during every encounter.', 'provides a graduated response model where the level of force should match the perceived threat.', 'was designed to justify the use of lethal force in most police encounters.', 'eliminates the possibility of officers using verbal commands in dangerous situations.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Inglês', 'Referência Textual',
'In the sentence: "Officers who undergo continuous professional development tend to perform better in high-stress situations, as their training provides them with the tools necessary to manage such scenarios effectively.", the pronoun "their" refers to:',
to_jsonb(ARRAY['high-stress situations', 'tools', 'officers', 'scenarios', 'professional development']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

-- ========== MATEMÁTICA (Q45-54) ==========
(gen_random_uuid(), 'Matemática', 'Progressão Aritmética',
'Um batalhão da Polícia Militar realiza um programa de treinamento físico progressivo. No primeiro dia, os recrutas correm 2 km. A cada dia subsequente, a distância percorrida aumenta em 0,5 km em relação ao dia anterior. Ao final de 20 dias de treinamento, a distância total percorrida pelos recrutas, em km, será de:',
to_jsonb(ARRAY['125', '135', '130', '140', '95']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Análise Combinatória',
'Uma equipe de segurança deve ser formada por 3 oficiais escolhidos entre 5 capitães e 2 sargentos escolhidos entre 4 disponíveis. O número de equipes distintas que podem ser formadas é:',
to_jsonb(ARRAY['120', '30', '60', '80', '40']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Geometria Plana',
'Em um treinamento de orientação, um policial parte de um ponto A, caminha 6 km para o Norte até o ponto B, depois 8 km para o Leste até o ponto C. A distância em linha reta entre os pontos A e C, em km, é:',
to_jsonb(ARRAY['14', '10', '12', '7', '9']),
4, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Geometria Plana',
'Considere a figura que apresenta o quadrilátero PQRS, onde os triângulos PQR e PRS possuem áreas iguais a 24 cm² e 18 cm², respectivamente. A área total do quadrilátero PQRS, em cm², é:',
to_jsonb(ARRAY['42', '36', '48', '30', '54']),
0, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Probabilidade',
'Uma urna contém 5 bolas vermelhas e 3 bolas azuis. Retirando-se 2 bolas ao acaso, sem reposição, a probabilidade de ambas serem vermelhas é:',
to_jsonb(ARRAY['25/64', '15/56', '5/14', '10/28', '5/28']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Função Exponencial',
'Uma população de bactérias em um laboratório cresce segundo a função P(t) = 200 · 2^(t/3), em que t é o tempo em horas. O tempo necessário para que a população atinja 1600 bactérias é de:',
to_jsonb(ARRAY['6 horas', '12 horas', '9 horas', '3 horas', '15 horas']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Porcentagem',
'Um produto teve seu preço aumentado em 20% e, em seguida, o novo preço sofreu um desconto de 15%. Em relação ao preço original, o preço final representa uma variação de:',
to_jsonb(ARRAY['+5%', '-5%', '+2%', '+8%', '-2%']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Geometria Analítica',
'Considere o polígono ACBFDE representado no plano cartesiano. Sabendo que seus vértices possuem coordenadas inteiras e que a figura é simétrica em relação ao eixo y, a área do polígono, em unidades de área, é:',
to_jsonb(ARRAY['48', '36', '24', '40', '32']),
4, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Matrizes',
'Dada a matriz A = [2 1; 3 4], o determinante de A é:',
to_jsonb(ARRAY['11', '5', '-5', '2', '-2']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Matemática', 'Progressão Aritmética',
'Em uma sequência aritmética, o terceiro termo vale 10 e o sétimo termo vale 22. A soma dos 15 primeiros termos dessa sequência é:',
to_jsonb(ARRAY['315', '375', '255', '300', '345']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

-- ========== FÍSICA (Q55-60) ==========
(gen_random_uuid(), 'Física', 'Cinemática',
'Um veículo da polícia parte do repouso e acelera uniformemente a 2 m/s². Após 10 segundos, o motorista mantém a velocidade constante por mais 5 segundos. A distância total percorrida nesse intervalo de 15 segundos é:',
to_jsonb(ARRAY['150 m', '200 m', '100 m', '250 m', '175 m']),
0, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Termodinâmica',
'Um gás ideal sofre uma transformação isobárica, passando de um volume de 2 L para 5 L à pressão constante de 1 atm. O trabalho realizado pelo gás, em joules, considerando 1 atm·L ≈ 101,3 J, é aproximadamente:',
to_jsonb(ARRAY['101,3', '202,6', '303,9', '506,5', '152,0']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Cinemática',
'Considere o gráfico de velocidade em função do tempo para um objeto em movimento retilíneo. A área sob a curva representa o deslocamento. Se a velocidade varia linearmente de 10 m/s a 30 m/s em 4 segundos, o deslocamento nesse intervalo é:',
to_jsonb(ARRAY['60 m', '40 m', '80 m', '120 m', '100 m']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Eletricidade',
'Um circuito elétrico possui dois resistores de 6 Ω e 3 Ω ligados em paralelo. A resistência equivalente do circuito, em ohms, é:',
to_jsonb(ARRAY['9', '2', '4,5', '3', '1']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Óptica',
'Um objeto é colocado a 30 cm de um espelho côncavo cuja distância focal é 15 cm. A imagem formada será:',
to_jsonb(ARRAY['virtual, direita e menor.', 'real, invertida e do mesmo tamanho.', 'virtual, direita e maior.', 'real, invertida e menor.', 'real, direita e maior.']),
0, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Física', 'Ondulatória',
'Uma onda sonora se propaga no ar com velocidade de 340 m/s e frequência de 680 Hz. O comprimento de onda dessa onda é:',
to_jsonb(ARRAY['2,0 m', '0,25 m', '0,5 m', '1,0 m', '0,75 m']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

-- ========== QUÍMICA (Q61-68) ==========
(gen_random_uuid(), 'Química', 'Química Orgânica',
'A reação de saponificação é um processo químico fundamental na produção de sabão. Ela envolve a hidrólise alcalina de um éster (gordura) na presença de uma base forte. O produto orgânico dessa reação é:',
to_jsonb(ARRAY['um ácido carboxílico.', 'um sal de ácido carboxílico (sabão).', 'um álcool e um aldeído.', 'uma cetona e água.', 'um éter e um ácido inorgânico.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Estequiometria',
'Na combustão completa de 1 mol de metano (CH₄), segundo a equação balanceada CH₄ + 2O₂ → CO₂ + 2H₂O, o volume de CO₂ produzido nas CNTP é aproximadamente:',
to_jsonb(ARRAY['11,2 L', '44,8 L', '22,4 L', '33,6 L', '67,2 L']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Soluções',
'Para preparar 500 mL de uma solução aquosa de NaCl com concentração de 0,2 mol/L, a massa de NaCl necessária (massa molar = 58,5 g/mol) é:',
to_jsonb(ARRAY['29,25 g', '5,85 g', '11,70 g', '58,50 g', '117,00 g']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Eletroquímica',
'Em uma pilha eletroquímica, o eletrodo onde ocorre a oxidação é denominado:',
to_jsonb(ARRAY['cátodo.', 'ânodo.', 'eletrodo inerte.', 'eletrodo de referência.', 'ponte salina.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Termoquímica',
'Uma reação exotérmica é aquela que:',
to_jsonb(ARRAY['absorve energia do ambiente para ocorrer.', 'não envolve troca de energia com o meio.', 'apresenta variação de entalpia (ΔH) negativa, liberando calor.', 'ocorre somente em altas temperaturas e pressões.', 'tem sua velocidade diminuída com o aumento da temperatura.']),
3, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Tabela Periódica',
'Analise a posição dos elementos X e Y na tabela periódica. O elemento X pertence ao grupo 1 (metais alcalinos) e o elemento Y ao grupo 17 (halogênios), ambos no mesmo período. É correto afirmar que:',
to_jsonb(ARRAY['o raio atômico de X é menor que o de Y.', 'a energia de ionização de X é maior que a de Y.', 'X tende a formar cátions e Y tende a formar ânions.', 'ambos possuem alta eletronegatividade.', 'X e Y formam ligações covalentes apolares entre si.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Química Orgânica',
'O etanol (C₂H₅OH) e o dimetiléter (CH₃OCH₃) possuem a mesma fórmula molecular (C₂H₆O), porém apresentam propriedades físicas e químicas distintas. Esse fenômeno é denominado:',
to_jsonb(ARRAY['isomeria de cadeia.', 'isomeria de posição.', 'isomeria de compensação (metameria).', 'isomeria de função.', 'tautomeria.']),
3, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Química', 'Química Orgânica',
'A fórmula estrutural do ácido etanoico (ácido acético) apresenta o grupo funcional:',
to_jsonb(ARRAY['hidroxila (-OH).', 'carbonila (C=O).', 'carboxila (-COOH).', 'amino (-NH₂).', 'éster (-COO-).']),
0, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

-- ========== BIOLOGIA (Q69-80) ==========
(gen_random_uuid(), 'Biologia', 'Ecologia',
'Em um ecossistema aquático, observa-se que a redução da população de peixes herbívoros levou ao crescimento excessivo de algas, diminuindo a oxigenação da água e provocando a morte de outros organismos. Esse fenômeno é um exemplo de:',
to_jsonb(ARRAY['sucessão ecológica primária.', 'mutualismo obrigatório.', 'desequilíbrio na cadeia alimentar por remoção de consumidores primários.', 'especiação simpátrica.', 'resistência ambiental.']),
3, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Genética',
'Na herança do sistema ABO, os alelos Iᴬ e Iᴮ são codominantes entre si e ambos dominantes sobre o alelo i. Um casal em que ambos possuem sangue tipo AB poderá ter filhos com os seguintes tipos sanguíneos:',
to_jsonb(ARRAY['apenas AB.', 'A, B e AB.', 'A, B, AB e O.', 'apenas A e B.', 'A e AB.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Bioquímica',
'As enzimas são catalisadores biológicos que aceleram reações químicas nas células. Uma característica fundamental das enzimas é que:',
to_jsonb(ARRAY['são consumidas durante a reação que catalisam.', 'atuam de forma inespecífica sobre qualquer substrato.', 'possuem um sítio ativo com alta especificidade pelo substrato.', 'funcionam melhor em temperaturas extremamente elevadas.', 'são formadas exclusivamente por lipídios.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Fisiologia Humana',
'O sistema nervoso autônomo é responsável pelo controle involuntário de diversas funções corporais. A divisão simpática desse sistema, quando ativada, provoca:',
to_jsonb(ARRAY['diminuição da frequência cardíaca e constrição pupilar.', 'aumento da frequência cardíaca e dilatação pupilar.', 'aumento da atividade digestiva e redução da pressão arterial.', 'constrição dos brônquios e aumento da salivação.', 'relaxamento total da musculatura esquelética.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Ecologia',
'Analise o diagrama que representa uma cadeia alimentar em um ecossistema. A transferência de energia entre os níveis tróficos é caracterizada por:',
to_jsonb(ARRAY['aumento progressivo da energia disponível a cada nível trófico superior.', 'manutenção constante da quantidade de energia em todos os níveis tróficos.', 'perda significativa de energia a cada nível trófico, principalmente na forma de calor.', 'reciclagem completa da energia dentro do ecossistema, sem perdas.', 'transferência integral de energia dos produtores para os consumidores terciários.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Genética',
'A síndrome de Down é causada pela presença de um cromossomo extra no par 21 (trissomia do 21). O mecanismo genético responsável por essa alteração é:',
to_jsonb(ARRAY['crossing-over desigual durante a meiose I.', 'não disjunção cromossômica durante a meiose.', 'mutação pontual no gene do cromossomo 21.', 'deleção de parte do cromossomo 21.', 'duplicação gênica seguida de inversão pericêntrica.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Citologia',
'A mitocôndria é uma organela essencial para o metabolismo celular aeróbico. Sua principal função é:',
to_jsonb(ARRAY['realizar a síntese de proteínas a partir do RNA mensageiro.', 'armazenar material genético complementar ao DNA nuclear.', 'produzir ATP através da respiração celular aeróbica.', 'digerir partículas e organelas envelhecidas por autofagia.', 'sintetizar lipídios e detoxificar substâncias no citoplasma.']),
1, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Fisiologia Humana',
'O sistema imunológico humano possui dois tipos principais de resposta: a imunidade inata e a imunidade adaptativa. Uma diferença fundamental entre elas é que:',
to_jsonb(ARRAY['a imunidade inata é altamente específica para cada patógeno, enquanto a adaptativa é generalista.', 'a imunidade adaptativa desenvolve memória imunológica, permitindo respostas mais rápidas em reinfecções.', 'a imunidade inata depende exclusivamente de anticorpos produzidos pelos linfócitos B.', 'ambas as respostas são igualmente rápidas na primeira exposição ao patógeno.', 'a imunidade adaptativa é a primeira linha de defesa e não requer exposição prévia ao antígeno.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Bioquímica',
'A fotossíntese é o processo pelo qual organismos autotróficos convertem energia luminosa em energia química. A fase clara (fotoquímica) desse processo ocorre:',
to_jsonb(ARRAY['no estroma do cloroplasto, onde o CO₂ é fixado.', 'nas cristas mitocondriais, durante a fosforilação oxidativa.', 'nos tilacoides do cloroplasto, onde a água é fotolisada.', 'no citoplasma da célula, independentemente de organelas.', 'no núcleo celular, associada à transcrição gênica.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Ecologia',
'O bioma Cerrado, segundo maior do Brasil em extensão, tem sofrido intensa degradação nas últimas décadas. Uma característica ecológica marcante desse bioma é:',
to_jsonb(ARRAY['a predominância de árvores de grande porte com dossel fechado, semelhante à Floresta Amazônica.', 'a ausência de adaptações da vegetação ao fogo, o que torna o bioma extremamente vulnerável a incêndios.', 'a presença de vegetação com raízes profundas e troncos retorcidos, adaptada a solos ácidos e ao regime de queimadas.', 'a baixa biodiversidade, com poucas espécies endêmicas de fauna e flora.', 'a localização exclusiva na região Nordeste do Brasil, em áreas de clima semiárido.']),
3, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Evolução',
'A teoria da evolução por seleção natural, proposta por Charles Darwin, baseia-se em alguns princípios fundamentais. Dentre eles, é correto afirmar que:',
to_jsonb(ARRAY['os organismos adquirem características adaptativas ao longo da vida e as transmitem aos descendentes (herança dos caracteres adquiridos).', 'a evolução ocorre de forma direcionada, sempre resultando em organismos mais complexos e superiores.', 'a variabilidade genética entre os indivíduos de uma população é a matéria-prima sobre a qual a seleção natural atua.', 'a seleção natural favorece sempre os indivíduos mais fortes, independentemente das condições ambientais.', 'as mutações ocorrem em resposta às necessidades adaptativas dos organismos em determinado ambiente.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP'),

(gen_random_uuid(), 'Biologia', 'Citologia',
'A membrana plasmática é uma estrutura fundamental para a célula. De acordo com o modelo do mosaico fluido, sua composição e organização incluem:',
to_jsonb(ARRAY['uma camada única de fosfolipídios com proteínas apenas na superfície externa.', 'uma bicamada lipídica com proteínas integrais e periféricas, conferindo fluidez e seletividade.', 'uma parede rígida de celulose que impede qualquer troca de substâncias com o meio.', 'exclusivamente proteínas transmembranares, sem a presença de lipídios.', 'uma estrutura estática e impermeável a qualquer tipo de molécula.']),
2, 'Simulado 3 Legado Militar', '2026', 'Médio', 'VUNESP');


-- ============================================================
-- PASSO 5: Criar o simulado entry
-- ============================================================
DO $$
DECLARE
  q_ids UUID[];
BEGIN
  SELECT array_agg(sub.id ORDER BY sub.rn) INTO q_ids
  FROM (
    SELECT q.id,
           row_number() OVER (
             ORDER BY array_position(
               ARRAY['História','Filosofia','Sociologia','Geografia','Português','Inglês','Matemática','Física','Química','Biologia'],
               q.subject
             ), q.created_at
           ) as rn
    FROM questions q
    WHERE q.org = 'Simulado 3 Legado Militar'
      AND q.institution = 'VUNESP'
      AND q.year = '2026'
  ) sub;

  IF array_length(q_ids, 1) = 80 THEN
    INSERT INTO simulados (id, title, description, concurso, total_time_minutes, is_published, questions)
    VALUES (
      gen_random_uuid(),
      '3° Simulado Legado - PM SP Oficial',
      'Simulado direcionado ao concurso de Oficial da PM-SP. 80 questões inéditas elaboradas com base no perfil da VUNESP.',
      'PM-SP Oficial',
      360,
      true,
      to_jsonb(q_ids)
    );
    RAISE NOTICE 'Simulado 3 criado com sucesso! 80 questões inseridas.';
  ELSE
    RAISE NOTICE 'ERRO: Encontradas % questões. Esperava 80. Verifique duplicatas.', COALESCE(array_length(q_ids, 1), 0);
  END IF;
END $$;
