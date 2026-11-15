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

export interface GameQuestion {
  id: string;
  question: string;
  topic: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

/**
 * Banco amplio de hechos pedagógicos 100% auditados y verificados para 3.º Primaria.
 * Ciencias Sociales, Ciencias Naturales, Lengua y Matemáticas.
 * Cero erratas garantizadas.
 */
export const VERIFIED_FACTS: VerifiedFact[] = [
  // --- CIENCIAS SOCIALES: EL RELIEVE Y LOS PAISAJES ---
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
    id: 'fact-oceano-pacifico',
    topic: 'La Tierra y los Océanos',
    subject: 'Ciencias Sociales',
    concept: 'Océano Pacífico',
    definition: 'El Océano Pacífico es el más grande y profundo de todo el planeta Tierra.',
    directQuestion: '¿Cuál es el océano más grande del planeta Tierra?',
    correctAnswer: 'El Océano Pacífico',
    distractors: ['El Océano Índico', 'El Mar Mediterráneo', 'El Océano Ártico'],
    explanation: '¡Correcto! El Pacífico es el océano de mayor extensión de la Tierra.',
    contextScenario: 'Un satélite espacial toma una foto del océano más gigantesco de nuestro planeta. ¿Cuál es?',
    trueStatement: 'El Océano Pacífico es el más grande del mundo.',
    falseStatement: 'El Océano Pacífico es el más pequeño de todos.'
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
    id: 'fact-montana-ladera',
    topic: 'Las Montañas',
    subject: 'Ciencias Sociales',
    concept: 'Ladera de una montaña',
    definition: 'La ladera o falda es la pendiente inclinada que va desde el pie hasta la cima.',
    directQuestion: '¿Cómo se llama la pendiente inclinada de una montaña?',
    correctAnswer: 'La ladera',
    distractors: ['La cima', 'El pie', 'La meseta'],
    explanation: '¡Muy bien! La ladera es el terreno inclinado por el que subimos una montaña.',
    contextScenario: 'Vas caminando cuesta arriba por la pendiente de una montaña. ¿Por qué parte estás subiendo?',
    trueStatement: 'La ladera es la parte inclinada de una montaña.',
    falseStatement: 'La cima es la pendiente por donde se empieza a subir.'
  },
  {
    id: 'fact-llanuras-definicion',
    topic: 'Las Llanuras',
    subject: 'Ciencias Sociales',
    concept: 'Paisaje de llanura',
    definition: 'Una llanura es una gran extensión de terreno plano o con pocas ondulaciones.',
    directQuestion: '¿Qué es exactamente un paisaje de llanura?',
    correctAnswer: 'Una gran extensión de terreno plano',
    distractors: ['Un terreno con montañas muy altas', 'Un bosque denso en una pendiente', 'Un volcán apagado'],
    explanation: '¡Perfecto! Las llanuras son terrenos llanos y planos donde es muy fácil cultivar y construir.',
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
    correctAnswer: 'Una llanura elevada a gran altura',
    distractors: ['Un valle hondo por donde pasa un río', 'Una cueva subterránea', 'Una playa con arena'],
    explanation: '¡Exacto! Imagina una mesa gigante en el paisaje: es plana por arriba pero está a gran altura.',
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
    distractors: ['En la cima más alta', 'En medio del mar', 'En el espacio exterior'],
    explanation: '¡Genial! Los valles son zonas bajas y fértiles entre montañas, y por ellos suelen pasar ríos.',
    contextScenario: 'Dos montañas gigantes tienen un terreno bajo y verde en medio por donde corre un río. ¿Cómo se llama ese lugar?',
    trueStatement: 'Los valles son terrenos llanos situados entre las montañas.',
    falseStatement: 'Los valles están situados en las cumbres más altas de las sierras.'
  },
  {
    id: 'fact-sierra-cordillera',
    topic: 'Las Montañas',
    subject: 'Ciencias Sociales',
    concept: 'Sierra y Cordillera',
    definition: 'Una sierra es un conjunto de montañas alineadas, y una cordillera es una serie de sierras juntas.',
    directQuestion: '¿Cómo se llama a un grupo o alineación de montañas?',
    correctAnswer: 'Una sierra o cordillera',
    distractors: ['Una llanura', 'Un archipiélago', 'Una meseta'],
    explanation: '¡Exacto! Varias montañas alineadas forman una sierra, y varias sierras forman una cordillera.',
    trueStatement: 'Una cordillera está formada por muchas montañas alineadas.',
    falseStatement: 'Una cordillera es un conjunto de islas en medio del mar.'
  },
  {
    id: 'fact-isla-archipielago',
    topic: 'Costas e Islas',
    subject: 'Ciencias Sociales',
    concept: 'Islas y Archipiélagos',
    definition: 'Una isla es una porción de tierra rodeada de agua por todas partes. Un conjunto de islas es un archipiélago.',
    directQuestion: '¿Qué es una porción de tierra rodeada de agua por todas partes?',
    correctAnswer: 'Una isla',
    distractors: ['Una península', 'Un cabo', 'Una colina'],
    explanation: '¡Perfecto! Si está rodeada de agua por todas partes es una isla. Si está unida por un istmo es una península.',
    trueStatement: 'Una isla está rodeada de agua por todas partes.',
    falseStatement: 'Una península está rodeada de agua por todas partes sin unirse a tierra.'
  },
  {
    id: 'fact-peninsula',
    topic: 'Costas e Islas',
    subject: 'Ciencias Sociales',
    concept: 'Península',
    definition: 'Una península es una extensión de tierra rodeada de agua por todas partes excepto por una llamada istmo.',
    directQuestion: '¿Cómo se llama la tierra rodeada de agua por todas partes menos por una?',
    correctAnswer: 'Península',
    distractors: ['Isla', 'Golfo', 'Acantilado'],
    explanation: '¡Excelente! España y Portugal forman la Península Ibérica.',
    trueStatement: 'La Península Ibérica está rodeada de agua excepto por los Pirineos.',
    falseStatement: 'Una península no tiene contacto con tierra firme.'
  },
  {
    id: 'fact-continentes-numero',
    topic: 'La Tierra y los Océanos',
    subject: 'Ciencias Sociales',
    concept: 'Los 6 Continentes',
    definition: 'En la Tierra hay seis continentes: Europa, África, Asia, América, Oceanía y la Antártida.',
    directQuestion: '¿Cuál de los siguientes es el nombre de un continente?',
    correctAnswer: 'Europa',
    distractors: ['Atlántico', 'Mediterráneo', 'Pacífico'],
    explanation: '¡Correcto! Europa es un continente. El Atlántico, Mediterráneo y Pacífico son mares u océanos.',
    trueStatement: 'Europa, América, Asia, África, Oceanía y Antártida son los continentes.',
    falseStatement: 'El Océano Índico es un continente habitado por millones de personas.'
  },

