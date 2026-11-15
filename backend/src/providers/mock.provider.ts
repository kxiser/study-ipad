import { AIProvider, ImageData, TopicPromptOptions } from './types.js';
import { ExerciseSet } from '../schemas/exercise.schema.js';

export class MockProvider implements AIProvider {
  readonly name = 'Modo Demo / Ejemplo (Gratis, Sin Clave)';

  async generateExercisesFromImages(images: ImageData[], subjectHint?: string): Promise<ExerciseSet> {
    // Simulamos un breve retardo de procesamiento de 1 segundo
    await new Promise(r => setTimeout(r, 900));

    const samples: ExerciseSet[] = [
      {
        title: 'Los Animales Vertebrados e Invertebrados',
        subject: 'Ciencias Naturales',
        summary: 'Descubre los dos grandes grupos de animales según tengan esqueleto interno o no.',
        estimatedMinutes: 6,
        exercises: [
          {
            id: 'mock-1',
            type: 'multiple_choice',
            question: '¿Cuál de estos animales es un VERTEBRADO porque tiene columna vertebral?',
            options: ['El perro', 'La mariposa', 'El caracol', 'La medusa'],
            correctAnswer: 'El perro',
            explanation: '¡Genial! Los perros, los gatos, las aves y nosotros somos vertebrados.',
            hint: 'Piensa en un animal que tenga huesos por dentro.'
          },
          {
            id: 'mock-2',
            type: 'true_false',
            statement: 'Los animales invertebrados NO tienen esqueleto interno con huesos.',
            isTrue: true,
            explanation: '¡Exacto! Los invertebrados como las hormigas o lombrices no tienen huesos.',
            hint: 'El prefijo "in-" significa "sin".'
          },
          {
            id: 'mock-3',
            type: 'fill_blank',
            textWithBlank: 'Los peces respiran el oxígeno del agua a través de sus ___ .',
            options: ['branquias', 'pulmones', 'alas'],
            correctAnswer: 'branquias',
            explanation: '¡Fantástico! Las branquias les permiten respirar bajo el agua.',
            hint: 'Están a los lados de su cabeza.'
          },
          {
            id: 'mock-4',
            type: 'ordering',
            instruction: 'Ordena la metamorfosis de una mariposa de principio a fin:',
            items: [
              'Huevo pequeño en una hoja',
              'Oruga glotona comiendo hojas',
              'Crisálida o capullo dormido',
              'Mariposa con hermosas alas'
            ],
            explanation: '¡Maravilloso! Es una de las transformaciones más mágicas de la naturaleza.',
            hint: 'Todo comienza con un huevecillo.'
          },
          {
            id: 'mock-5',
            type: 'matching',
            instruction: 'Une cada grupo de vertebrados con su característica principal:',
            pairs: [
              { left: 'Mamíferos', right: 'Toman leche materna al nacer' },
              { left: 'Aves', right: 'Tienen plumas y ponen huevos' },
              { left: 'Peces', right: 'Tienen escamas y viven en el agua' }
            ],
            explanation: '¡Increíble memoria! Has emparejado cada grupo a la perfección.',
            hint: 'Fíjate en cómo nacen o qué cubre su cuerpo.'
          },
          {
            id: 'mock-6',
            type: 'flashcard',
            front: '¿Cuál es el mamífero más grande de todo el planeta Tierra?',
            back: '¡La ballena azul! Aunque vive en el océano, es un mamífero y respira aire con sus pulmones.',
            tip: '¡Es más larga que tres autobuses juntos!',
            explanation: '¡Super dato curioso guardado en tu memoria!'
          }
        ]
      },
      {
        title: 'Misterios del Sistema Solar',
        subject: 'Ciencias Sociales',
        summary: 'Viaja por el espacio y aprende los planetas vecinos a nuestra Tierra.',
        estimatedMinutes: 5,
        exercises: [
          {
            id: 'solar-1',
            type: 'multiple_choice',
            question: '¿Qué planeta es conocido como el "Planeta Rojo"?',
            options: ['Marte', 'Júpiter', 'Venus', 'Saturno'],
            correctAnswer: 'Marte',
            explanation: '¡Correcto! Su suelo tiene mucho hierro oxidado que le da ese color rojizo.',
            hint: 'Es el cuarto planeta desde el Sol.'
          },
          {
            id: 'solar-2',
            type: 'true_false',
            statement: 'El Sol es un planeta gigante hecho de roca sólida.',
            isTrue: false,
            explanation: '¡Muy bien! El Sol no es un planeta, es una inmensa estrella de gas caliente.',
            hint: 'Brilla con luz propia como las estrellas en la noche.'
          },
          {
            id: 'solar-3',
            type: 'fill_blank',
            textWithBlank: 'El planeta con los anillos más brillantes y famosos es ___ .',
            options: ['Saturno', 'Mercurio', 'Neptuno'],
            correctAnswer: 'Saturno',
            explanation: '¡Excelente! Los anillos de Saturno están hechos de trozos de hielo y roca.',
            hint: 'Tiene un nombre que empieza por la letra S.'
          },
          {
            id: 'solar-4',
            type: 'matching',
            instruction: 'Une cada planeta con su lugar en el espacio:',
            pairs: [
              { left: 'Mercurio', right: 'El más cercano al Sol' },
              { left: 'Tierra', right: 'Nuestro hogar con agua líquida' },
              { left: 'Júpiter', right: 'El planeta más grande de todos' }
            ],
            explanation: '¡Brillante astrónoma!',
            hint: 'Recuerda el orden de los planetas.'
          }
        ]
      }
    ];

    // Si hay subjectHint o aleatorio
    const selected = (subjectHint && subjectHint.toLowerCase().includes('solar'))
      ? samples[1]
      : samples[0];

    return {
      ...selected,
      exercises: selected.exercises.map(e => ({
        ...e,
        id: `${e.id}-${Date.now().toString().slice(-4)}`
      }))
    };
  }

