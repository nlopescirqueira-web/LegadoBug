export interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  topic: string;
  subtopic: string;
  year: number;
  institution: string;
  org?: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  explanation: string;
  isUnpublished?: boolean;
  videoUrl?: string;
  video_url?: string;
}

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'solon-grecia-001',
    text: 'Analise o trecho do poema de Sólon, governante ateniense em 594 a.C., citado por Aristóteles na obra Constituição de Atenas: \n“A muitos, Atenas, pátria de origem divina, reconduzi, vendidos de forma injusta [...] e outros, que aqui mesmo viviam submetidos à escravidão por causa das vontades e abusos dos senhores, tornei livres.”\nNo contexto da Grécia Antiga, as reformas promovidas por Sólon tinham como objetivo diminuir os conflitos sociais existentes na pólis ateniense e ficaram conhecidas, principalmente, por:',
    options: [
      'extinguir a tirania como forma de governo.',
      'permitir que cidadãos prejudicados solicitassem reparações.',
      'punir indivíduos que conspirassem contra a democracia.',
      'acabar com a escravidão por dívidas.',
      'criar a Bulé como conselho deliberativo.'
    ],
    correctAnswer: 3,
    subject: 'HISTÓRIA',
    topic: 'GRÉCIA ANTIGA',
    subtopic: 'Reformas de Sólon',
    year: 2024,
    institution: 'Simulado',
    difficulty: 'Médio',
    explanation: 'Sólon foi um importante legislador ateniense cujas reformas visavam pacificar a pólis. Sua medida mais célebre foi a seisachtheia (o "sacudir de fardos"), que extinguiu a escravidão por dívidas em Atenas, libertando aqueles que haviam se tornado escravos por não conseguirem pagar seus débitos e proibindo que a pessoa física fosse usada como garantia de empréstimo.',
    video_url: 'https://youtu.be/bsO3NCAoQkM'
  }
];