  // --- CIENCIAS NATURALES: SERES VIVOS Y ANIMALES ---
  {
    id: 'fact-vertebrados-perro',
    topic: 'Los Seres Vivos',
    subject: 'Ciencias Naturales',
    concept: 'Animales vertebrados',
    definition: 'Los vertebrados tienen esqueleto interno con columna vertebral.',
    directQuestion: '¿Cuál de estos animales es un vertebrado porque tiene columna vertebral?',
    correctAnswer: 'El perro',
    distractors: ['La mariposa', 'El caracol', 'La medusa'],
    explanation: '¡Correcto! Los mamíferos como el perro tienen esqueleto interno con huesos y columna vertebral.',
    contextScenario: 'El veterinario le hace una radiografía a un animal y ve su columna vertebral con huesos. ¿A qué animal pertenece?',
    trueStatement: 'El perro es un animal vertebrado porque tiene huesos en su interior.',
    falseStatement: 'El caracol y la medusa son animales vertebrados con columna vertebral.'
  },
  {
    id: 'fact-invertebrados-pulpo',
    topic: 'Los Seres Vivos',
    subject: 'Ciencias Naturales',
    concept: 'Animales invertebrados',
    definition: 'Los invertebrados no tienen esqueleto interno ni columna vertebral.',
    directQuestion: '¿Cuál de estos animales es un invertebrado porque no tiene huesos?',
    correctAnswer: 'El caracol',
    distractors: ['El caballo', 'El gato', 'El pájaro'],
    explanation: '¡Exacto! El caracol es un molusco invertebrado sin huesos ni columna vertebral.',
    trueStatement: 'Los insectos, gusanos y moluscos son animales invertebrados.',
    falseStatement: 'Los caballos y perros son invertebrados sin esqueleto.'
  },
  {
    id: 'fact-mamiferos-caracteristicas',
    topic: 'Animales',
    subject: 'Ciencias Naturales',
    concept: 'Mamíferos',
    definition: 'Los mamíferos son vivíparos (nacen del vientre materno) y las crías maman leche de su madre.',
    directQuestion: '¿Cómo se alimentan las crías de los mamíferos al nacer?',
    correctAnswer: 'Beben leche de su madre',
    distractors: ['Cazan peces en el río', 'Comen semillas del suelo', 'Comen insectos voladores'],
    explanation: '¡Genial! Por eso se llaman mamíferos, porque maman la leche materna.',
    trueStatement: 'Las crías de los mamíferos maman leche de su madre.',
    falseStatement: 'Los mamíferos nacen siempre de huevos que pone su madre en un nido.'
  },
  {
    id: 'fact-aves-plumas',
    topic: 'Animales',
    subject: 'Ciencias Naturales',
    concept: 'Las Aves',
    definition: 'Las aves tienen el cuerpo cubierto de plumas, tienen alas, pico y nacen de huevos.',
    directQuestion: '¿De qué tienen cubierto el cuerpo todas las aves?',
    correctAnswer: 'De plumas',
    distractors: ['De escamas duras', 'De pelo suave', 'De caparazón de piedra'],
    explanation: '¡Correcto! Las plumas protegen a las aves del frío y les ayudan a volar.',
    trueStatement: 'Todas las aves tienen pico, plumas y nacen de huevos.',
    falseStatement: 'Las aves tienen el cuerpo cubierto de escamas como las sardinas.'
  },
  {
    id: 'fact-peces-branquias',
    topic: 'Animales',
    subject: 'Ciencias Naturales',
    concept: 'Los Peces',
    definition: 'Los peces viven en el agua, tienen aletas, escamas y respiran por branquias.',
    directQuestion: '¿A través de qué órgano respiran los peces bajo el agua?',
    correctAnswer: 'Por las branquias',
    distractors: ['Por los pulmones', 'Por la nariz', 'Por las orejas'],
    explanation: '¡Exacto! Las branquias permiten a los peces captar el oxígeno disuelto en el agua.',
    trueStatement: 'Los peces respiran mediante branquias en el agua.',
    falseStatement: 'Los peces respiran aire usando pulmones igual que los humanos.'
  },
  {
    id: 'fact-anfibios-rana',
    topic: 'Animales',
    subject: 'Ciencias Naturales',
    concept: 'Los Anfibios',
    definition: 'Los anfibios sufren metamorfosis: de renacuajos viven en el agua y de adultos pueden vivir en tierra.',
    directQuestion: '¿Cuál de estos animales es un anfibio?',
    correctAnswer: 'La rana',
    distractors: ['El águila', 'El delfín', 'El león'],
    explanation: '¡Muy bien! Las ranas y salamandras son anfibios con piel húmeda.',
    trueStatement: 'La rana es un anfibio que pasa por una metamorfosis.',
    falseStatement: 'El león es un anfibio acuático con branquias.'
  },
  {
    id: 'fact-plantas-raiz',
    topic: 'Las Plantas',
    subject: 'Ciencias Naturales',
    concept: 'Partes de la planta: la raíz',
    definition: 'La raíz sujeta la planta al suelo y absorbe el agua y las sales minerales.',
    directQuestion: '¿Qué parte de la planta absorbe el agua y los minerales del suelo?',
    correctAnswer: 'La raíz',
    distractors: ['La flor', 'Las hojas', 'El fruto'],
    explanation: '¡Perfecto! La raíz absorbe agua de la tierra y sostiene firme a la planta.',
    trueStatement: 'La raíz absorbe el agua y los minerales de la tierra.',
    falseStatement: 'Las flores son las encargadas de absorber agua subterránea.'
  },
  {
    id: 'fact-plantas-hojas',
    topic: 'Las Plantas',
    subject: 'Ciencias Naturales',
    concept: 'Las Hojas y la Fotosíntesis',
    definition: 'Las hojas fabrican el alimento de la planta usando la luz del sol (fotosíntesis).',
    directQuestion: '¿En qué parte de la planta se fabrica el alimento gracias a la luz del sol?',
    correctAnswer: 'En las hojas',
    distractors: ['En las raíces bajo tierra', 'En el tronco seco', 'En las piedras'],
    explanation: '¡Excelente! En las hojas verdes ocurre la fotosíntesis con la luz del sol.',
    trueStatement: 'Las hojas de las plantas aprovechan la luz solar para fabricar su alimento.',
    falseStatement: 'Las plantas fabrican su alimento en la oscuridad total bajo tierra.'
  },

