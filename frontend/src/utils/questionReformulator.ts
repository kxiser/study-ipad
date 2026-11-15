import { ExerciseItem } from '../types.js';

export interface VerifiedFact {
  id: string;
  topic: string;
  subject: string;
  concept: string;
  definition: string;
  directQuestion: string;
  correctAnswer: string;
  distractors: string[];
  explanation: string;
  contextScenario?: string;
  trueStatement: string;
  falseStatement: string;
}

/**
 * Banco de hechos pedagógicos 100% auditados y verificados para 3.º Primaria.
 * Cada hecho tiene garantizada su veracidad y respuestas correctas sin erratas.
 */
export const VERIFIED_FACTS: VerifiedFact[] = [
  {
    id: 'fact-aeropuertos',
    topic: 'Las Llanuras',
    subject: 'Ciencias Sociales',
    concept: 'Aeropuertos en llanuras',
    definition: 'Los aeropuertos se construyen en terrenos planos porque los aviones necesitan pistas largas.',
    directQuestion: '¿Dónde se suelen construir los aeropuertos?',
    correctAnswer: 'En zonas llanas',
    distractors: ['En lo alto de los cerros', 'En la cima de las montañas', 'En bosques espesos'],
    explanation: '¡Exacto! Los aviones necesitan pistas largas y planas para despegar y aterrizar con seguridad.',
    contextScenario: 'Un avión comercial busca un terreno plano para aterrizar con su pista larga. ¿Qué lugar es el ideal?',
    trueStatement: 'Los aeropuertos se construyen en zonas llanas para tener pistas largas y seguras.',
    falseStatement: 'Los aeropuertos se construyen en lo alto de los cerros porque no necesitan pistas planas.'
  },
  {
    id: 'fact-oceano-atlantico',
    topic: 'La Tierra y los Océanos',
    subject: 'Ciencias Sociales',
    concept: 'Océano Atlántico',
    definition: 'El Atlántico es un gran océano que separa América de Europa y África.',
    directQuestion: '¿Cuál de estos nombres corresponde a un océano?',
    correctAnswer: 'Atlántico',
    distractors: ['Europa', 'África', 'Asia'],
    explanation: '¡Genial! El Atlántico es un océano. Europa, África y Asia son continentes.',
    contextScenario: 'Chispa va a navegar en un barco gigante que cruza de Europa a América. ¿Qué masa de agua recorrerá?',
    trueStatement: 'El Atlántico es uno de los grandes océanos de nuestro planeta.',
    falseStatement: 'Europa y África son nombres de océanos del planeta Tierra.'
  },
  {
    id: 'fact-montana-partes',
    topic: 'Las Montañas',
    subject: 'Ciencias Sociales',
    concept: 'Partes de una montaña',
    definition: 'La parte más alta de una montaña es la cima o cumbre, y la parte más baja es el pie.',
    directQuestion: '¿Cómo se llama la parte más alta de una montaña?',
    correctAnswer: 'La cima',
    distractors: ['El pie', 'La ladera', 'El valle'],
    explanation: '¡Excelente! La cima o cumbre es el punto más alto, la ladera es la pendiente y el pie es la base.',
    contextScenario: 'Un alpinista llega al punto más alto de la montaña y clava una bandera. ¿Dónde ha llegado?',
    trueStatement: 'La cima es la parte más alta de una montaña.',
    falseStatement: 'El pie de la montaña es la parte más alta donde hay más nieve.'
  },
  {
    id: 'fact-vertebrados-perro',
    topic: 'Los Seres Vivos',
    subject: 'Ciencias Naturales',
    concept: 'Animales vertebrados',
    definition: 'Los vertebrados tienen esqueleto interno con columna vertebral.',
    directQuestion: '¿Cuál de estos animales es un vertebrado porque tiene huesos por dentro?',
    correctAnswer: 'El perro',
    distractors: ['La mariposa', 'El caracol', 'La medusa'],
    explanation: '¡Correcto! Los mamíferos como el perro tienen esqueleto interno con huesos y columna vertebral.',
    contextScenario: 'El veterinario le hace una radiografía a un animal y ve su columna vertebral con huesos. ¿A qué animal pertenece?',
    trueStatement: 'El perro es un animal vertebrado porque tiene huesos en su interior.',
    falseStatement: 'El caracol y la medusa son animales vertebrados con columna vertebral.'
  },
  {
    id: 'fact-llanuras-definicion',
    topic: 'Las Llanuras',
    subject: 'Ciencias Sociales',
    concept: 'Paisaje de llanura',
    definition: 'Una llanura es una gran extensión de terreno plano o con pocas ondulaciones.',
    directQuestion: '¿Qué es exactamente un paisaje de llanura?',
    correctAnswer: 'Una gran extensión de terreno plano',
    distractors: ['Un terreno con montañas muy altas y nieve', 'Un bosque denso en una pendiente', 'Un volcán apagado'],
    explanation: '¡Perfecto! Las llanuras son terrenos llanos y planos donde es muy fácil construir caminos y pueblos.',
    contextScenario: 'Miras a lo lejos y durante kilómetros no ves ninguna montaña, solo suelo plano y recto. ¿Qué paisaje estás viendo?',
    trueStatement: 'Una llanura es un terreno plano sin grandes elevaciones.',
    falseStatement: 'Una llanura está formada por un conjunto de montañas muy altas.'
  },
  {
    id: 'fact-meseta',
    topic: 'Las Llanuras',
    subject: 'Ciencias Sociales',
    concept: 'La Meseta',
    definition: 'Una meseta es una llanura elevada a gran altura sobre el nivel del mar.',
    directQuestion: '¿Qué es una meseta?',
    correctAnswer: 'Una llanura que está elevada a gran altura',
    distractors: ['Un valle hondo por donde pasa un río', 'Una cueva subterránea', 'Una playa con arena'],
    explanation: '¡Exacto! Imagina una mesa gigante en el paisaje: es plana por arriba pero está elevada.',
    contextScenario: 'Subes una ladera y al llegar arriba descubres un terreno completamente plano como una mesa gigante. ¿Qué es?',
    trueStatement: 'La meseta es una llanura situada a cierta altura.',
    falseStatement: 'La meseta es el punto más profundo de un valle.'
  },
  {
    id: 'fact-valle',
    topic: 'Las Montañas',
    subject: 'Ciencias Sociales',
    concept: 'Los Valles',
    definition: 'Los valles son las zonas llanas y bajas que están situadas entre las montañas.',
    directQuestion: '¿Dónde se encuentran los valles?',
    correctAnswer: 'Entre las montañas',
    distractors: ['En la cima más alta', 'En medio del mar', 'En el espacio'],
    explanation: '¡Genial! Los valles son zonas bajas y fértiles entre montañas, y por ellos suelen pasar ríos.',
    contextScenario: 'Dos montañas gigantes tienen un terreno bajo y verde en medio por donde corre un río. ¿Cómo se llama ese lugar?',
    trueStatement: 'Los valles son terrenos llanos situados entre las montañas.',
    falseStatement: 'Los valles están situados en las cumbres más altas de las sierras.'
  }
];

