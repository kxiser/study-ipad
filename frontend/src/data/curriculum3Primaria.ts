import { ExerciseSet, Exercise } from '../types.js';

export interface CurriculumTopic {
  id: string;
  subject: 'Lengua Castellana' | 'Matemáticas' | 'Ciencias de la Naturaleza' | 'Ciencias Sociales' | 'Natural Science' | 'Inglés';
  unitNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  color: string;
  exercises: Exercise[];
}

export const CURRICULUM_3_PRIMARIA: CurriculumTopic[] = [
  // ==========================================
  // LENGUA CASTELLANA
  // ==========================================
  {
    id: 'lengua-u1-abecedario',
    subject: 'Lengua Castellana',
    unitNumber: 1,
    title: 'El Abecedario y la Comunicación',
    subtitle: 'Orden alfabético, vocales y consonantes',
    icon: '🔤',
    color: 'from-amber-500 to-orange-500',
    description: 'Aprende a ordenar palabras en el diccionario y distinguir comunicación verbal y no verbal.',
    exercises: [
      {
        id: 'lengua-u1-1',
        type: 'multiple_choice',
        question: '¿Cuántas letras tiene el abecedario español?',
        options: ['27 letras', '24 letras', '30 letras', '22 letras'],
        correctAnswer: '27 letras',
        explanation: 'El abecedario español tiene 27 letras (5 vocales y 22 consonantes, incluyendo la ñ).'
      },
      {
        id: 'lengua-u1-2',
        type: 'multiple_choice',
        question: '¿Cuál de estas listas de palabras está correctamente ordenada por orden alfabético?',
        options: ['Barco, Delfín, Foca, León', 'Foca, Barco, León, Delfín', 'Delfín, Barco, León, Foca', 'Barco, León, Delfín, Foca'],
        correctAnswer: 'Barco, Delfín, Foca, León',
        explanation: 'Por la primera letra: B, D, F, L siguen el orden estricto del alfabeto.'
      },
      {
        id: 'lengua-u1-3',
        type: 'multiple_choice',
        question: 'Un semáforo en rojo que te indica parar es un ejemplo de comunicación...',
        options: ['No verbal (visual)', 'Verbal escrita', 'Verbal hablada', 'Comunicación acústica'],
        correctAnswer: 'No verbal (visual)',
        explanation: 'Los colores, señales y gestos son comunicación no verbal porque no utilizan palabras.'
      },
      {
        id: 'lengua-u1-4',
        type: 'fill_blank',
        textWithBlank: 'Las cinco letras que pueden sonar por sí solas sin consonante se llaman ___ .',
        options: ['vocales', 'sílabas', 'consonantes', 'diptongos'],
        correctAnswer: 'vocales',
        explanation: 'Las vocales (a, e, i, o, u) son los núcleos de las sílabas.'
      },
      {
        id: 'lengua-u1-5',
        type: 'multiple_choice',
        question: 'Si dos palabras empiezan por "ca", ¿cómo sabemos cuál va primero en el diccionario?',
        options: ['Miramos la tercera letra', 'Miramos la última letra', 'La palabra más larga va primero', 'Se colocan al azar'],
        correctAnswer: 'Miramos la tercera letra',
        explanation: 'Cuando coinciden las primeras letras, nos fijamos en la siguiente letra para ordenar.'
      }
    ]
  },
  {
    id: 'lengua-u2-acentuacion',
    subject: 'Lengua Castellana',
    unitNumber: 2,
    title: 'Agudas, Llanas y Esdrújulas',
    subtitle: 'Sílaba tónica y reglas de acentuación',
    icon: '⚡',
    color: 'from-orange-500 to-rose-500',
    description: 'Identifica la sílaba que suena más fuerte y aplica las reglas de las tildes.',
    exercises: [
      {
        id: 'lengua-u2-1',
        type: 'multiple_choice',
        question: '¿Cuál es la sílaba tónica de la palabra "teléfono"?',
        options: ['lé', 'te', 'fo', 'no'],
        correctAnswer: 'lé',
        explanation: 'En te-LÉ-fo-no, la fuerza de voz recae en "lé", la antepenúltima sílaba.'
      },
      {
        id: 'lengua-u2-2',
        type: 'multiple_choice',
        question: 'La palabra "canción" lleva tilde porque...',
        options: ['Es aguda y termina en "n"', 'Es llana y termina en vocal', 'Es esdrújula', 'Todas las palabras con "o" llevan tilde'],
        correctAnswer: 'Es aguda y termina en "n"',
        explanation: 'Las palabras agudas llevan tilde cuando terminan en vocal, en "n" o en "s".'
      },
      {
        id: 'lengua-u2-3',
        type: 'multiple_choice',
        question: '¿Cuál de las siguientes palabras es llana?',
        options: ['Árbol', 'Ratón', 'Pared', 'Brújula'],
        correctAnswer: 'Árbol',
        explanation: 'Ár-bol tiene la sílaba tónica en la penúltima posición (ár). Es llana.'
      },
      {
        id: 'lengua-u2-4',
        type: 'multiple_choice',
        question: '¿Cuál es la regla de oro de las palabras esdrújulas?',
        options: ['Siempre llevan tilde', 'Solo llevan tilde si acaban en n o s', 'Nunca llevan tilde', 'Llevan tilde si terminan en consonante'],
        correctAnswer: 'Siempre llevan tilde',
        explanation: '¡Todas las palabras esdrújulas llevan tilde siempre! (ejemplo: pájaro, música, mágico).'
      },
      {
        id: 'lengua-u2-5',
        type: 'multiple_choice',
        question: 'La palabra "balón" tiene la sílaba tónica en la última sílaba. Por tanto es...',
        options: ['Aguda', 'Llana', 'Esdrújula', 'Sobreesdrújula'],
        correctAnswer: 'Aguda',
        explanation: 'Las palabras cuya sílaba tónica es la última se llaman agudas.'
      }
    ]
  },
  {
    id: 'lengua-u3-sustantivos',
    subject: 'Lengua Castellana',
    unitNumber: 3,
    title: 'El Sustantivo y sus Clases',
    subtitle: 'Común/propio, individual/colectivo, género y número',
    icon: '🏷️',
    color: 'from-amber-600 to-yellow-600',
    description: 'Nombra personas, animales, plantas, cosas, lugares y sentimientos.',
    exercises: [
      {
        id: 'lengua-u3-1',
        type: 'multiple_choice',
        question: '¿Cuál de las siguientes palabras es un sustantivo propio?',
        options: ['Madrid', 'ciudad', 'río', 'montaña'],
        correctAnswer: 'Madrid',
        explanation: 'Madrid es un nombre propio y siempre se escribe con mayúscula inicial.'
      },
      {
        id: 'lengua-u3-2',
        type: 'multiple_choice',
        question: 'La palabra "rebaño" es un sustantivo colectivo porque...',
        options: ['Nombra en singular a un grupo de ovejas', 'Está en plural', 'Es un nombre de persona', 'Nombra a un solo animal'],
        correctAnswer: 'Nombra en singular a un grupo de ovejas',
        explanation: 'Un sustantivo colectivo nombra en singular a un conjunto de seres u objetos.'
      },
      {
        id: 'lengua-u3-3',
        type: 'multiple_choice',
        question: '¿Cuál es el género y número del sustantivo "las mochilas"?',
        options: ['Femenino plural', 'Masculino plural', 'Femenino singular', 'Masculino singular'],
        correctAnswer: 'Femenino plural',
        explanation: '"Mochilas" es femenino (lleva "las") y plural (son varias).'
      },
      {
        id: 'lengua-u3-4',
        type: 'fill_blank',
        textWithBlank: 'El sustantivo individual correspondiente al colectivo "enjambre" es ___ .',
        options: ['abeja', 'pájaro', 'lobo', 'pez'],
        correctAnswer: 'abeja',
        explanation: 'Un enjambre es un conjunto de abejas.'
      },
      {
        id: 'lengua-u3-5',
        type: 'multiple_choice',
        question: '¿Cuál es el sustantivo colectivo de un conjunto de árboles?',
        options: ['Bosque', 'Ramas', 'Hojas', 'Parque'],
        correctAnswer: 'Bosque',
        explanation: 'Un bosque es una agrupación densa de árboles.'
      }
    ]
  },
  {
    id: 'lengua-u4-adjetivos',
    subject: 'Lengua Castellana',
    unitNumber: 4,
    title: 'El Adjetivo Calificativo',
    subtitle: 'Cualidades y concordancia con el sustantivo',
    icon: '🎨',
    color: 'from-emerald-500 to-teal-600',
    description: 'Describe cómo son y cómo están las personas, animales y cosas.',
    exercises: [
      {
        id: 'lengua-u4-1',
        type: 'multiple_choice',
        question: 'En la frase "El perro juguetón corre por el parque", el adjetivo es...',
        options: ['juguetón', 'perro', 'corre', 'parque'],
        correctAnswer: 'juguetón',
        explanation: '"Juguetón" nos indica cómo es el perro, por lo que es el adjetivo calificativo.'
      },
      {
        id: 'lengua-u4-2',
        type: 'multiple_choice',
        question: 'El adjetivo debe concordar siempre con el sustantivo en...',
        options: ['Género y número', 'Número únicamente', 'Longitud de letras', 'Orden alfabético'],
        correctAnswer: 'Género y número',
        explanation: 'Si el sustantivo es femenino plural (las flores), el adjetivo también debe serlo (hermosas).'
      },
      {
        id: 'lengua-u4-3',
        type: 'multiple_choice',
        question: '¿Qué frase tiene una concordancia correcta?',
        options: ['Los coches rápidos', 'Los coches rápida', 'La coche rápidos', 'El coches rápido'],
        correctAnswer: 'Los coches rápidos',
        explanation: '"Los coches rápidos": artículo, sustantivo y adjetivo están todos en masculino plural.'
      },
      {
        id: 'lengua-u4-4',
        type: 'multiple_choice',
        question: '¿Cuál es el antónimo del adjetivo "valiente"?',
        options: ['Cobarde', 'Fuerte', 'Alegre', 'Rápido'],
        correctAnswer: 'Cobarde',
        explanation: 'Cobarde significa lo contrario de valiente.'
      }
    ]
  },
  {
    id: 'lengua-u5-ortografia',
    subject: 'Lengua Castellana',
    unitNumber: 5,
    title: 'Ortografía: Reglas de la B y la V',
    subtitle: 'Bl, Br, verbos en -aba y palabras con V',
    icon: '✍️',
    color: 'from-blue-500 to-indigo-600',
    description: 'Domina las combinaciones bl/br y las terminaciones del pasado con b.',
    exercises: [
      {
        id: 'lengua-u5-1',
        type: 'multiple_choice',
        question: 'Delante de "l" y de "r" siempre se escribe...',
        options: ['Siempre con "b" (bl, br)', 'Siempre con "v" (vl, vr)', 'A veces con b y a veces con v', 'Con la que queramos'],
        correctAnswer: 'Siempre con "b" (bl, br)',
        explanation: 'En español no existen las combinaciones "vl" ni "vr"; siempre se escribe "bl" y "br" (blanco, brazo).'
      },
      {
        id: 'lengua-u5-2',
        type: 'multiple_choice',
        question: 'Las formas verbales terminadas en -aba, -abas, -ábamos (como cantaba, jugabas) se escriben...',
        options: ['Siempre con "b"', 'Siempre con "v"', 'Con "b" o "v" según el verbo', 'Con "h" intercalada'],
        correctAnswer: 'Siempre con "b"',
        explanation: 'El pretérito imperfecto de los verbos de la 1.ª conjugación se escribe con "b": jugaba, soñaba, caminaba.'
      },
      {
        id: 'lengua-u5-3',
        type: 'fill_blank',
        textWithBlank: 'La palabra correctamente escrita es: El niño ___ a la pelota.',
        options: ['jugaba', 'jugava', 'iugaba', 'yugaba'],
        correctAnswer: 'jugaba',
        explanation: 'Jugaba proviene de jugar y termina en -aba, con "b".'
      },
      {
        id: 'lengua-u5-4',
        type: 'multiple_choice',
        question: '¿Cuál de las siguientes palabras está bien escrita?',
        options: ['Invierno', 'Inbierno', 'Imvierno', 'Ynvierno'],
        correctAnswer: 'Invierno',
        explanation: 'Delante de "v" se escribe "n" (invierno, invento). Delante de "b" y "p" se escribe "m".'
      }
    ]
  },

  // ==========================================
  // MATEMÁTICAS
  // ==========================================
  {
    id: 'mates-u1-numeracion',
    subject: 'Matemáticas',
    unitNumber: 1,
    title: 'Números de hasta 5 Cifras',
    subtitle: 'Unidades, decenas, centenas, millares y decenas de millar',
    icon: '🔢',
    color: 'from-blue-600 to-cyan-600',
    description: 'Comprende el valor de posición de cada cifra hasta el número 99.999.',
    exercises: [
      {
        id: 'mates-u1-1',
        type: 'multiple_choice',
        question: '¿Qué número está formado por: 4 DM + 5 UM + 3 C + 2 D + 8 U?',
        options: ['45.328', '45.238', '54.328', '4.538'],
        correctAnswer: '45.328',
        explanation: '4 decenas de millar (40.000) + 5 unidades de millar (5.000) + 3 centenas (300) + 2 decenas (20) + 8 = 45.328.'
      },
      {
        id: 'mates-u1-2',
        type: 'multiple_choice',
        question: 'En el número 38.492, ¿cuál es el valor de la cifra 8?',
        options: ['8.000 unidades', '80.000 unidades', '800 unidades', '80 unidades'],
        correctAnswer: '8.000 unidades',
        explanation: 'El 8 ocupa el lugar de las Unidades de Millar (UM), por lo que vale 8.000.'
      },
      {
        id: 'mates-u1-3',
        type: 'multiple_choice',
        question: '¿Cuál es el número anterior y posterior a 20.000?',
        options: ['19.999 y 20.001', '19.990 y 20.010', '19.000 y 21.000', '20.001 y 19.999'],
        correctAnswer: '19.999 y 20.001',
        explanation: 'El anterior es 20.000 - 1 = 19.999, y el posterior es 20.000 + 1 = 20.001.'
      },
      {
        id: 'mates-u1-4',
        type: 'fill_blank',
        textWithBlank: 'Una centena equivale exactamente a ___ unidades.',
        options: ['100', '10', '1.000', '50'],
        correctAnswer: '100',
        explanation: '1 Centena (C) = 10 decenas = 100 unidades.'
      },
      {
        id: 'mates-u1-5',
        type: 'multiple_choice',
        question: '¿Cuál de los siguientes números es el mayor?',
        options: ['67.890', '67.099', '66.999', '67.809'],
        correctAnswer: '67.890',
        explanation: 'Comparando de izquierda a derecha: 67.890 tiene 8 centenas y 9 decenas, mayor que las demás.'
      }
    ]
  },
  {
    id: 'mates-u2-multiplicacion',
    subject: 'Matemáticas',
    unitNumber: 2,
    title: 'Tablas de Multiplicar y Multiplicación',
    subtitle: 'Del 1 al 10, dobles, triples y conmutatividad',
    icon: '✖️',
    color: 'from-indigo-600 to-purple-600',
    description: 'Multiplica con soltura y aplica la propiedad conmutativa.',
    exercises: [
      {
        id: 'mates-u2-1',
        type: 'multiple_choice',
        question: '¿Cuánto es 7 × 8?',
        options: ['56', '54', '48', '64'],
        correctAnswer: '56',
        explanation: '7 veces 8 son 56.'
      },
      {
        id: 'mates-u2-2',
        type: 'multiple_choice',
        question: 'La propiedad que dice que 6 × 9 es igual a 9 × 6 se llama...',
        options: ['Propiedad conmutativa', 'Propiedad asociativa', 'Propiedad distributiva', 'Propiedad mágica'],
        correctAnswer: 'Propiedad conmutativa',
        explanation: 'La propiedad conmutativa indica que el orden de los factores no altera el producto (ambos dan 54).'
      },
      {
        id: 'mates-u2-3',
        type: 'multiple_choice',
        question: 'Si una caja tiene 24 lápices, ¿cuántos lápices hay en 3 cajas iguales?',
        options: ['72 lápices', '64 lápices', '76 lápices', '62 lápices'],
        correctAnswer: '72 lápices',
        explanation: '24 × 3 = 72 lápices en total.'
      },
      {
        id: 'mates-u2-4',
        type: 'fill_blank',
        textWithBlank: 'El resultado de multiplicar 9 × 7 es ___ .',
        options: ['63', '56', '72', '64'],
        correctAnswer: '63',
        explanation: '9 × 7 = 63.'
      },
      {
        id: 'mates-u2-5',
        type: 'multiple_choice',
        question: '¿Cuál es el triple del número 15?',
        options: ['45', '30', '50', '60'],
        correctAnswer: '45',
        explanation: 'El triple se calcula multiplicando por 3: 15 × 3 = 45.'
      }
    ]
  },
  {
    id: 'mates-u3-division',
    subject: 'Matemáticas',
    unitNumber: 3,
    title: 'Iniciación a la División y el Reparto',
    subtitle: 'Mitad, tercio, cuarto y divisiones exactas',
    icon: '➗',
    color: 'from-violet-600 to-fuchsia-600',
    description: 'Aprende a repartir en partes iguales y verificar la prueba de la división.',
    exercises: [
      {
        id: 'mates-u3-1',
        type: 'multiple_choice',
        question: 'Queremos repartir 36 caramelos entre 4 amigos en partes iguales. ¿Cuántos recibe cada uno?',
        options: ['9 caramelos', '8 caramelos', '7 caramelos', '12 caramelos'],
        correctAnswer: '9 caramelos',
        explanation: '36 ÷ 4 = 9, porque 9 × 4 = 36.'
      },
      {
        id: 'mates-u3-2',
        type: 'multiple_choice',
        question: 'En una división exacta, el resto siempre es...',
        options: ['0', '1', 'Mayor que el divisor', 'Igual al cociente'],
        correctAnswer: '0',
        explanation: 'Una división es exacta cuando no sobra nada; su resto es 0.'
      },
      {
        id: 'mates-u3-3',
        type: 'multiple_choice',
        question: '¿Cuál es la mitad de 48?',
        options: ['24', '22', '26', '12'],
        correctAnswer: '24',
        explanation: 'La mitad de 48 se calcula dividiendo entre 2: 48 ÷ 2 = 24.'
      },
      {
        id: 'mates-u3-4',
        type: 'multiple_choice',
        question: 'Los términos de la división son: dividendo, divisor...',
        options: ['cociente y resto', 'suma y resta', 'factores y producto', 'minuendo y sustraendo'],
        correctAnswer: 'cociente y resto',
        explanation: 'En la división: Dividendo = (Divisor × Cociente) + Resto.'
      }
    ]
  },
  {
    id: 'mates-u4-tiempo-dinero',
    subject: 'Matemáticas',
    unitNumber: 4,
    title: 'El Reloj, el Tiempo y el Dinero',
    subtitle: 'Horas, cuartos y medias, monedas y billetes de euro',
    icon: '⏰',
    color: 'from-amber-500 to-emerald-600',
    description: 'Lee la hora analógica y digital, y calcula cambios con euros y céntimos.',
    exercises: [
      {
        id: 'mates-u4-1',
        type: 'multiple_choice',
        question: '¿Cuántos minutos tiene una hora completa?',
        options: ['60 minutos', '100 minutos', '30 minutos', '24 minutos'],
        correctAnswer: '60 minutos',
        explanation: '1 hora = 60 minutos, y media hora = 30 minutos.'
      },
      {
        id: 'mates-u4-2',
        type: 'multiple_choice',
        question: 'En un reloj de agujas, si la aguja grande (minutero) apunta al 6, son...',
        options: ['Y media', 'En punto', 'Y cuarto', 'Menos cuarto'],
        correctAnswer: 'Y media',
        explanation: 'El 6 representa la mitad de la esfera (30 minutos), es decir, "y media".'
      },
      {
        id: 'mates-u4-3',
        type: 'multiple_choice',
        question: '¿Cuántas monedas de 50 céntimos necesitamos para tener 2 euros?',
        options: ['4 monedas', '2 monedas', '5 monedas', '10 monedas'],
        correctAnswer: '4 monedas',
        explanation: '50 céntimos × 4 = 200 céntimos = 2 euros.'
      },
      {
        id: 'mates-u4-4',
        type: 'multiple_choice',
        question: 'Compramos un libro de 12 € y pagamos con un billete de 20 €. ¿Cuánto nos devuelven?',
        options: ['8 €', '6 €', '10 €', '7 €'],
        correctAnswer: '8 €',
        explanation: '20 € - 12 € = 8 € de cambio.'
      }
    ]
  },

  // ==========================================
  // CIENCIAS DE LA NATURALEZA
  // ==========================================
  {
    id: 'nat-u1-vertebrados',
    subject: 'Ciencias de la Naturaleza',
    unitNumber: 1,
    title: 'Los Animales Vertebrados',
    subtitle: 'Mamíferos, aves, reptiles, anfibios y peces',
    icon: '🦁',
    color: 'from-emerald-600 to-green-600',
    description: 'Descubre los 5 grupos de animales con columna vertebral y esqueleto interno.',
    exercises: [
      {
        id: 'nat-u1-1',
        type: 'multiple_choice',
        question: '¿Cuál es la principal característica que define a todos los vertebrados?',
        options: ['Tienen columna vertebral y esqueleto interno', 'Todos vuelan', 'Ponen huevos en la tierra', 'Tienen concha protectora'],
        correctAnswer: 'Tienen columna vertebral y esqueleto interno',
        explanation: 'Los vertebrados se caracterizan por poseer un esqueleto interno articulado con columna vertebral.'
      },
      {
        id: 'nat-u1-2',
        type: 'multiple_choice',
        question: 'Los mamíferos se diferencian de otros vertebrados porque...',
        options: ['Nacen del vientre de la madre y maman leche', 'Tienen plumas y pico', 'Respiran siempre por branquias', 'Son todos ovíparos'],
        correctAnswer: 'Nacen del vientre de la madre y maman leche',
        explanation: 'Los mamíferos son vivíparos y las crías se alimentan de la leche de sus madres.'
      },
      {
        id: 'nat-u1-3',
        type: 'multiple_choice',
        question: '¿Qué tipo de respiración tienen los peces bajo el agua?',
        options: ['Por branquias', 'Por pulmones', 'Por la piel únicamente', 'Por la boca'],
        correctAnswer: 'Por branquias',
        explanation: 'Las branquias permiten a los peces captar el oxígeno disuelto en el agua.'
      },
      {
        id: 'nat-u1-4',
        type: 'multiple_choice',
        question: 'Los anfibios (como la rana) sufren una gran transformación al crecer llamada...',
        options: ['Metamorfosis', 'Fotosíntesis', 'Fecundación', 'Hibernación'],
        correctAnswer: 'Metamorfosis',
        explanation: 'La metamorfosis transforma al renacuajo acuático en una rana adulta.'
      },
      {
        id: 'nat-u1-5',
        type: 'multiple_choice',
        question: '¿Cuál de estos animales es un mamífero marino?',
        options: ['El delfín', 'El tiburón', 'La trucha', 'El pulpo'],
        correctAnswer: 'El delfín',
        explanation: 'El delfín es un mamífero: respira por pulmones a través del espiráculo y sus crías maman.'
      }
    ]
  },
  {
    id: 'nat-u2-invertebrados',
    subject: 'Ciencias de la Naturaleza',
    unitNumber: 2,
    title: 'Los Animales Invertebrados',
    subtitle: 'Artrópodos, moluscos y gusanos',
    icon: '🦋',
    color: 'from-teal-600 to-cyan-700',
    description: 'Animales sin esqueleto interno: insectos, arácnidos, crustáceos y moluscos.',
    exercises: [
      {
        id: 'nat-u2-1',
        type: 'multiple_choice',
        question: '¿Cuántas patas tienen los insectos adultos?',
        options: ['6 patas', '8 patas', '10 patas', '4 patas'],
        correctAnswer: '6 patas',
        explanation: 'Todos los insectos tienen el cuerpo dividido en cabeza, tórax y abdomen, y tienen 6 patas.'
      },
      {
        id: 'nat-u2-2',
        type: 'multiple_choice',
        question: '¿A qué grupo pertenecen las arañas y escorpiones?',
        options: ['Arácnidos (tienen 8 patas)', 'Insectos (tienen 6 patas)', 'Moluscos', 'Crustáceos'],
        correctAnswer: 'Arácnidos (tienen 8 patas)',
        explanation: 'Los arácnidos tienen 8 patas y no tienen antenas.'
      },
      {
        id: 'nat-u2-3',
        type: 'multiple_choice',
        question: 'El caracol y el mejillón pertenecen al grupo de los...',
        options: ['Moluscos (cuerpo blando)', 'Insectos', 'Reptiles', 'Artrópodos marinos'],
        correctAnswer: 'Moluscos (cuerpo blando)',
        explanation: 'Los moluscos tienen el cuerpo blando, y muchos de ellos se protegen con una concha calcárea.'
      },
      {
        id: 'nat-u2-4',
        type: 'multiple_choice',
        question: '¿Cómo nacen la inmensa mayoría de los animales invertebrados?',
        options: ['De huevos (ovíparos)', 'Del vientre materno (vivíparos)', 'Por semillas', 'De la tierra'],
        correctAnswer: 'De huevos (ovíparos)',
        explanation: 'Prácticamente todos los invertebrados son ovíparos.'
      }
    ]
  },
  {
    id: 'nat-u3-plantas',
    subject: 'Ciencias de la Naturaleza',
    unitNumber: 3,
    title: 'El Reino de las Plantas',
    subtitle: 'Raíz, tallo, hojas y fotosíntesis',
    icon: '🌿',
    color: 'from-green-600 to-emerald-700',
    description: 'Cómo fabrican su propio alimento y el papel vital que tienen en el planeta.',
    exercises: [
      {
        id: 'nat-u3-1',
        type: 'multiple_choice',
        question: '¿Por qué parte absorbe la planta el agua y las sales minerales del suelo?',
        options: ['Por la raíz', 'Por las hojas', 'Por las flores', 'Por el fruto'],
        correctAnswer: 'Por la raíz',
        explanation: 'La raíz fija la planta al suelo y absorbe agua y nutrientes formando la savia bruta.'
      },
      {
        id: 'nat-u3-2',
        type: 'multiple_choice',
        question: 'El proceso por el cual las plantas fabrican su propio alimento con la luz solar se llama...',
        options: ['Fotosíntesis', 'Respiración celular', 'Germinación', 'Polinización'],
        correctAnswer: 'Fotosíntesis',
        explanation: 'En las hojas, la clorofila capta la luz del sol para realizar la fotosíntesis.'
      },
      {
        id: 'nat-u3-3',
        type: 'multiple_choice',
        question: 'Durante la fotosíntesis, ¿qué gas fundamental para los seres vivos expulsan las plantas?',
        options: ['Oxígeno', 'Dióxido de carbono', 'Nitrógeno', 'Humo'],
        correctAnswer: 'Oxígeno',
        explanation: 'Las plantas absorben dióxido de carbono y liberan oxígeno limpio al aire.'
      },
      {
        id: 'nat-u3-4',
        type: 'multiple_choice',
        question: 'Las plantas con tallo leñoso duro y ramas que nacen desde el suelo se denominan...',
        options: ['Arbustos', 'Árboles', 'Hierbas', 'Musgos'],
        correctAnswer: 'Arbustos',
        explanation: 'Los arbustos tienen tronco leñoso corto ramificado desde la base (a diferencia de los árboles).'
      }
    ]
  },

  // ==========================================
  // CIENCIAS SOCIALES
  // ==========================================
  {
    id: 'soc-u1-sistema-solar',
    subject: 'Ciencias Sociales',
    unitNumber: 1,
    title: 'El Universo y el Sistema Solar',
    subtitle: 'El Sol, los planetas, la Tierra y la Luna',
    icon: '🪐',
    color: 'from-purple-600 to-indigo-700',
    description: 'Los movimientos de rotación y traslación, el día y la noche, y las estaciones.',
    exercises: [
      {
        id: 'soc-u1-1',
        type: 'multiple_choice',
        question: 'El movimiento de la Tierra sobre su propio eje que da lugar al día y la noche se llama...',
        options: ['Rotación', 'Traslación', 'Orbitación', 'Eclipsación'],
        correctAnswer: 'Rotación',
        explanation: 'La Tierra tarda 24 horas en dar una vuelta completa sobre sí misma (rotación).'
      },
      {
        id: 'soc-u1-2',
        type: 'multiple_choice',
        question: 'El movimiento de la Tierra alrededor del Sol dura 365 días y da lugar a...',
        options: ['Las cuatro estaciones del año', 'El día y la noche', 'Las fases de la Luna', 'Los eclipses solares'],
        correctAnswer: 'Las cuatro estaciones del año',
        explanation: 'La traslación dura un año solar y genera la primavera, verano, otoño e invierno.'
      },
      {
        id: 'soc-u1-3',
        type: 'multiple_choice',
        question: '¿Cuál es el planeta más cercano al Sol en el Sistema Solar?',
        options: ['Mercurio', 'Venus', 'La Tierra', 'Marte'],
        correctAnswer: 'Mercurio',
        explanation: 'Mercurio es el planeta más próximo al Sol y el más pequeño de los ocho.'
      },
      {
        id: 'soc-u1-4',
        type: 'multiple_choice',
        question: 'La Luna es el único ___ natural del planeta Tierra.',
        options: ['satélite', 'planeta', 'cometa', 'asteroide'],
        correctAnswer: 'satélite',
        explanation: 'La Luna gira alrededor de la Tierra, por lo que es nuestro satélite natural.'
      },
      {
        id: 'soc-u1-5',
        type: 'multiple_choice',
        question: '¿Cuántos planetas forman actualmente el Sistema Solar?',
        options: ['8 planetas', '9 planetas', '7 planetas', '10 planetas'],
        correctAnswer: '8 planetas',
        explanation: 'Son 8 planetas: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno.'
      }
    ]
  },
  {
    id: 'soc-u2-relieve-rios',
    subject: 'Ciencias Sociales',
    unitNumber: 2,
    title: 'El Relieve y los Paisajes de España',
    subtitle: 'Montañas, mesetas, costas y ríos',
    icon: '⛰️',
    color: 'from-amber-600 to-emerald-700',
    description: 'Conoce la geografía de España: la Meseta Central, cordilleras y vertientes fluviales.',
    exercises: [
      {
        id: 'soc-u2-1',
        type: 'multiple_choice',
        question: 'La gran llanura elevada que ocupa el centro de la península ibérica se llama...',
        options: ['Meseta Central', 'Depresión del Ebro', 'Pirineos', 'Sierra Morena'],
        correctAnswer: 'Meseta Central',
        explanation: 'La Meseta Central es la unidad principal del relieve español, dividida por el Sistema Central.'
      },
      {
        id: 'soc-u2-2',
        type: 'multiple_choice',
        question: '¿Cuál es la cordillera montañosa que hace frontera natural entre España y Francia?',
        options: ['Los Pirineos', 'Los Picos de Europa', 'Sierra Nevada', 'El Sistema Ibérico'],
        correctAnswer: 'Los Pirineos',
        explanation: 'Los Pirineos separan la península ibérica del resto de Europa.'
      },
      {
        id: 'soc-u2-3',
        type: 'multiple_choice',
        question: '¿En qué océano desembocan los ríos Duero, Tajo y Guadiana?',
        options: ['Océano Atlántico', 'Mar Cantábrico', 'Mar Mediterráneo', 'Océano Índico'],
        correctAnswer: 'Océano Atlántico',
        explanation: 'Pertenecen a la vertiente atlántica: son ríos largos que nacen en las sierras y desembocan en el Atlántico.'
      },
      {
        id: 'soc-u2-4',
        type: 'multiple_choice',
        question: 'El río más caudaloso de la vertiente mediterránea de España es el...',
        options: ['Río Ebro', 'Río Tajo', 'Río Guadalquivir', 'Río Miño'],
        correctAnswer: 'Río Ebro',
        explanation: 'El río Ebro nace en Fontibre (Cantabria) y desemboca en el mar Mediterráneo.'
      },
      {
        id: 'soc-u2-5',
        type: 'multiple_choice',
        question: 'El pico más alto de toda España se encuentra en las Islas Canarias y se llama...',
        options: ['El Teide (Tenerife)', 'El Mulhacén (Granada)', 'El Aneto (Huesca)', 'Pico de Peñalara (Madrid)'],
        correctAnswer: 'El Teide (Tenerife)',
        explanation: 'El volcán Teide, en Tenerife, mide 3.715 metros y es la cumbre más alta de España.'
      }
    ]
  },
  {
    id: 'soc-u3-municipio',
    subject: 'Ciencias Sociales',
    unitNumber: 3,
    title: 'La Localidad y el Ayuntamiento',
    subtitle: 'El alcalde, los concejales y los servicios municipales',
    icon: '🏛️',
    color: 'from-blue-600 to-indigo-700',
    description: 'Organización de los pueblos y ciudades, normas ciudadanas y servicios para todos.',
    exercises: [
      {
        id: 'soc-u3-1',
        type: 'multiple_choice',
        question: '¿Quién es la máxima autoridad del gobierno de un municipio?',
        options: ['El alcalde o alcaldesa', 'El presidente de la comunidad', 'El comisario de policía', 'El director del colegio'],
        correctAnswer: 'El alcalde o alcaldesa',
        explanation: 'El alcalde o alcaldesa dirige el ayuntamiento con la ayuda de los concejales.'
      },
      {
        id: 'soc-u3-2',
        type: 'multiple_choice',
        question: '¿Cuál de los siguientes es un servicio municipal que gestiona el ayuntamiento?',
        options: ['Limpieza de calles y recogida de basuras', 'Fabricación de teléfonos móviles', 'Venta de videojuegos', 'Vuelos de avión'],
        correctAnswer: 'Limpieza de calles y recogida de basuras',
        explanation: 'La recogida de basuras, alumbrado, parques y policía local son servicios públicos municipales.'
      },
      {
        id: 'soc-u3-3',
        type: 'multiple_choice',
        question: 'Los ciudadanos mayores de edad eligen a los concejales del ayuntamiento mediante...',
        options: ['Elecciones municipales (votación)', 'Un concurso de televisión', 'Un sorteo de lotería', 'Pruebas deportivas'],
        correctAnswer: 'Elecciones municipales (votación)',
        explanation: 'Cada cuatro años se celebran elecciones democráticas donde los vecinos votan.'
      }
    ]
  },

  // ==========================================
  // NATURAL SCIENCE & ENGLISH (BILINGUAL 3.º PRIMARIA)
  // ==========================================
  {
    id: 'science-u1-living-things',
    subject: 'Natural Science',
    unitNumber: 1,
    title: 'Living Things & Animals (Natural Science)',
    subtitle: 'Vertebrates, Mammals, Birds and Reptiles in English',
    icon: '🦁',
    color: 'from-teal-500 to-emerald-600',
    description: 'Explore the animal kingdom in English: learn how vertebrates are classified and how mammals, birds, and fish live.',
    exercises: [
      {
        id: 'sci-u1-1',
        type: 'multiple_choice',
        question: 'Which of the following animals is a VERTEBRATE because it has a backbone?',
        options: ['A dog', 'An octopus', 'A butterfly', 'A snail'],
        correctAnswer: 'A dog',
        explanation: 'Excellent! Dogs, humans, birds, and cats are vertebrates with an internal skeleton.'
      },
      {
        id: 'sci-u1-2',
        type: 'true_false',
        statement: 'Mammals are warm-blooded vertebrates and mothers feed their babies with milk.',
        isTrue: true,
        explanation: 'Spot on! Mammals (like cows, whales, and dogs) give birth to live babies and produce milk.'
      },
      {
        id: 'sci-u1-3',
        type: 'fill_blank',
        textWithBlank: 'Fish live in water and breathe dissolved oxygen through their ___ .',
        options: ['gills', 'lungs', 'scales', 'wings'],
        correctAnswer: 'gills',
        explanation: 'Great science fact! Fish use gills (branquias) to extract oxygen underwater.'
      },
      {
        id: 'sci-u1-4',
        type: 'matching',
        instruction: 'Match each animal to its vertebrate group in English:',
        pairs: [
          { left: 'Dolphin', right: 'Mammal' },
          { left: 'Golden Eagle', right: 'Bird' },
          { left: 'Chameleon', right: 'Reptile' },
          { left: 'Tree Frog', right: 'Amphibian' }
        ],
        explanation: 'Brilliant work! All animal groups matched accurately.'
      },
      {
        id: 'sci-u1-5',
        type: 'flashcard',
        front: 'What are the 3 vital functions that all living things perform?',
        back: 'Nutrition (feeding), Interaction (sensing the environment), and Reproduction (having babies).',
        tip: 'Remember NIR: Nutrition, Interaction, Reproduction!',
        explanation: 'Core 3rd Grade Natural Science concept mastered in English!'
      }
    ]
  },
  {
    id: 'science-u2-plants-kingdom',
    subject: 'Natural Science',
    unitNumber: 2,
    title: 'The Plant Kingdom & Photosynthesis (Natural Science)',
    subtitle: 'Roots, stems, leaves, flowers and seeds in English',
    icon: '🌱',
    color: 'from-emerald-500 to-teal-600',
    description: 'Discover how green plants make their own food using sunlight, water, and air in bilingual Science.',
    exercises: [
      {
        id: 'sci-u2-1',
        type: 'multiple_choice',
        question: 'Which part of the plant absorbs water and minerals from the soil?',
        options: ['The roots', 'The petals', 'The leaves', 'The fruit'],
        correctAnswer: 'The roots',
        explanation: 'Correct! The roots anchor the plant and drink water and nutrients from the soil.'
      },
      {
        id: 'sci-u2-2',
        type: 'multiple_choice',
        question: 'What is the name of the process green plants use to make their food using sunlight?',
        options: ['Photosynthesis', 'Respiration', 'Germination', 'Evaporation'],
        correctAnswer: 'Photosynthesis',
        explanation: 'Awesome! Photosynthesis combines sunlight, carbon dioxide, and water to make plant food.'
      },
      {
        id: 'sci-u2-3',
        type: 'true_false',
        statement: 'Deciduous trees lose all their leaves in autumn and grow new ones in spring.',
        isTrue: true,
        explanation: 'True! Deciduous trees (árboles de hoja caduca) lose their leaves before winter.'
      },
      {
        id: 'sci-u2-4',
        type: 'ordering',
        instruction: 'Order the life cycle of a flowering plant in chronological steps:',
        items: [
          '1. A seed is planted in the soil',
          '2. The seed germinates and grows roots',
          '3. Stems and green leaves grow towards the sun',
          '4. Flowers bloom and produce new seeds'
        ],
        explanation: 'Superb! You correctly sequenced the complete plant life cycle.'
      },
      {
        id: 'sci-u2-5',
        type: 'flashcard',
        front: 'What green pigment inside leaves captures sunlight for photosynthesis?',
        back: 'Chlorophyll (Clorofila). It gives leaves their green color and traps sunlight energy.',
        tip: 'Chloro = green in ancient Greek!',
        explanation: 'Key Science vocabulary locked in!'
      }
    ]
  }
];

export function getCurriculumTopicsBySubject(subject: string): CurriculumTopic[] {
  if (subject === 'all') return CURRICULUM_3_PRIMARIA;
  return CURRICULUM_3_PRIMARIA.filter(t => t.subject === subject);
}

export function getCurriculumTopicById(id: string): CurriculumTopic | undefined {
  return CURRICULUM_3_PRIMARIA.find(t => t.id === id);
}

export function convertTopicToExerciseSet(topic: CurriculumTopic): ExerciseSet {
  return {
    title: topic.title,
    subject: topic.subject,
    summary: topic.description,
    estimatedMinutes: 10,
    exercises: topic.exercises as any
  };
}