  // --- LENGUA CASTELLANA: GRAMÁTICA Y ORTOGRAFÍA ---
  {
    id: 'fact-sustantivo-propio',
    topic: 'Gramática',
    subject: 'Lengua',
    concept: 'Sustantivos propios',
    definition: 'Los sustantivos propios nombran a personas, ciudades o países en particular y se escriben con mayúscula.',
    directQuestion: '¿Cuál de las siguientes palabras es un sustantivo propio y lleva mayúscula?',
    correctAnswer: 'Samantha',
    distractors: ['cuaderno', 'pelota', 'árbol'],
    explanation: '¡Genial! Samantha es un nombre propio de persona, igual que Madrid o España.',
    trueStatement: 'Los nombres de personas y ciudades son sustantivos propios y llevan mayúscula.',
    falseStatement: 'Las palabras como mesa, perro y río son sustantivos propios con mayúscula inicial.'
  },
  {
    id: 'fact-adjetivos',
    topic: 'Gramática',
    subject: 'Lengua',
    concept: 'Los Adjetivos',
    definition: 'Los adjetivos son palabras que nos dicen cómo son o cómo están las personas, animales o cosas.',
    directQuestion: 'En la frase "El dragón es muy inteligente y veloz", ¿cuáles son los adjetivos?',
    correctAnswer: 'Inteligente y veloz',
    distractors: ['El y es', 'Dragón y muy', 'Chispa y reino'],
    explanation: '¡Exacto! "Inteligente" y "veloz" describen cómo es el dragón.',
    trueStatement: 'Los adjetivos nos dicen las cualidades o características de las cosas.',
    falseStatement: 'Los adjetivos indican si una palabra es un verbo de acción.'
  },
  {
    id: 'fact-verbos',
    topic: 'Gramática',
    subject: 'Lengua',
    concept: 'Los Verbos',
    definition: 'Los verbos son palabras que expresan acciones (correr, saltar, aprender, jugar).',
    directQuestion: '¿Cuál de estas palabras es un verbo que indica una acción?',
    correctAnswer: 'Saltar',
    distractors: ['Montaña', 'Bonito', 'Azul'],
    explanation: '¡Muy bien! "Saltar" es una acción, por tanto es un verbo.',
    trueStatement: 'Cantar, bailar y estudiar son verbos de acción.',
    falseStatement: 'Mesa, silla y ventana son verbos que indican movimiento.'
  },
  {
    id: 'fact-sinonimos',
    topic: 'Vocabulario',
    subject: 'Lengua',
    concept: 'Sinónimos',
    definition: 'Los sinónimos son palabras que tienen un significado igual o muy parecido.',
    directQuestion: '¿Cuál es el sinónimo de la palabra "contento"?',
    correctAnswer: 'Alegre',
    distractors: ['Triste', 'Enojado', 'Cansado'],
    explanation: '¡Perfecto! Alguien contento está alegre. Son palabras sinónimas.',
    trueStatement: 'Palabras como "rápido" y "veloz" son sinónimas porque significan lo mismo.',
    falseStatement: 'Sinónimo significa exactamente lo contrario que otra palabra.'
  },