/**
 * Normaliza textos para comparación libre de fallos por puntuación o espacios
 */
export const norm = (s: string) => (s || '').trim().toLowerCase().replace(/[\.\,\!]$/, '');

/**
 * Genera variaciones pedagógicas tipo Duolingo a partir de un ejercicio o banco de hechos.
 * Cada variación examina el concepto desde un ángulo distinto manteniendo el 100% de exactitud pedagógica.
 */
export function generateDuolingoVariations(exercise: ExerciseItem, seedIndex = 0): ExerciseItem[] {
  const variants: ExerciseItem[] = [{ ...exercise }];

  // 1. Buscar si coincide con alguno de nuestros hechos verificados
  const matchedFact = VERIFIED_FACTS.find(f => {
    if (exercise.type === 'multiple_choice' && exercise.question) {
      return norm(exercise.question).includes(norm(f.concept)) ||
             norm(exercise.question).includes(norm(f.correctAnswer)) ||
             norm(f.directQuestion).includes(norm(exercise.question)) ||
             (exercise.question.includes('aeropuerto') && f.id === 'fact-aeropuertos') ||
             (exercise.question.includes('océano') && f.id === 'fact-oceano-atlantico') ||
             (exercise.question.includes('cima') && f.id === 'fact-montana-partes');
    }
    return false;
  });

  if (matchedFact) {
    // Variación A: Pregunta de contexto con Chispa
    if (matchedFact.contextScenario) {
      const opts = [matchedFact.correctAnswer, ...matchedFact.distractors].sort(() => 0.5 - ((seedIndex + 1) % 3) * 0.3);
      variants.push({
        id: `${exercise.id}-var-context`,
        type: 'multiple_choice',
        question: matchedFact.contextScenario,
        options: opts,
        correctAnswer: matchedFact.correctAnswer,
        explanation: matchedFact.explanation
      });
    }

    // Variación B: Pregunta Verdadero / Falso (formato Duolingo)
    const isTrueVariant = seedIndex % 2 === 0;
    variants.push({
      id: `${exercise.id}-var-tf`,
      type: 'true_false',
      statement: isTrueVariant ? matchedFact.trueStatement : matchedFact.falseStatement,
      isTrue: isTrueVariant,
      explanation: isTrueVariant
        ? '¡Verdadero! Has comprendido perfectamente la afirmación.'
        : `¡Falso! La afirmación no es correcta: ${matchedFact.explanation}`
    });

    // Variación C: Pregunta directa verificada
    const directOpts = [matchedFact.correctAnswer, ...matchedFact.distractors].sort(() => 0.5 - ((seedIndex + 2) % 3) * 0.3);
    variants.push({
      id: `${exercise.id}-var-direct`,
      type: 'multiple_choice',
      question: matchedFact.directQuestion,
      options: directOpts,
      correctAnswer: matchedFact.correctAnswer,
      explanation: matchedFact.explanation
    });
  } else if (exercise.type === 'multiple_choice' && exercise.options && exercise.correctAnswer) {
    // Si no está en el banco estático pero es de opción múltiple, podemos generar una versión V/F segura
    variants.push({
      id: `${exercise.id}-var-tf-auto`,
      type: 'true_false',
      statement: `Para la pregunta "${exercise.question}", la respuesta adecuada es "${exercise.correctAnswer}".`,
      isTrue: true,
      explanation: exercise.explanation || '¡Exacto! Esa es la afirmación verdadera.'
    });
  }

  return variants;
}