  async generateExercisesFromTopic(options: TopicPromptOptions): Promise<ExerciseSet> {
    await new Promise(r => setTimeout(r, 600));
    const topic = options.topic || 'El Sistema Solar';
    const age = options.ageYears || 8;

    return {
      title: `${topic} (Nivel ${age} años)`,
      subject: (options.subjectHint as any) || 'Ciencias Naturales',
      summary: `Aprende y descubre los secretos más asombrosos sobre ${topic}.`,
      estimatedMinutes: 7,
      exercises: [
        {
          id: `enc-${Date.now()}-1`,
          type: 'multiple_choice',
          question: `¿Qué es lo más característico e importante que debemos saber sobre ${topic}?`,
          options: [
            'Es un tema fascinante que forma parte de la naturaleza o la historia',
            'No existe en la vida real',
            'Solo ocurre de noche',
            'Es completamente invisible y no se puede estudiar'
          ],
          correctAnswer: 'Es un tema fascinante que forma parte de la naturaleza o la historia',
          explanation: `¡Fantástico! ${topic} es un concepto clave en primaria.`,
          hint: 'Piensa en lo que nos enseña la enciclopedia infantil.'
        },
        {
          id: `enc-${Date.now()}-2`,
          type: 'true_false',
          statement: `Aprender sobre ${topic} nos ayuda a comprender mejor el mundo que nos rodea.`,
          isTrue: true,
          explanation: '¡Exacto! El conocimiento y la curiosidad son los mejores superpoderes.',
          hint: 'Siempre es genial aprender cosas nuevas.'
        },
        {
          id: `enc-${Date.now()}-3`,
          type: 'fill_blank',
          textWithBlank: `Cuando investigamos sobre ${topic}, descubrimos datos muy ___ .`,
          options: ['asombrosos', 'aburridos', 'imposibles', 'dañinos'],
          correctAnswer: 'asombrosos',
          explanation: '¡Genial! Hay miles de curiosidades por explorar.',
          hint: 'Una palabra positiva sobre descubrir el mundo.'
        },
        {
          id: `enc-${Date.now()}-4`,
          type: 'flashcard',
          front: `Concepto clave: ${topic}`,
          back: `¡Muy bien recordado! El tema "${topic}" nos enseña cómo funciona la naturaleza y el universo.`,
          explanation: `¡Dato clave sobre ${topic} aprendido y guardado en tu memoria!`
        }
      ]
    };
  }
}