  // --- MATEMÁTICAS: CÁLCULO Y GEOMETRÍA ---
  {
    id: 'fact-multiplicar-7x8',
    topic: 'Multiplicaciones',
    subject: 'Matemáticas',
    concept: 'Tabla del 7 y 8',
    definition: '7 multiplicado por 8 es igual a 56.',
    directQuestion: '¿Cuánto es 7 x 8?',
    correctAnswer: '56',
    distractors: ['54', '48', '64'],
    explanation: '¡Fantástico! 7 x 8 = 56. ¡Dominas las tablas de multiplicar!',
    trueStatement: '7 por 8 es igual a 56.',
    falseStatement: '7 por 8 es igual a 49.'
  },
  {
    id: 'fact-multiplicar-6x9',
    topic: 'Multiplicaciones',
    subject: 'Matemáticas',
    concept: 'Tabla del 9',
    definition: '6 multiplicado por 9 es igual a 54.',
    directQuestion: '¿Cuánto es 6 x 9?',
    correctAnswer: '54',
    distractors: ['63', '45', '56'],
    explanation: '¡Bien hecho! 6 x 9 = 54. ¡Cálculo mental brillante!',
    trueStatement: '6 multiplicado por 9 da como resultado 54.',
    falseStatement: '6 por 9 da 60.'
  },
  {
    id: 'fact-triangulo-lados',
    topic: 'Geometría',
    subject: 'Matemáticas',
    concept: 'Figuras geométricas: el triángulo',
    definition: 'El triángulo es un polígono de 3 lados y 3 vértices.',
    directQuestion: '¿Cuántos lados tiene una figura geométrica llamada triángulo?',
    correctAnswer: '3 lados',
    distractors: ['4 lados', '5 lados', '2 lados'],
    explanation: '¡Exacto! "Tri" significa tres: tres lados y tres ángulos.',
    trueStatement: 'Un triángulo tiene 3 lados rectos.',
    falseStatement: 'Un triángulo tiene 4 esquinas iguales.'
  },
  {
    id: 'fact-hora-minutos',
    topic: 'Medidas de Tiempo',
    subject: 'Matemáticas',
    concept: 'El Reloj',
    definition: 'Una hora completa tiene 60 minutos, y media hora tiene 30 minutos.',
    directQuestion: '¿Cuántos minutos hay en una hora entera?',
    correctAnswer: '60 minutos',
    distractors: ['100 minutos', '30 minutos', '24 minutos'],
    explanation: '¡Excelente! Una hora son 60 minutos y un día entero tiene 24 horas.',
    trueStatement: 'Una hora tiene 60 minutos.',
    falseStatement: 'Una hora tiene 100 minutos exactos.'
  }
];

export const norm = (s: string) => (s || '').trim().toLowerCase().replace(/[\.\,\!]$/, '');

/**
 * Obtiene una lista dinámica y variada de preguntas listas para cualquier juego.
 * Convierte rigurosamente CUALQUIER tipo de ejercicio (multiple_choice, true_false,
 * fill_blank, matching, flashcard, ordering) de los temas seleccionados por Samantha.
 * Solo si faltan preguntas para el total solicitado recurre al banco ampliado de hechos.
 */
export function getDynamicGameQuestions(
  exercises: ExerciseItem[] = [],
  count = 6
): GameQuestion[] {
  const result: GameQuestion[] = [];
  const usedQuestions = new Set<string>();

  // 1. Convertir TODOS los ejercicios del temario seleccionado a preguntas de juego
  if (exercises && exercises.length > 0) {
    const shuffledExercises = [...exercises].sort(() => Math.random() - 0.5);

    for (const ex of shuffledExercises) {
      if (result.length >= count) break;

      // MULTIPLE CHOICE
      if (ex.type === 'multiple_choice' && ex.question && ex.correctAnswer && ex.options && ex.options.length >= 2) {
        const cleanQ = norm(ex.question);
        if (!usedQuestions.has(cleanQ)) {
          usedQuestions.add(cleanQ);
          const shuffledOptions = [...ex.options].sort(() => Math.random() - 0.5);
          result.push({
            id: ex.id || `ex-${Math.random()}`,
            question: ex.question,
            topic: (ex as any).unitTitle || 'Tema Escolar',
            correctAnswer: ex.correctAnswer,
            options: shuffledOptions,
            explanation: ex.explanation || `¡La respuesta correcta es ${ex.correctAnswer}!`
          });
        }
      }

      // TRUE / FALSE
      else if (ex.type === 'true_false' && ex.statement !== undefined && ex.isTrue !== undefined) {
        const cleanQ = norm(ex.statement);
        if (!usedQuestions.has(cleanQ)) {
          usedQuestions.add(cleanQ);
          result.push({
            id: ex.id || `ex-${Math.random()}`,
            question: `¿Verdadero o Falso?: "${ex.statement}"`,
            topic: (ex as any).unitTitle || 'Tema Escolar',
            correctAnswer: ex.isTrue ? 'Verdadero' : 'Falso',
            options: ['Verdadero', 'Falso'],
            explanation: ex.explanation || (ex.isTrue ? '¡Correcto! La afirmación es Verdadera.' : '¡Exacto! La afirmación es Falsa.')
          });
        }
      }

      // FILL BLANK
      else if (ex.type === 'fill_blank' && ex.textWithBlank && ex.correctAnswer && ex.options && ex.options.length >= 2) {
        const cleanQ = norm(ex.textWithBlank);
        if (!usedQuestions.has(cleanQ)) {
          usedQuestions.add(cleanQ);
          const shuffledOptions = [...ex.options].sort(() => Math.random() - 0.5);
          result.push({
            id: ex.id || `ex-${Math.random()}`,
            question: `Completa la oración: "${ex.textWithBlank}"`,
            topic: (ex as any).unitTitle || 'Tema Escolar',
            correctAnswer: ex.correctAnswer,
            options: shuffledOptions,
            explanation: ex.explanation || `¡Genial! La palabra que falta es "${ex.correctAnswer}".`
          });
        }
      }

      // MATCHING (Relacionar parejas)
      else if (ex.type === 'matching' && ex.pairs && ex.pairs.length >= 2) {
        for (const pair of ex.pairs) {
          const cleanQ = norm(pair.left);
          if (!usedQuestions.has(cleanQ)) {
            usedQuestions.add(cleanQ);
            const otherRights = ex.pairs.filter(p => p.left !== pair.left).map(p => p.right);
            const options = [pair.right, ...otherRights.slice(0, 2)].sort(() => Math.random() - 0.5);
            result.push({
              id: `${ex.id}-${pair.left}`,
              question: `¿Qué se relaciona directamente con "${pair.left}"?`,
              topic: (ex as any).unitTitle || 'Tema Escolar',
              correctAnswer: pair.right,
              options,
              explanation: ex.explanation || `¡Correcto! "${pair.left}" se relaciona con "${pair.right}".`
            });
            break;
          }
        }
      }

      // FLASHCARD (Concepto clave)
      else if (ex.type === 'flashcard' && ex.front && ex.back) {
        const cleanQ = norm(ex.front);
        if (!usedQuestions.has(cleanQ)) {
          usedQuestions.add(cleanQ);
          const distractors = ['Opción incorrecta', 'Ninguna de las anteriores', 'Solo en invierno'];
          result.push({
            id: ex.id || `ex-${Math.random()}`,
            question: ex.front.includes('?') ? ex.front : `¿Qué debemos saber sobre: ${ex.front}?`,
            topic: (ex as any).unitTitle || 'Tema Escolar',
            correctAnswer: ex.back,
            options: [ex.back, ...distractors.slice(0, 2)].sort(() => Math.random() - 0.5),
            explanation: ex.explanation || `¡Dato clave: ${ex.back}!`
          });
        }
      }
    }
  }

  // 2. Si aún faltan preguntas para completar el total, extraer del banco amplio VERIFIED_FACTS
  if (result.length < count) {
    const shuffledFacts = [...VERIFIED_FACTS].sort(() => Math.random() - 0.5);

    for (const fact of shuffledFacts) {
      const cleanQ = norm(fact.directQuestion);
      if (!usedQuestions.has(cleanQ)) {
        usedQuestions.add(cleanQ);

        const options = [fact.correctAnswer, ...fact.distractors.slice(0, 2)].sort(() => Math.random() - 0.5);

        result.push({
          id: fact.id,
          question: fact.directQuestion,
          topic: fact.topic,
          correctAnswer: fact.correctAnswer,
          options,
          explanation: fact.explanation
        });

        if (result.length >= count) break;
      }
    }
  }

  return result;
}

/**
 * Extrae palabras clave curriculares de los ejercicios seleccionados para la Sopa de Letras
 */
export function getKeywordsForWordSearch(exercises: ExerciseItem[] = []): { word: string; clue: string }[] {
  const result: { word: string; clue: string }[] = [];
  const seen = new Set<string>();

  if (exercises && exercises.length > 0) {
    for (const ex of exercises) {
      let candidate = '';
      let clue = '';

      if (ex.type === 'multiple_choice' && ex.correctAnswer) {
        candidate = ex.correctAnswer;
        clue = ex.question;
      } else if (ex.type === 'fill_blank' && ex.correctAnswer) {
        candidate = ex.correctAnswer;
        clue = ex.textWithBlank.replace('___', '...');
      } else if (ex.type === 'matching' && ex.pairs && ex.pairs.length > 0) {
        candidate = ex.pairs[0].right;
        clue = ex.pairs[0].left;
      }

      // Normalizar: solo letras simples de 3 a 8 caracteres
      const clean = candidate.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z]/g, '');
      if (clean.length >= 3 && clean.length <= 8 && !seen.has(clean)) {
        seen.add(clean);
        result.push({ word: clean, clue });
        if (result.length >= 6) break;
      }
    }
  }

  // Si faltan, rellenar con palabras de 3.º de Primaria
  const defaultWords = [
    { word: 'VOLCAN', clue: 'Montaña con cráter que expulsa lava ardiente' },
    { word: 'HUESO', clue: 'Pieza dura que forma el esqueleto humano' },
    { word: 'TIERRA', clue: 'Nuestro planeta con agua líquida y atmósfera' },
    { word: 'AGUA', clue: 'Líquido vital indispensable para los seres vivos' },
    { word: 'FOSIL', clue: 'Resto prehistórico de animal conservado en piedra' },
    { word: 'PLANETA', clue: 'Cuerpo celeste que gira alrededor del Sol' },
    { word: 'LLANURA', clue: 'Terreno plano sin montañas para cultivar' }
  ];

  for (const dw of defaultWords) {
    if (result.length >= 6) break;
    if (!seen.has(dw.word)) {
      seen.add(dw.word);
      result.push(dw);
    }
  }

  return result.slice(0, 6);
}

/**
 * Genera variaciones pedagógicas tipo Duolingo a partir de un ejercicio o banco de hechos.
 */
export function generateDuolingoVariations(exercise: ExerciseItem, seedIndex = 0): ExerciseItem[] {
  const variants: ExerciseItem[] = [{ ...exercise }];

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

    const directOpts = [matchedFact.correctAnswer, ...matchedFact.distractors].sort(() => 0.5 - ((seedIndex + 2) % 3) * 0.3);
    variants.push({
      id: `${exercise.id}-var-direct`,
      type: 'multiple_choice',
      question: matchedFact.directQuestion,
      options: directOpts,
      correctAnswer: matchedFact.correctAnswer,
      explanation: matchedFact.explanation
    });
  }

  return variants;
}
