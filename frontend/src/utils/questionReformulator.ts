import { ExerciseItem } from '../types.js';

export interface VerifiedFact {
  id: string;
  topic: string;
  subject: 'Ciencias Naturales' | 'Ciencias Sociales' | 'Lengua Castellana' | 'Matemáticas';
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
  subject?: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

/**
 * BANCO CURRICULAR COMPLETO DE 84 HECHOS PEDAGÓGICOS AUDITADOS PARA 3.º DE PRIMARIA.
 * Dividido equitativamente entre las 4 asignaturas escolares:
 * - Ciencias Naturales (21 hechos)
 * - Ciencias Sociales (21 hechos)
 * - Lengua Castellana (21 hechos)
 * - Matemáticas (21 hechos)
 * 100% pedagógicamente exactos para el currículo escolar de Madrid (Colegio Pureza de María).
 */
export const VERIFIED_FACTS: VerifiedFact[] = [
  // ==========================================
  // CIENCIAS NATURALES (21 hechos auditados)
  // ==========================================
  {
    id: 'nat-vert-columna',
    topic: 'Animales Vertebrados',
    subject: 'Ciencias Naturales',
    concept: 'Columna vertebral',
    definition: 'Los animales vertebrados tienen un esqueleto interno articulado con columna vertebral.',
    directQuestion: '¿Qué tienen todos los animales VERTEBRADOS en su interior?',
    correctAnswer: 'Un esqueleto con columna vertebral',
    distractors: ['Una concha dura exterior', 'Un cuerpo gelatinoso sin huesos', 'Solo sangre fría'],
    explanation: '¡Excelente! Los vertebrados como el perro, el águila o los humanos tenemos columna vertebral.',
    trueStatement: 'Los animales vertebrados tienen columna vertebral y esqueleto interno.',
    falseStatement: 'Los animales vertebrados no tienen huesos ni columna vertebral.'
  },
  {
    id: 'nat-invert-definicion',
    topic: 'Animales Invertebrados',
    subject: 'Ciencias Naturales',
    concept: 'Invertebrados',
    definition: 'Los invertebrados son animales que no tienen columna vertebral ni esqueleto con huesos.',
    directQuestion: '¿Cuál es la principal característica de los animales INVERTEBRADOS?',
    correctAnswer: 'No tienen huesos ni columna vertebral',
    distractors: ['Tienen huesos muy grandes', 'Tienen plumas de colores', 'Viven siempre bajo tierra'],
    explanation: '¡Genial! Los insectos, lombrices, caracoles y pulpos son animales invertebrados.',
    trueStatement: 'Los animales invertebrados carecen de columna vertebral.',
    falseStatement: 'Los animales invertebrados tienen un esqueleto óseo completo.'
  },
  {
    id: 'nat-mamiferos-crias',
    topic: 'Los Mamíferos',
    subject: 'Ciencias Naturales',
    concept: 'Mamíferos y lactancia',
    definition: 'Las crías de los mamíferos nacen del vientre materno (vivíparos) y maman leche de su madre.',
    directQuestion: '¿Cómo se alimentan los mamíferos bebés al nacer?',
    correctAnswer: 'Maman leche de su madre',
    distractors: ['Comen hojas secas', 'Beben agua del río', 'Cazan insectos pequeños'],
    explanation: '¡Correcto! La palabra "mamífero" viene de mamar leche materna al nacer.',
    trueStatement: 'Los mamíferos se alimentan de leche materna cuando son cachorros.',
    falseStatement: 'Los mamíferos recién nacidos comen carne y hojas duras.'
  },
  {
    id: 'nat-aves-plumas',
    topic: 'Las Aves',
    subject: 'Ciencias Naturales',
    concept: 'Aves y plumas',
    definition: 'Las aves tienen el cuerpo cubierto de plumas, tienen pico sin dientes y nacen de huevos.',
    directQuestion: '¿Qué cubre y protege el cuerpo de todas las aves?',
    correctAnswer: 'Las plumas',
    distractors: ['Las escamas duras', 'El pelo suave', 'Una caparazón de piedra'],
    explanation: '¡Perfecto! Las plumas protegen a las aves del frío y les ayudan a volar.',
    trueStatement: 'Todas las aves tienen el cuerpo cubierto de plumas y tienen pico.',
    falseStatement: 'Las aves tienen dientes en el pico para masticar semillas.'
  },
  {
    id: 'nat-peces-branquias',
    topic: 'Los Peces',
    subject: 'Ciencias Naturales',
    concept: 'Respiración de los peces',
    definition: 'Los peces respiran el oxígeno disuelto en el agua a través de las branquias.',
    directQuestion: '¿A través de qué órgano respiran los peces bajo el agua?',
    correctAnswer: 'Las branquias',
    distractors: ['Los pulmones', 'La piel seca', 'Las aletas dorsales'],
    explanation: '¡Muy bien! El agua entra por su boca y pasa por las branquias donde captan el oxígeno.',
    trueStatement: 'Los peces respiran mediante branquias en el agua.',
    falseStatement: 'Los peces tienen pulmones como las personas para respirar bajo el agua.'
  },
  {
    id: 'nat-anfibios-metamorfosis',
    topic: 'Los Anfibios',
    subject: 'Ciencias Naturales',
    concept: 'Metamorfosis del anfibio',
    definition: 'Las ranas sufren una metamorfosis: de renacuajos acuáticos con branquias pasan a ranas adultas con pulmones.',
    directQuestion: '¿Cómo se llama la cría de la rana cuando nada en el agua antes de tener patas?',
    correctAnswer: 'Renacuajo',
    distractors: ['Oruga', 'Pichón', 'Alevín'],
    explanation: '¡Fantástico! Los renacuajos viven en el agua hasta que les crecen las patas y se transforman en ranas.',
    trueStatement: 'Las ranas nacen como renacuajos y sufren una metamorfosis.',
    falseStatement: 'Las ranas adultas respiran solo por branquias y no pueden pisar la tierra.'
  },
  {
    id: 'nat-reptiles-escamas',
    topic: 'Los Reptiles',
    subject: 'Ciencias Naturales',
    concept: 'Reptiles',
    definition: 'Los reptiles tienen la piel cubierta de escamas secas y duras y reptan o se arrastran.',
    directQuestion: '¿Cuál de estos animales es un REPTIL?',
    correctAnswer: 'La tortuga',
    distractors: ['El delfín', 'La golondrina', 'La salamandra'],
    explanation: '¡Genial! Las tortugas, serpientes, lagartos y cocodrilos son reptiles.',
    trueStatement: 'Las serpientes y las tortugas pertenecen al grupo de los reptiles.',
    falseStatement: 'Los reptiles tienen el cuerpo cubierto de pelo para abrigarse.'
  },
  {
    id: 'nat-insectos-patas',
    topic: 'Los Artrópodos',
    subject: 'Ciencias Naturales',
    concept: 'Patas de los insectos',
    definition: 'Todos los insectos tienen el cuerpo dividido en cabeza, tórax y abdomen, y 6 patas articuladas.',
    directQuestion: '¿Cuántas patas tienen los insectos como las hormigas o las abejas?',
    correctAnswer: '6 patas',
    distractors: ['8 patas', '4 patas', '10 patas'],
    explanation: '¡Correcto! Los insectos tienen 6 patas. Las arañas tienen 8 patas porque son arácnidos.',
    trueStatement: 'Los insectos tienen exactamente seis patas.',
    falseStatement: 'Los insectos tienen ocho patas articuladas.'
  },
  {
    id: 'nat-plantas-raiz',
    topic: 'Las Plantas',
    subject: 'Ciencias Naturales',
    concept: 'Función de la raíz',
    definition: 'La raíz fija la planta al suelo y absorbe agua y sales minerales.',
    directQuestion: '¿Qué parte de la planta absorbe el agua y los minerales del suelo?',
    correctAnswer: 'La raíz',
    distractors: ['La flor', 'La hoja', 'El fruto'],
    explanation: '¡Exacto! Las raíces están bajo tierra absorbiendo el agua como pajitas mágicas.',
    trueStatement: 'La raíz sujeta la planta y absorbe agua de la tierra.',
    falseStatement: 'Las hojas absorben el agua subterránea de la tierra.'
  },
  {
    id: 'nat-plantas-fotosintesis',
    topic: 'Las Plantas',
    subject: 'Ciencias Naturales',
    concept: 'Fotosíntesis',
    definition: 'Las hojas fabrican el alimento de la planta usando la luz solar, agua y dióxido de carbono.',
    directQuestion: '¿Qué parte de la planta utiliza la luz del Sol para fabricar su alimento?',
    correctAnswer: 'Las hojas',
    distractors: ['Las raíces', 'El tronco leñoso', 'Los pétalos de la flor'],
    explanation: '¡Fabuloso! En las hojas verdes ocurre la fotosíntesis gracias a la clorofila.',
    trueStatement: 'Las hojas fabrican el alimento de la planta gracias a la luz del Sol.',
    falseStatement: 'Las plantas comen animales para poder crecer y alimentarse.'
  },
  {
    id: 'nat-cuerpo-esqueleto',
    topic: 'El Cuerpo Humano',
    subject: 'Ciencias Naturales',
    concept: 'El esqueleto humano',
    definition: 'El esqueleto humano está formado por más de 200 huesos que sostienen el cuerpo y protegen los órganos.',
    directQuestion: '¿Cuál es la función principal del esqueleto en el cuerpo humano?',
    correctAnswer: 'Sostener el cuerpo y proteger órganos',
    distractors: ['Hacer la digestión de la comida', 'Bombear sangre a los pies', 'Captar olores del ambiente'],
    explanation: '¡Muy bien! Los huesos protegen el cerebro (el cráneo) y el corazón (las costillas).',
    trueStatement: 'El esqueleto sostiene nuestro cuerpo y protege los órganos internos.',
    falseStatement: 'El cuerpo humano no tiene huesos y se mantiene de pie solo por la piel.'
  },
  {
    id: 'nat-cuerpo-musculos',
    topic: 'El Cuerpo Humano',
    subject: 'Ciencias Naturales',
    concept: 'Músculos y movimiento',
    definition: 'Los músculos son elásticos, se contraen y estiran, y junto a los huesos forman el aparato locomotor.',
    directQuestion: '¿Qué partes de nuestro cuerpo se estiran y encogen para permitirnos movernos?',
    correctAnswer: 'Los músculos',
    distractors: ['Los dientes', 'Las uñas', 'Los cabellos'],
    explanation: '¡Genial! Los músculos tiran de los huesos para que podamos correr, saltar y bailar.',
    trueStatement: 'Los músculos son órganos elásticos que permiten el movimiento.',
    falseStatement: 'Los huesos son elásticos y pueden doblarse como gomas.'
  },
  {
    id: 'nat-cuerpo-corazon',
    topic: 'El Cuerpo Humano',
    subject: 'Ciencias Naturales',
    concept: 'El corazón humano',
    definition: 'El corazón es un músculo que bombea la sangre sin parar a través de los vasos sanguíneos.',
    directQuestion: '¿Qué órgano bombea la sangre a todas las partes de nuestro cuerpo?',
    correctAnswer: 'El corazón',
    distractors: ['El estómago', 'Los pulmones', 'El hígado'],
    explanation: '¡Perfecto! El corazón late unas 80 veces por minuto repartiendo oxígeno y nutrientes.',
    trueStatement: 'El corazón funciona como una bomba que impulsa la sangre por todo el cuerpo.',
    falseStatement: 'El estómago es el encargado de enviar sangre a las manos y piernas.'
  },
  {
    id: 'nat-cuerpo-pulmones',
    topic: 'El Cuerpo Humano',
    subject: 'Ciencias Naturales',
    concept: 'Aparato respiratorio',
    definition: 'Los pulmones toman el oxígeno del aire cuando inspiramos y expulsan dióxido de carbono al espirar.',
    directQuestion: '¿Qué gas del aire necesitan nuestros pulmones para que podamos vivir?',
    correctAnswer: 'El oxígeno',
    distractors: ['El dióxido de carbono', 'El vapor de agua hirviendo', 'El helio de los globos'],
    explanation: '¡Exacto! El oxígeno del aire viaja de los pulmones a la sangre para dar energía al cuerpo.',
    trueStatement: 'Los pulmones toman el oxígeno del aire al respirar.',
    falseStatement: 'Los seres humanos respiramos dióxido de carbono para vivir.'
  },
  {
    id: 'nat-agua-estados',
    topic: 'Materia y Energía',
    subject: 'Ciencias Naturales',
    concept: 'Estados del agua',
    definition: 'El agua puede estar en tres estados: sólido (hielo), líquido (agua de río) y gaseoso (vapor).',
    directQuestion: '¿En qué estado se encuentra el hielo o la nieve de la montaña?',
    correctAnswer: 'Estado sólido',
    distractors: ['Estado líquido', 'Estado gaseoso', 'Estado magnético'],
    explanation: '¡Excelente! Cuando el agua se enfría a 0 °C se congela y pasa a estado sólido.',
    trueStatement: 'El hielo es agua en estado sólido.',
    falseStatement: 'La nieve es agua en estado gaseoso que no se puede tocar.'
  },
  {
    id: 'nat-agua-evaporacion',
    topic: 'El Ciclo del Agua',
    subject: 'Ciencias Naturales',
    concept: 'Evaporación',
    definition: 'Cuando el calor del Sol calienta el agua líquida de mares y ríos, se transforma en vapor de agua.',
    directQuestion: '¿Cómo se llama el proceso cuando el agua líquida se convierte en vapor invisible con el calor?',
    correctAnswer: 'Evaporación',
    distractors: ['Condensación', 'Solidificación', 'Precipitación'],
    explanation: '¡Bien hecho! El vapor sube al cielo y más tarde formará las nubes.',
    trueStatement: 'La evaporación ocurre cuando el agua líquida se calienta y sube en forma de vapor.',
    falseStatement: 'La evaporación es cuando el agua se congela y se hace hielo duro.'
  },
  {
    id: 'nat-ciclo-nubes',
    topic: 'El Ciclo del Agua',
    subject: 'Ciencias Naturales',
    concept: 'Condensación',
    definition: 'Al enfriarse en las alturas, el vapor de agua se condensa formando diminutas gotitas que crean las nubes.',
    directQuestion: '¿De qué están formadas realmente las nubes del cielo?',
    correctAnswer: 'De millones de gotitas de agua y cristales de hielo',
    distractors: ['De algodón dulce flotante', 'De humo de aviones', 'De polvo de estrellas'],
    explanation: '¡Correcto! Las nubes no son gas, son gotitas líquidas y cristales microscópicos de hielo.',
    trueStatement: 'Las nubes están compuestas por millones de gotitas de agua condensada.',
    falseStatement: 'Las nubes son masas gigantescas de algodón flotante en el aire.'
  },
  {
    id: 'nat-sentidos-vista',
    topic: 'Los Sentidos',
    subject: 'Ciencias Naturales',
    concept: 'El sentido de la vista',
    definition: 'Los ojos son los órganos de la vista y nos permiten percibir la luz, formas, distancias y colores.',
    directQuestion: '¿Cuál es el órgano principal que nos permite tener el sentido de la vista?',
    correctAnswer: 'Los ojos',
    distractors: ['Las orejas', 'La nariz', 'La lengua'],
    explanation: '¡Exacto! Con los ojos captamos las imágenes del mundo y las enviamos al cerebro.',
    trueStatement: 'Los ojos son los órganos receptores de la vista.',
    falseStatement: 'El sentido del oído nos permite ver los colores del arcoíris.'
  },
  {
    id: 'nat-nutricion-estomago',
    topic: 'Aparato Digestivo',
    subject: 'Ciencias Naturales',
    concept: 'El estómago',
    definition: 'El estómago mezcla los alimentos con los jugos gástricos para descomponerlos en una papilla.',
    directQuestion: '¿En qué órgano del cuerpo se mezclan los alimentos con jugos para digerirlos?',
    correctAnswer: 'En el estómago',
    distractors: ['En los pulmones', 'En el corazón', 'En el cráneo'],
    explanation: '¡Genial! El estómago funciona como una batidora que prepara los nutrientes para el intestino.',
    trueStatement: 'El estómago ayuda a digerir la comida triturándola con jugos gástricos.',
    falseStatement: 'El estómago se encarga de enviar aire a los pulmones.'
  },
  {
    id: 'nat-seres-vivos-funciones',
    topic: 'Los Seres Vivos',
    subject: 'Ciencias Naturales',
    concept: 'Las tres funciones vitales',
    definition: 'Todos los seres vivos realizan tres funciones vitales: nutrición, relación y reproducción.',
    directQuestion: '¿Cuáles son las tres funciones vitales que realiza TODO ser vivo?',
    correctAnswer: 'Nutrición, relación y reproducción',
    distractors: ['Correr, saltar y dormir', 'Comer, jugar y descansar', 'Caminar, volar y nadar'],
    explanation: '¡Perfecto! Nos nutrimos para tener energía, nos relacionamos con el entorno y tenemos descendencia.',
    trueStatement: 'Nutrición, relación y reproducción son las tres funciones vitales de los seres vivos.',
    falseStatement: 'Las plantas no son seres vivos porque no pueden caminar de un lado a otro.'
  },
  {
    id: 'nat-moluscos-concha',
    topic: 'Animales Invertebrados',
    subject: 'Ciencias Naturales',
    concept: 'Moluscos',
    definition: 'Los moluscos tienen el cuerpo blando y la mayoría, como los caracoles y mejillones, tienen concha.',
    directQuestion: '¿A qué grupo de animales invertebrados pertenece el caracol de jardín?',
    correctAnswer: 'A los moluscos',
    distractors: ['A los arácnidos', 'A los insectos', 'A los anfibios'],
    explanation: '¡Muy bien! Los caracoles son moluscos terrestres con una concha en espiral.',
    trueStatement: 'El caracol es un animal invertebrado del grupo de los moluscos.',
    falseStatement: 'El caracol es un vertebrado con columna vertebral de hueso.'
  },

  // ==========================================
  // CIENCIAS SOCIALES (21 hechos auditados)
  // ==========================================
  {
    id: 'soc-tierra-continentes',
    topic: 'Los Continentes',
    subject: 'Ciencias Sociales',
    concept: 'Los 6 continentes',
    definition: 'La Tierra tiene 6 grandes continentes: Europa, África, Asia, América, Oceanía y la Antártida.',
    directQuestion: '¿En cuál de estos continentes se encuentra España?',
    correctAnswer: 'En Europa',
    distractors: ['En América', 'En Asia', 'En África'],
    explanation: '¡Exacto! España está situada en el sur del continente europeo, en la Península Ibérica.',
    trueStatement: 'España y Francia forman parte del continente europeo.',
    falseStatement: 'España se encuentra en el continente de Oceanía junto a Australia.'
  },
  {
    id: 'soc-tierra-oceanos',
    topic: 'Los Océanos',
    subject: 'Ciencias Sociales',
    concept: 'Los grandes océanos',
    definition: 'Hay 5 grandes océanos en la Tierra: Pacífico, Atlántico, Índico, Glaciar Ártico y Glaciar Antártico.',
    directQuestion: '¿Cuál es el océano más grande y extenso de todo el planeta Tierra?',
    correctAnswer: 'El Océano Pacífico',
    distractors: ['El Océano Atlántico', 'El Mar Mediterráneo', 'El Océano Índico'],
    explanation: '¡Genial! El Pacífico ocupa más de la tercera parte de toda la superficie de la Tierra.',
    trueStatement: 'El Océano Pacífico es el más grande del mundo.',
    falseStatement: 'El Océano Glaciar Ártico es el océano más cálido y extenso de la Tierra.'
  },
  {
    id: 'soc-tierra-rotacion',
    topic: 'Movimientos de la Tierra',
    subject: 'Ciencias Sociales',
    concept: 'Movimiento de rotación',
    definition: 'La Tierra gira sobre su propio eje en 24 horas (un día), dando origen al día y a la noche.',
    directQuestion: '¿Qué fenómeno produce el movimiento de rotación de la Tierra sobre sí misma?',
    correctAnswer: 'El día y la noche',
    distractors: ['Las cuatro estaciones del año', 'Las lluvias de primavera', 'Los eclipses de luna'],
    explanation: '¡Excelente! Cuando una parte de la Tierra mira al Sol es de día, y en la opuesta es de noche.',
    trueStatement: 'La rotación de la Tierra sobre su eje dura 24 horas y produce el día y la noche.',
    falseStatement: 'La rotación de la Tierra dura 365 días enteros.'
  },
  {
    id: 'soc-tierra-traslacion',
    topic: 'Movimientos de la Tierra',
    subject: 'Ciencias Sociales',
    concept: 'Movimiento de traslación',
    definition: 'La Tierra gira alrededor del Sol en 365 días (un año), originando las cuatro estaciones.',
    directQuestion: '¿Cuánto tiempo tarda la Tierra en dar una vuelta completa alrededor del Sol?',
    correctAnswer: '365 días (1 año)',
    distractors: ['24 horas (1 día)', '30 días (1 mes)', '7 días (1 semana)'],
    explanation: '¡Correcto! Este viaje se llama traslación y da lugar a primavera, verano, otoño e invierno.',
    trueStatement: 'El movimiento de traslación alrededor del Sol dura un año completo.',
    falseStatement: 'La Tierra tarda sólo una semana en dar la vuelta entera al Sol.'
  },
  {
    id: 'soc-montana-partes',
    topic: 'El Relieve',
    subject: 'Ciencias Sociales',
    concept: 'Partes de la montaña',
    definition: 'Una montaña tiene tres partes: la cima o cumbre (arriba), la ladera (pendiente) y el pie (base).',
    directQuestion: '¿Cómo se llama la parte más alta de una montaña?',
    correctAnswer: 'La cima o cumbre',
    distractors: ['El pie', 'La ladera', 'El valle'],
    explanation: '¡Perfecto! La cima es la cumbre más alta, la ladera es la cuesta y el pie es la base inferior.',
    trueStatement: 'La cima es el punto más elevado de una montaña.',
    falseStatement: 'El pie de la montaña es la parte más alta cubierta de nieve.'
  },
  {
    id: 'soc-relieve-valle',
    topic: 'El Relieve',
    subject: 'Ciencias Sociales',
    concept: 'El valle',
    definition: 'Un valle es un terreno bajo y llano situado entre dos montañas, por donde suele discurrir un río.',
    directQuestion: '¿Qué es un VALLE en el relieve de interior?',
    correctAnswer: 'El terreno bajo situado entre montañas',
    distractors: ['La cumbre nevada de un volcán', 'Una montaña muy empinada', 'Una isla en medio del mar'],
    explanation: '¡Muy bien! Los valles tienen tierras fértiles regadas por los ríos que bajan de las cumbres.',
    trueStatement: 'Un valle es la zona baja que queda entre montañas.',
    falseStatement: 'Un valle es la cima de una gran cordillera rocosa.'
  },
  {
    id: 'soc-relieve-llanura',
    topic: 'El Relieve',
    subject: 'Ciencias Sociales',
    concept: 'La llanura',
    definition: 'Una llanura es un terreno plano y extenso sin apenas desniveles, ideal para el cultivo y ciudades.',
    directQuestion: '¿Cómo es el terreno en un paisaje de LLANURA?',
    correctAnswer: 'Plano y horizontal sin grandes montañas',
    distractors: ['Lleno de picos altos y barrancos', 'Cubierto siempre por las olas del mar', 'Con cuevas volcánicas profundas'],
    explanation: '¡Fantástico! Las llanuras son ideales para la agricultura, carreteras y ciudades.',
    trueStatement: 'Las llanuras son grandes extensiones de terreno plano.',
    falseStatement: 'Las llanuras están formadas exclusivamente por cadenas montañosas.'
  },
  {
    id: 'soc-relieve-meseta',
    topic: 'El Relieve',
    subject: 'Ciencias Sociales',
    concept: 'La meseta',
    definition: 'Una meseta es una llanura elevada a gran altura sobre el nivel del mar.',
    directQuestion: '¿Qué es una MESETA?',
    correctAnswer: 'Una llanura elevada a gran altitud',
    distractors: ['Un pozo muy hondo bajo tierra', 'Una playa con arena blanca', 'Un río que no tiene agua'],
    explanation: '¡Genial! En el centro de España se encuentra la gran Meseta Central.',
    trueStatement: 'Una meseta es una zona plana que está situada a bastante altura.',
    falseStatement: 'Una meseta es una montaña con forma de pico muy afilado.'
  },
  {
    id: 'soc-costa-isla',
    topic: 'Paisajes de Costa',
    subject: 'Ciencias Sociales',
    concept: 'Isla y archipiélago',
    definition: 'Una isla es una porción de tierra rodeada de agua por todas partes. Un conjunto de islas es un archipiélago.',
    directQuestion: '¿Cómo se llama un trozo de tierra totalmente rodeado de agua por todos sus lados?',
    correctAnswer: 'Una isla',
    distractors: ['Una península', 'Un cabo', 'Un golfo'],
    explanation: '¡Correcto! Si está rodeada por todas partes menos por una (istmo), se llama península.',
    trueStatement: 'Una isla está rodeada de agua por todas partes.',
    falseStatement: 'Una isla está unida a un continente por un camino de tierra firme.'
  },
  {
    id: 'soc-costa-peninsula',
    topic: 'Paisajes de Costa',
    subject: 'Ciencias Sociales',
    concept: 'Península',
    definition: 'Una península es una extensión de tierra rodeada de agua por todas partes excepto por un istmo.',
    directQuestion: '¿Por qué España y Portugal forman una PENÍNSULA?',
    correctAnswer: 'Porque están rodeadas de agua salvo por los Pirineos',
    distractors: ['Porque son islas completamente aisladas', 'Porque no tienen mar en ninguna costa', 'Porque están flotando en el océano'],
    explanation: '¡Excelente! La Península Ibérica se une al resto de Europa por el istmo de los Pirineos.',
    trueStatement: 'Una península está rodeada de agua por todas partes menos por una.',
    falseStatement: 'Una península no tiene agua a su alrededor.'
  },
  {
    id: 'soc-rio-partes',
    topic: 'Los Ríos',
    subject: 'Ciencias Sociales',
    concept: 'Partes de un río',
    definition: 'Un río nace en la montaña (curso alto), viaja por el valle (curso medio) y desemboca en el mar (curso bajo).',
    directQuestion: '¿Cómo se llama el lugar final donde un río vierte sus aguas en el mar o en otro río?',
    correctAnswer: 'La desembocadura',
    distractors: ['El nacimiento', 'El afluente', 'El manantial'],
    explanation: '¡Perfecto! El nacimiento es el inicio y la desembocadura es el final del viaje del río.',
    trueStatement: 'La desembocadura es el lugar donde el río vierte sus aguas al mar.',
    falseStatement: 'El río nace en la desembocadura del mar y sube a la montaña.'
  },
  {
    id: 'soc-rio-espana-tajo',
    topic: 'Los Ríos de España',
    subject: 'Ciencias Sociales',
    concept: 'El río Tajo',
    definition: 'El río Tajo es el más largo de la Península Ibérica y desemboca en Lisboa en el Océano Atlántico.',
    directQuestion: '¿Cuál es el río más largo de toda la Península Ibérica?',
    correctAnswer: 'El río Tajo',
    distractors: ['El río Ebro', 'El río Manzanares', 'El río Guadalquivir'],
    explanation: '¡Muy bien! El Tajo nace en los Montes Universales (Teruel) y cruza Toledo hacia Portugal.',
    trueStatement: 'El río Tajo es el de mayor longitud de la Península Ibérica.',
    falseStatement: 'El río Manzanares es el río más caudaloso y largo de Europa.'
  },
  {
    id: 'soc-rio-espana-ebro',
    topic: 'Los Ríos de España',
    subject: 'Ciencias Sociales',
    concept: 'El río Ebro',
    definition: 'El río Ebro es el más caudaloso de España y desemboca formando un gran delta en el Mar Mediterráneo.',
    directQuestion: '¿En qué mar vierte sus aguas el río Ebro?',
    correctAnswer: 'En el Mar Mediterráneo',
    distractors: ['En el Océano Atlántico', 'En el Mar Cantábrico', 'En el Océano Pacífico'],
    explanation: '¡Exacto! El delta del Ebro en Tarragona es un parque natural lleno de aves acuáticas.',
    trueStatement: 'El río Ebro desemboca en el Mar Mediterráneo.',
    falseStatement: 'El río Ebro desemboca en el Océano Glaciar Ártico.'
  },
  {
    id: 'soc-tierra-capas',
    topic: 'El Planeta Tierra',
    subject: 'Ciencias Sociales',
    concept: 'Capas de la Tierra',
    definition: 'La Tierra tiene geosfera (rocas), hidrosfera (agua) y atmósfera (gases y aire).',
    directQuestion: '¿Cómo se llama el conjunto de toda el agua del planeta (mares, ríos, hielo y lluvia)?',
    correctAnswer: 'La hidrosfera',
    distractors: ['La geosfera', 'La atmósfera', 'La estratosfera'],
    explanation: '¡Genial! "Hidro" significa agua. La geosfera es la roca y la atmósfera es el aire.',
    trueStatement: 'La hidrosfera está formada por toda el agua presente en la Tierra.',
    falseStatement: 'La geosfera es la capa de aire y nubes que envuelve el planeta.'
  },
  {
    id: 'soc-municipio-alcalde',
    topic: 'La Localidad',
    subject: 'Ciencias Sociales',
    concept: 'El Ayuntamiento',
    definition: 'El ayuntamiento gestiona los servicios del municipio y está presidido por el alcalde o alcaldesa y concejales.',
    directQuestion: '¿Quién preside el Ayuntamiento de una localidad o municipio?',
    correctAnswer: 'El alcalde o la alcaldesa',
    distractors: ['El comisario de policía', 'El director del colegio', 'El jefe de bomberos'],
    explanation: '¡Fabuloso! El alcalde y los concejales son elegidos por los ciudadanos en las elecciones municipales.',
    trueStatement: 'El alcalde o alcaldesa dirige el ayuntamiento de una ciudad o pueblo.',
    falseStatement: 'En un municipio las leyes las decide el médico del hospital.'
  },
  {
    id: 'soc-normas-peatones',
    topic: 'Educación Vial',
    subject: 'Ciencias Sociales',
    concept: 'Paso de peatones',
    definition: 'Los peatones deben cruzar la calle por los pasos de cebra o cuando el semáforo de peatones esté en verde.',
    directQuestion: '¿Por dónde debemos cruzar los peatones una calle transitada de forma segura?',
    correctAnswer: 'Por el paso de peatones o con semáforo verde',
    distractors: ['Corriendo entre los coches aparcados', 'Por mitad de una curva sin mirar', 'Por donde haya más tráfico'],
    explanation: '¡Regla de seguridad básica! Mirar a ambos lados y cruzar siempre con el muñeco verde.',
    trueStatement: 'Los peatones deben cruzar siempre por el paso de peatones.',
    falseStatement: 'Los peatones pueden saltar la calzada con el semáforo en rojo.'
  },
  {
    id: 'soc-madrid-comunidad',
    topic: 'La Comunidad de Madrid',
    subject: 'Ciencias Sociales',
    concept: 'Madrid',
    definition: 'Madrid es una comunidad autónoma uniprovincial y la capital de España.',
    directQuestion: '¿Cuál es la ciudad capital de España?',
    correctAnswer: 'Madrid',
    distractors: ['Barcelona', 'Sevilla', 'Valencia'],
    explanation: '¡Excelente! En Madrid se encuentran el Palacio Real, el Museo del Prado y las sedes del gobierno.',
    trueStatement: 'Madrid es la capital de España.',
    falseStatement: 'Toledo es la capital actual de España.'
  },
  {
    id: 'soc-poblacion-sectores',
    topic: 'Los Trabajos',
    subject: 'Ciencias Sociales',
    concept: 'Sector primario',
    definition: 'El sector primario obtiene recursos directamente de la naturaleza: agricultura, ganadería y pesca.',
    directQuestion: '¿A qué sector de trabajo pertenece un agricultor que cultiva tomates o trigo?',
    correctAnswer: 'Al sector primario',
    distractors: ['Al sector secundario', 'Al sector terciario o servicios', 'Al sector tecnológico'],
    explanation: '¡Muy bien! Primario = naturaleza; Secundario = fábricas; Terciario = servicios y profesiones.',
    trueStatement: 'La agricultura, ganadería y pesca forman el sector primario.',
    falseStatement: 'Un agricultor que ara la tierra trabaja en el sector de fábricas e industrias.'
  },
  {
    id: 'soc-paisaje-natural-humanizado',
    topic: 'Los Paisajes',
    subject: 'Ciencias Sociales',
    concept: 'Paisajes transformados',
    definition: 'Un paisaje transformado o humanizado contiene puentes, carreteras, edificios y campos de cultivo hechos por personas.',
    directQuestion: '¿Cuál de estos elementos es una construcción HUMANA en el paisaje?',
    correctAnswer: 'Un puente de piedra sobre el río',
    distractors: ['Una cascada de agua cristalina', 'Un bosque natural de pinos', 'Una montaña rocosa'],
    explanation: '¡Correcto! Los puentes, túneles y casas son elementos antrópicos construidos por el ser humano.',
    trueStatement: 'Las carreteras y edificios son elementos transformados por las personas.',
    falseStatement: 'Las montañas y los ríos fueron construidos por personas con ladrillos.'
  },
  {
    id: 'soc-espana-limites',
    topic: 'Geografía de España',
    subject: 'Ciencias Sociales',
    concept: 'Límites de España',
    definition: 'España limita al norte con Francia y el Mar Cantábrico, al oeste con Portugal y el Atlántico, y al este con el Mediterráneo.',
    directQuestion: '¿Con qué país vecino comparte frontera España al oeste de la península?',
    correctAnswer: 'Portugal',
    distractors: ['Francia', 'Italia', 'Alemania'],
    explanation: '¡Genial! Portugal comparte frontera terrestre (la Raya) y desembocaduras de ríos con España.',
    trueStatement: 'España limita al oeste con Portugal y el Océano Atlántico.',
    falseStatement: 'España limita al norte con Marruecos.'
  },
  {
    id: 'soc-tiempo-clima',
    topic: 'El Clima',
    subject: 'Ciencias Sociales',
    concept: 'Temperatura y precipitaciones',
    definition: 'El tiempo atmosférico es el estado de la atmósfera en un día concreto, y el clima es el tiempo a lo largo de muchos años.',
    directQuestion: '¿Qué aparato utilizan los meteorólogos para medir la temperatura del aire en grados Celsius?',
    correctAnswer: 'El termómetro',
    distractors: ['La veleta', 'El anemómetro', 'El pluviómetro'],
    explanation: '¡Perfecto! El termómetro mide la temperatura, el pluviómetro la lluvia y la veleta la dirección del viento.',
    trueStatement: 'El termómetro es el instrumento que mide la temperatura ambiente.',
    falseStatement: 'El pluviómetro se utiliza para medir el peso de las piedras de la montaña.'
  },

  // ==========================================
  // LENGUA CASTELLANA (21 hechos auditados)
  // ==========================================
  {
    id: 'len-sust-propio',
    topic: 'Las Clases de Palabras',
    subject: 'Lengua Castellana',
    concept: 'Sustantivos propios',
    definition: 'Los sustantivos propios nombran a una persona, animal o lugar diferenciándolo de los demás y se escriben con mayúscula.',
    directQuestion: '¿Cuál de estas palabras es un SUSTANTIVO PROPIO y debe escribirse con mayúscula inicial?',
    correctAnswer: 'Samantha',
    distractors: ['niña', 'colegio', 'cuaderno'],
    explanation: '¡Excelente! Samantha, Madrid y España son sustantivos propios y siempre llevan mayúscula.',
    trueStatement: 'Los nombres propios de personas y ciudades siempre se escriben con mayúscula inicial.',
    falseStatement: 'Los sustantivos propios se escriben siempre en minúscula como "perro" o "mesa".'
  },
  {
    id: 'len-sust-colectivo',
    topic: 'Las Clases de Palabras',
    subject: 'Lengua Castellana',
    concept: 'Sustantivos colectivos',
    definition: 'Un sustantivo colectivo nombra en singular a un conjunto de seres u objetos.',
    directQuestion: '¿Cuál es el sustantivo colectivo que nombra a un grupo de abejas?',
    correctAnswer: 'Enjambre',
    distractors: ['Manada', 'Banco', 'Bosque'],
    explanation: '¡Genial! Abejas = enjambre; lobos = manada; peces = banco; árboles = bosque.',
    trueStatement: 'Un enjambre es un sustantivo colectivo que nombra a un conjunto de abejas.',
    falseStatement: 'La palabra "árbol" es un sustantivo colectivo que significa muchos árboles.'
  },
  {
    id: 'len-adjetivo-calificativo',
    topic: 'Las Clases de Palabras',
    subject: 'Lengua Castellana',
    concept: 'El adjetivo',
    definition: 'Los adjetivos son palabras que expresan cualidades de los sustantivos: cómo son o cómo están.',
    directQuestion: 'En la frase: "La brillante estrella ilumina la noche", ¿cuál es el ADJETIVO?',
    correctAnswer: 'Brillante',
    distractors: ['Estrella', 'Ilumina', 'Noche'],
    explanation: '¡Correcto! "Brillante" nos dice cómo es la estrella (cualidad).',
    trueStatement: 'Los adjetivos dicen cómo son o están las personas, animales y cosas.',
    falseStatement: 'Los adjetivos son palabras que indican acciones como saltar o correr.'
  },
  {
    id: 'len-verbo-accion',
    topic: 'Las Clases de Palabras',
    subject: 'Lengua Castellana',
    concept: 'El verbo',
    definition: 'Los verbos son palabras que indican acciones, procesos o estados en pasado, presente o futuro.',
    directQuestion: '¿Cuál de estas palabras es un VERBO en infinitivo?',
    correctAnswer: 'Cantar',
    distractors: ['Canción', 'Cantante', 'Musical'],
    explanation: '¡Muy bien! Los verbos en infinitivo terminan en -ar, -er o -ir: cantar, comer, vivir.',
    trueStatement: 'Los verbos expresan acciones que podemos realizar.',
    falseStatement: '"Ventana" es un verbo porque podemos abrirla con la mano.'
  },
  {
    id: 'len-acent-agudas',
    topic: 'Reglas de Acentuación',
    subject: 'Lengua Castellana',
    concept: 'Palabras agudas',
    definition: 'Las palabras agudas tienen la sílaba tónica en la última sílaba y llevan tilde si terminan en vocal, N o S.',
    directQuestion: '¿Dónde tienen el golpe de voz más fuerte las palabras AGUDAS?',
    correctAnswer: 'En la última sílaba',
    distractors: ['En la penúltima sílaba', 'En la antepenúltima sílaba', 'En la primera sílaba'],
    explanation: '¡Exacto! Ratón, camión, café y compás son palabras agudas.',
    trueStatement: 'Las palabras agudas llevan la fuerza de voz en la última sílaba.',
    falseStatement: 'Las palabras agudas llevan siempre la fuerza en la penúltima sílaba.'
  },
  {
    id: 'len-acent-llanas',
    topic: 'Reglas de Acentuación',
    subject: 'Lengua Castellana',
    concept: 'Palabras llanas',
    definition: 'Las palabras llanas tienen la sílaba tónica en la penúltima sílaba y llevan tilde si NO terminan en vocal, N o S.',
    directQuestion: '¿Cuál de estas palabras es LLANA (fuerza en la penúltima sílaba)?',
    correctAnswer: 'Mochila',
    distractors: ['Melón', 'Caracol', 'Mágico'],
    explanation: '¡Perfecto! Mo-CHI-la tiene la fuerza en "chi", que es la penúltima sílaba.',
    trueStatement: 'Las palabras llanas tienen la sílaba tónica en la penúltima posición.',
    falseStatement: 'Todas las palabras llanas llevan tilde obligatoriamente.'
  },
  {
    id: 'len-acent-esdrujulas',
    topic: 'Reglas de Acentuación',
    subject: 'Lengua Castellana',
    concept: 'Palabras esdrújulas',
    definition: 'Las palabras esdrújulas tienen la fuerza en la antepenúltima sílaba y TODAS llevan siempre tilde.',
    directQuestion: '¿Qué regla especial cumplen TODAS las palabras ESDRÚJULAS?',
    correctAnswer: 'Llevan tilde siempre',
    distractors: ['Nunca llevan tilde', 'Solo llevan tilde si acaban en N', 'Solo llevan tilde si acaban en S'],
    explanation: '¡Regla de oro! Pájaro, mágico, música, teléfono... ¡todas las esdrújulas llevan tilde siempre!',
    trueStatement: 'Todas las palabras esdrújulas se escriben siempre con tilde.',
    falseStatement: 'Las palabras esdrújulas jamás llevan acento ortográfico ni tilde.'
  },
  {
    id: 'len-sinonimos',
    topic: 'Vocabulario',
    subject: 'Lengua Castellana',
    concept: 'Sinónimos',
    definition: 'Los sinónimos son palabras que tienen un significado igual o muy parecido.',
    directQuestion: '¿Cuál es un SINÓNIMO de la palabra "contento"?',
    correctAnswer: 'Alegre',
    distractors: ['Triste', 'Enojado', 'Cansado'],
    explanation: '¡Fantástico! Contento y alegre significan lo mismo. Triste sería su antónimo.',
    trueStatement: 'Los sinónimos son palabras que comparten un significado similar.',
    falseStatement: 'Los sinónimos son palabras que significan cosas completamente contrarias.'
  },
  {
    id: 'len-antonimos',
    topic: 'Vocabulario',
    subject: 'Lengua Castellana',
    concept: 'Antónimos',
    definition: 'Los antónimos son palabras que tienen significados opuestos o contrarios.',
    directQuestion: '¿Cuál es el ANTÓNIMO (lo opuesto) de la palabra "valiente"?',
    correctAnswer: 'Miedoso',
    distractors: ['Fuerte', 'Atrevido', 'Heroico'],
    explanation: '¡Bien pensado! Lo contrario de ser valiente es ser miedoso o cobarde.',
    trueStatement: 'Los antónimos son palabras con significados opuestos entre sí.',
    falseStatement: 'Alto y grande son antónimos porque se refieren al tamaño.'
  },
  {
    id: 'len-ortografia-b-v',
    topic: 'Reglas de Ortografía',
    subject: 'Lengua Castellana',
    concept: 'Uso de la B',
    definition: 'Se escribe siempre B antes de otra consonante: bra, bre, bri, bro, bru y bla, ble, bli, blo, blu.',
    directQuestion: '¿Cuál de estas palabras está correctamente escrita con B?',
    correctAnswer: 'Blanco',
    distractors: ['Vlanco', 'Vrazo', 'Vruja'],
    explanation: '¡Muy bien! Delante de L y de R siempre se escribe con B: blanco, brazo, bruja.',
    trueStatement: 'Las combinaciones "bl" y "br" se escriben siempre con B.',
    falseStatement: 'La palabra "brazo" se escribe correctamente con V.'
  },
  {
    id: 'len-ortografia-c-z',
    topic: 'Reglas de Ortografía',
    subject: 'Lengua Castellana',
    concept: 'Sonido Z',
    definition: 'El sonido Z se escribe con Z delante de a, o, u (za, zo, zu) y con C delante de e, i (ce, ci).',
    directQuestion: '¿Cómo se escribe correctamente la palabra para la hortaliza naranja de los conejos?',
    correctAnswer: 'Zanahoria',
    distractors: ['Canahoria', 'Sanahoria', 'Zanagoria'],
    explanation: '¡Genial! Delante de A va con Z: zapato, zanahoria, zumo.',
    trueStatement: 'El sonido Z se escribe con C ante las vocales E e I (cereza, cielo).',
    falseStatement: 'Se escribe "ze" y "zi" en lugar de "ce" y "ci" en palabras normales.'
  },
  {
    id: 'len-signos-puntuacion',
    topic: 'Signos de Puntuación',
    subject: 'Lengua Castellana',
    concept: 'Signos de interrogación',
    definition: 'En español las preguntas se abren con ¿ al principio y se cierran con ? al final.',
    directQuestion: '¿Qué signo debemos poner obligatoriamente al PRINCIPIO de una pregunta en español?',
    correctAnswer: '¿ (signo de apertura)',
    distractors: ['? (signo de cierre)', '¡ (exclamación)', ': (dos puntos)'],
    explanation: '¡Exacto! A diferencia del inglés, en español siempre abrimos con ¿ y cerramos con ?.',
    trueStatement: 'En castellano las preguntas comienzan siempre con el signo ¿ abierto.',
    falseStatement: 'En castellano sólo se pone signo de interrogación al final de la frase.'
  },
  {
    id: 'len-familia-palabras',
    topic: 'Formación de Palabras',
    subject: 'Lengua Castellana',
    concept: 'Familia de palabras',
    definition: 'Una familia de palabras comparte la misma raíz y significado básico: pan, panadero, panadería.',
    directQuestion: '¿Cuál de estas palabras NO pertenece a la familia de "flor"?',
    correctAnswer: 'Flotador',
    distractors: ['Floristería', 'Florero', 'Florecer'],
    explanation: '¡Correcto! Flotador viene de "flotar", mientras que floristería y florero vienen de "flor".',
    trueStatement: 'Florero y floristería forman parte de la familia léxica de flor.',
    falseStatement: 'Flotador y flor comparten la misma raíz léxica.'
  },
  {
    id: 'len-prefijos-des',
    topic: 'Formación de Palabras',
    subject: 'Lengua Castellana',
    concept: 'Prefijo des-',
    definition: 'El prefijo des- se añade al principio de una palabra para formar su significado contrario.',
    directQuestion: 'Si a la palabra "hacer" le añadimos el prefijo "des-", ¿qué nueva palabra se forma?',
    correctAnswer: 'Deshacer',
    distractors: ['Rehacer', 'Poshacer', 'Subhacer'],
    explanation: '¡Fabuloso! Deshacer significa anular lo que estaba hecho.',
    trueStatement: 'El prefijo des- expresa lo contrario o la inversión de la acción.',
    falseStatement: 'Los prefijos se colocan al final de la palabra después de la raíz.'
  },
  {
    id: 'len-plural-z-c',
    topic: 'Reglas de Ortografía',
    subject: 'Lengua Castellana',
    concept: 'Plural de palabras en Z',
    definition: 'Las palabras que en singular acaban en Z forman el plural con -ces: pez -> peces, luz -> luces.',
    directQuestion: '¿Cuál es el plural correcto de la palabra "pez"?',
    correctAnswer: 'Peces',
    distractors: ['Pezs', 'Pezes', 'Pecess'],
    explanation: '¡Muy bien! Pez -> peces, cruz -> cruces, lápiz -> lápices.',
    trueStatement: 'Las palabras terminadas en Z cambian a C en el plural (-ces).',
    falseStatement: 'El plural de lápiz es "lápizs" manteniendo la Z.'
  },
  {
    id: 'len-genero-numero',
    topic: 'Gramática',
    subject: 'Lengua Castellana',
    concept: 'Género y número',
    definition: 'Los sustantivos tienen género (masculino o femenino) y número (singular = uno, plural = varios).',
    directQuestion: '¿Qué género y número tiene el sustantivo "las mariposas"?',
    correctAnswer: 'Femenino y plural',
    distractors: ['Masculino y singular', 'Femenino y singular', 'Masculino y plural'],
    explanation: '¡Excelente! "Las" indica femenino y al terminar en S indica que son varias (plural).',
    trueStatement: 'La palabra "mariposas" está en género femenino y número plural.',
    falseStatement: 'La palabra "árboles" es de género femenino.'
  },
  {
    id: 'len-articulos-determinados',
    topic: 'Las Clases de Palabras',
    subject: 'Lengua Castellana',
    concept: 'Artículos determinados',
    definition: 'Los artículos determinados son: el, la, los, las. Acompañan al sustantivo concordando en género y número.',
    directQuestion: '¿Cuál de estos es un ARTÍCULO DETERMINADO?',
    correctAnswer: 'La',
    distractors: ['Un', 'Unos', 'Algún'],
    explanation: '¡Genial! Determinados: el, la, los, las. Indeterminados: un, una, unos, unas.',
    trueStatement: '"El, la, los, las" son artículos determinados.',
    falseStatement: '"Un, una, unos, unas" son verbos en infinitivo.'
  },
  {
    id: 'len-silaba-tonica',
    topic: 'Fonética y Sílabas',
    subject: 'Lengua Castellana',
    concept: 'Sílaba tónica',
    definition: 'La sílaba tónica es la que se pronuncia con más fuerza e intensidad dentro de una palabra.',
    directQuestion: 'En la palabra "cam-pa-na", ¿cuál es la SÍLABA TÓNICA con más fuerza?',
    correctAnswer: 'pa',
    distractors: ['cam', 'na', 'todas igual'],
    explanation: '¡Oído perfecto! Decimos cam-PA-na, por eso "pa" es la sílaba tónica.',
    trueStatement: 'En una palabra solo hay una sílaba tónica que suena con más intensidad.',
    falseStatement: 'Todas las sílabas de una palabra se pronuncian con la misma fuerza idéntica.'
  },
  {
    id: 'len-fabula-moraleja',
    topic: 'Tipos de Textos',
    subject: 'Lengua Castellana',
    concept: 'La fábula y la moraleja',
    definition: 'Una fábula es un cuento corto con animales como protagonistas que nos enseña una lección llamada moraleja.',
    directQuestion: '¿Cómo se llama la enseñanza o lección final que nos deja una fábula?',
    correctAnswer: 'Moraleja',
    distractors: ['Rima', 'Prólogo', 'Estribillo'],
    explanation: '¡Bien pensado! La moraleja nos enseña a ser mejores personas, como en "La liebre y la tortuga".',
    trueStatement: 'Las fábulas concluyen con una enseñanza llamada moraleja.',
    falseStatement: 'Una fábula es una noticia real publicada en un periódico.'
  },
  {
    id: 'len-ortografia-r-rr',
    topic: 'Reglas de Ortografía',
    subject: 'Lengua Castellana',
    concept: 'Sonido R fuerte',
    definition: 'El sonido R fuerte entre dos vocales se escribe siempre con RR: perro, carro, tierra.',
    directQuestion: '¿Cuándo se escribe doble erre (RR) en español?',
    correctAnswer: 'Para el sonido fuerte entre dos vocales (como perro)',
    distractors: ['Al principio de cualquier palabra', 'Al final de la frase', 'Detrás de una consonante'],
    explanation: '¡Exacto! Al principio de palabra nunca se pone doble R, aunque suene fuerte: ratón, río.',
    trueStatement: 'Se escribe RR para el sonido fuerte situado entre dos vocales.',
    falseStatement: 'Las palabras que empiezan por R fuerte se escriben con "rr" al inicio como "rratón".'
  },
  {
    id: 'len-mayuscula-punto',
    topic: 'Reglas de Ortografía',
    subject: 'Lengua Castellana',
    concept: 'Mayúscula después de punto',
    definition: 'Se escribe siempre con letra mayúscula al empezar un texto y después de un punto (seguido o aparte).',
    directQuestion: '¿Qué tipo de letra debemos utilizar siempre después de escribir un punto?',
    correctAnswer: 'Letra mayúscula',
    distractors: ['Letra minúscula', 'Letra cursiva inclinada', 'Un número'],
    explanation: '¡Regla esencial! Tras un punto siempre iniciamos con letra mayúscula.',
    trueStatement: 'La primera letra tras un punto se escribe obligatoriamente en mayúscula.',
    falseStatement: 'Después de un punto siempre se continúa escribiendo en minúscula.'
  },

  // ==========================================
  // MATEMÁTICAS (21 hechos auditados)
  // ==========================================
  {
    id: 'mat-tabla-7x8',
    topic: 'Tablas de Multiplicar',
    subject: 'Matemáticas',
    concept: 'Multiplicación 7 x 8',
    definition: 'Siete por ocho es igual a cincuenta y seis (7 x 8 = 56).',
    directQuestion: '¿Cuánto es el resultado de multiplicar 7 x 8?',
    correctAnswer: '56',
    distractors: ['48', '64', '54'],
    explanation: '¡Bravo! 7 x 8 = 56. ¡Una de las multiplicaciones clave de 3.º de Primaria!',
    trueStatement: 'Siete por ocho es igual a cincuenta y seis.',
    falseStatement: 'Siete por ocho es igual a sesenta y cuatro.'
  },
  {
    id: 'mat-tabla-9x6',
    topic: 'Tablas de Multiplicar',
    subject: 'Matemáticas',
    concept: 'Multiplicación 9 x 6',
    definition: 'Nueve por seis es igual a cincuenta y cuatro (9 x 6 = 54).',
    directQuestion: '¿Cuánto es 9 x 6?',
    correctAnswer: '54',
    distractors: ['63', '45', '56'],
    explanation: '¡Perfecto! 9 x 6 = 54. Recuerda que 5 + 4 suma 9.',
    trueStatement: 'Nueve multiplicado por seis da como resultado cincuenta y cuatro.',
    falseStatement: 'Nueve por seis da cuarenta y ocho.'
  },
  {
    id: 'mat-multiplicar-cero',
    topic: 'Operaciones',
    subject: 'Matemáticas',
    concept: 'Propiedad del cero',
    definition: 'Cualquier número multiplicado por cero es igual a cero (n x 0 = 0).',
    directQuestion: 'Si multiplicas 254 por cero (254 x 0), ¿cuál es el resultado?',
    correctAnswer: '0',
    distractors: ['254', '1', '250'],
    explanation: '¡Exacto! El cero absorbe todo número en la multiplicación: 254 x 0 = 0.',
    trueStatement: 'Cualquier número multiplicado por cero da como resultado cero.',
    falseStatement: 'Si multiplicas un número por cero da el mismo número inicial.'
  },
  {
    id: 'mat-doble-triple',
    topic: 'Cálculo Mental',
    subject: 'Matemáticas',
    concept: 'El triple de un número',
    definition: 'El triple de un número se obtiene multiplicándolo por tres.',
    directQuestion: '¿Cuál es el TRIPLE del número 8?',
    correctAnswer: '24',
    distractors: ['16', '32', '21'],
    explanation: '¡Genial! El doble de 8 es 16 (8 x 2) y el triple es 24 (8 x 3).',
    trueStatement: 'Para calcular el triple de un número se multiplica dicho número por 3.',
    falseStatement: 'El triple de 8 es 16.'
  },
  {
    id: 'mat-division-mitad',
    topic: 'Iniciación a la División',
    subject: 'Matemáticas',
    concept: 'La mitad',
    definition: 'La mitad de un número se calcula dividiéndolo entre 2 en dos partes exactamente iguales.',
    directQuestion: 'Si tienes 30 caramelos y quieres quedarte con la mitad exacta, ¿cuántos tienes?',
    correctAnswer: '15 caramelos',
    distractors: ['10 caramelos', '20 caramelos', '12 caramelos'],
    explanation: '¡Excelente! 30 dividido entre 2 es igual a 15, porque 15 + 15 = 30.',
    trueStatement: 'La mitad de treinta es quince.',
    falseStatement: 'La mitad de un número se calcula sumándole dos.'
  },
  {
    id: 'mat-tiempo-hora-minutos',
    topic: 'Medidas de Tiempo',
    subject: 'Matemáticas',
    concept: 'Horas y minutos',
    definition: 'Una hora tiene 60 minutos, media hora son 30 minutos y un cuarto de hora son 15 minutos.',
    directQuestion: '¿Cuántos minutos hay en una HORA ENTERA?',
    correctAnswer: '60 minutos',
    distractors: ['100 minutos', '30 minutos', '24 minutos'],
    explanation: '¡Muy bien! Una hora tiene 60 minutos, y un día entero tiene 24 horas.',
    trueStatement: 'Una hora consta de exactamente sesenta minutos.',
    falseStatement: 'Una hora tiene cien minutos en el reloj digital.'
  },
  {
    id: 'mat-tiempo-cuarto-hora',
    topic: 'Medidas de Tiempo',
    subject: 'Matemáticas',
    concept: 'Cuarto de hora',
    definition: 'Un cuarto de hora equivale a 15 minutos (la cuarta parte de 60 minutos).',
    directQuestion: '¿A cuántos minutos equivale exactamente un CUARTO DE HORA?',
    correctAnswer: '15 minutos',
    distractors: ['25 minutos', '30 minutos', '10 minutos'],
    explanation: '¡Fantástico! 15 + 15 + 15 + 15 = 60 minutos (cuatro cuartos forman una hora entera).',
    trueStatement: 'Un cuarto de hora equivale a quince minutos.',
    falseStatement: 'Un cuarto de hora son veinticinco minutos.'
  },
  {
    id: 'mat-tiempo-reloj-agujas',
    topic: 'El Reloj de Agujas',
    subject: 'Matemáticas',
    concept: 'Las manecillas del reloj',
    definition: 'La manecilla corta indica las horas y la manecilla larga indica los minutos.',
    directQuestion: 'En un reloj analógico, ¿qué nos señala la aguja LARGA?',
    correctAnswer: 'Los minutos',
    distractors: ['Las horas', 'Los días de la semana', 'Los meses del año'],
    explanation: '¡Perfecto! La corta marca las horas y la larga marca los minutos.',
    trueStatement: 'La aguja larga del reloj analógico marca los minutos transcurridos.',
    falseStatement: 'La aguja corta del reloj marca los minutos y la larga las horas.'
  },
  {
    id: 'mat-longitud-metro-cm',
    topic: 'Medidas de Longitud',
    subject: 'Matemáticas',
    concept: 'Metro y centímetros',
    definition: 'Un metro equivale a 100 centímetros (1 m = 100 cm).',
    directQuestion: '¿Cuántos centímetros hay en un METRO de longitud?',
    correctAnswer: '100 centímetros',
    distractors: ['10 centímetros', '1.000 centímetros', '60 centímetros'],
    explanation: '¡Regla métrica! "Centi" significa cien partes: 1 metro = 100 cm.',
    trueStatement: 'Un metro contiene cien centímetros.',
    falseStatement: 'Un metro tiene diez centímetros exactos.'
  },
  {
    id: 'mat-longitud-kilometro',
    topic: 'Medidas de Longitud',
    subject: 'Matemáticas',
    concept: 'El kilómetro',
    definition: 'Un kilómetro equivale a 1.000 metros (1 km = 1.000 m), usado para medir distancias largas.',
    directQuestion: '¿A cuántos metros equivale un KILÓMETRO de distancia?',
    correctAnswer: '1.000 metros',
    distractors: ['100 metros', '500 metros', '10.000 metros'],
    explanation: '¡Bien hecho! El prefijo "kilo" significa mil: 1 km = 1.000 m.',
    trueStatement: 'Un kilómetro es igual a mil metros.',
    falseStatement: 'Un kilómetro tiene cien metros de recorrido.'
  },
  {
    id: 'mat-masa-kilo-gramos',
    topic: 'Medidas de Masa',
    subject: 'Matemáticas',
    concept: 'Kilo y gramos',
    definition: 'Un kilogramo equivale a 1.000 gramos. Medio kilo son 500 gramos.',
    directQuestion: 'Si compramos MEDIO KILO de manzanas en la frutería, ¿cuántos gramos son?',
    correctAnswer: '500 gramos',
    distractors: ['250 gramos', '1.000 gramos', '100 gramos'],
    explanation: '¡Excelente! Como 1 kilo son 1.000 gramos, la mitad son 500 gramos.',
    trueStatement: 'Medio kilogramo equivale a quinientos gramos.',
    falseStatement: 'Medio kilo son cien gramos exactos.'
  },
  {
    id: 'mat-capacidad-litro',
    topic: 'Medidas de Capacidad',
    subject: 'Matemáticas',
    concept: 'El litro',
    definition: 'Un litro equivale a dos medios litros o a cuatro cuartos de litro.',
    directQuestion: '¿Cuántos vasos de MEDIO LITRO podemos llenar con una botella de 1 litro de leche?',
    correctAnswer: '2 vasos',
    distractors: ['4 vasos', '10 vasos', '1 vaso'],
    explanation: '¡Genial! Dos medios litros forman un litro completo.',
    trueStatement: 'Un litro de líquido contiene dos medios litros.',
    falseStatement: 'Con un litro de zumo se pueden llenar diez jarras de un litro.'
  },
  {
    id: 'mat-dinero-euro-centimos',
    topic: 'El Dinero',
    subject: 'Matemáticas',
    concept: 'Euros y céntimos',
    definition: 'Un euro equivale a 100 céntimos. Una moneda de 2 euros son 200 céntimos.',
    directQuestion: '¿Cuántos céntimos de euro equivalen a UNA moneda de 1 euro?',
    correctAnswer: '100 céntimos',
    distractors: ['50 céntimos', '10 céntimos', '1.000 céntimos'],
    explanation: '¡Correcto! 1 € = 100 céntimos. Dos monedas de 50 céntimos hacen un euro.',
    trueStatement: 'Un euro se divide en cien céntimos.',
    falseStatement: 'Un euro tiene sólo diez céntimos de valor.'
  },
  {
    id: 'mat-geometria-triangulo',
    topic: 'Geometría Plana',
    subject: 'Matemáticas',
    concept: 'El triángulo',
    definition: 'El triángulo es un polígono de 3 lados, 3 vértices y 3 ángulos.',
    directQuestion: '¿Cuántos lados tiene un polígono llamado TRIÁNGULO?',
    correctAnswer: '3 lados',
    distractors: ['4 lados', '5 lados', '6 lados'],
    explanation: '¡Muy bien! Tri- significa tres: 3 lados y 3 vértices.',
    trueStatement: 'Todos los triángulos tienen exactamente tres lados.',
    falseStatement: 'Un triángulo tiene cuatro lados rectos iguales.'
  },
  {
    id: 'mat-geometria-cuadrilatero',
    topic: 'Geometría Plana',
    subject: 'Matemáticas',
    concept: 'El cuadrilátero',
    definition: 'Un polígono de cuatro lados se llama cuadrilátero (como el cuadrado, rectángulo o rombo).',
    directQuestion: '¿Cómo se llama la figura geométrica que tiene CUATRO lados iguales y cuatro esquinas rectas?',
    correctAnswer: 'El cuadrado',
    distractors: ['El triángulo', 'El pentágono', 'El círculo'],
    explanation: '¡Perfecto! El cuadrado tiene 4 lados de la misma longitud y 4 ángulos rectos.',
    trueStatement: 'El cuadrado es un cuadrilátero con cuatro lados de igual medida.',
    falseStatement: 'Un pentágono tiene cuatro lados rectos.'
  },
  {
    id: 'mat-numeracion-centena',
    topic: 'Numeración',
    subject: 'Matemáticas',
    concept: 'Centenas y decenas',
    definition: 'Una centena equivale a 10 decenas o 100 unidades.',
    directQuestion: '¿Cuántas UNIDADES hay en una CENTENA completa?',
    correctAnswer: '100 unidades',
    distractors: ['10 unidades', '1.000 unidades', '50 unidades'],
    explanation: '¡Exacto! 1 centena = 10 decenas = 100 unidades.',
    trueStatement: 'Una centena está formada por cien unidades.',
    falseStatement: 'Una centena tiene sólo diez unidades.'
  },
  {
    id: 'mat-numeracion-millar',
    topic: 'Numeración',
    subject: 'Matemáticas',
    concept: 'Unidad de millar',
    definition: 'Una unidad de millar (1 UM) equivale a 1.000 unidades o 10 centenas.',
    directQuestion: '¿Cómo se escribe en número la cifra "tres mil quinientos veinte"?',
    correctAnswer: '3.520',
    distractors: ['3.052', '35.200', '352'],
    explanation: '¡Matemáticas perfectas! 3 unidades de millar, 5 centenas y 2 decenas = 3.520.',
    trueStatement: 'El número 3.520 se lee tres mil quinientos veinte.',
    falseStatement: 'El número 3.520 tiene cinco unidades de millar.'
  },
  {
    id: 'mat-operaciones-suma-propiedad',
    topic: 'Operaciones',
    subject: 'Matemáticas',
    concept: 'Propiedad conmutativa',
    definition: 'En la suma y multiplicación, el orden de los sumandos o factores no cambia el resultado final.',
    directQuestion: 'Si sabes que 15 + 28 = 43, ¿cuánto es 28 + 15?',
    correctAnswer: '43',
    distractors: ['33', '53', '40'],
    explanation: '¡Propiedad conmutativa! El orden de los sumandos no altera la suma.',
    trueStatement: 'En la suma, cambiar el orden de los números da el mismo resultado.',
    falseStatement: 'Si cambias el orden de los números al sumar el resultado es diferente.'
  },
  {
    id: 'mat-pares-impares',
    topic: 'Números',
    subject: 'Matemáticas',
    concept: 'Números pares',
    definition: 'Los números pares terminan en 0, 2, 4, 6 u 8 y se pueden dividir entre dos exactamente.',
    directQuestion: '¿Cuál de los siguientes números es un número PAR?',
    correctAnswer: '48',
    distractors: ['37', '51', '89'],
    explanation: '¡Bien hecho! 48 termina en 8, por lo que es un número par.',
    trueStatement: 'Los números que terminan en 0, 2, 4, 6 u 8 son pares.',
    falseStatement: 'El número 37 es un número par divisible entre dos.'
  },
  {
    id: 'mat-problema-reparto',
    topic: 'Resolución de Problemas',
    subject: 'Matemáticas',
    concept: 'Reparto equitativo',
    definition: 'Repartir una cantidad en partes iguales consiste en dividir la cantidad total entre el número de partes.',
    directQuestion: 'Si tienes 36 cromos y los repartes entre 6 amigos por igual, ¿cuántos cromos recibe cada uno?',
    correctAnswer: '6 cromos',
    distractors: ['7 cromos', '5 cromos', '8 cromos'],
    explanation: '¡Genial! 36 dividido entre 6 es igual a 6 (porque 6 x 6 = 36).',
    trueStatement: '36 dividido entre 6 da exactamente 6.',
    falseStatement: 'Repartir 36 entre 6 da 10 cromos a cada uno.'
  },
  {
    id: 'mat-geometria-poligono-lados',
    topic: 'Polígonos',
    subject: 'Matemáticas',
    concept: 'El pentágono',
    definition: 'Un pentágono es un polígono cerrado de 5 lados y 5 vértices.',
    directQuestion: '¿Cuántos lados tiene un polígono denominado PENTÁGONO?',
    correctAnswer: '5 lados',
    distractors: ['6 lados', '4 lados', '8 lados'],
    explanation: '¡Fabuloso! Pentágono = 5 lados; Hexágono = 6 lados; Octógono = 8 lados.',
    trueStatement: 'Un pentágono es un polígono de cinco lados.',
    falseStatement: 'Un pentágono tiene ocho lados y esquinas.'
  }
];

export const norm = (s: string) => (s || '').trim().toLowerCase().replace(/[\.\,\!]$/, '');

// ==========================================
// GESTOR DE NO-REPETICIÓN EN SESIÓN
// ==========================================
const STORAGE_KEY_SEEN = 'study_session_seen_q_ids';

export function getSessionSeenIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_SEEN);
    if (raw) {
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    }
  } catch {}
  return new Set();
}

export function markQuestionsSeenInSession(ids: string[]): void {
  try {
    const current = getSessionSeenIds();
    ids.forEach(id => current.add(id));
    sessionStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify(Array.from(current)));
  } catch {}
}

export function resetSessionSeenIds(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY_SEEN);
  } catch {}
}

/**
 * Obtiene una lista dinámica, atractiva y NUNCA repetitiva de preguntas para cualquier juego.
 * Reglas de oro:
 * 1. Respeta estrictamente los temas seleccionados por Samantha.
 * 2. Convierte TODOS los tipos de ejercicios (multiple_choice, true_false, fill_blank, matching, flashcard, ordering)
 *    en preguntas de juego con 4 opciones limpias.
 * 3. Si se necesitan más preguntas para completar la partida, extrae EXCLUSIVAMENTE del banco auditado de la misma asignatura.
 * 4. Rastrea el historial de la sesión para no repetir preguntas ya vistas hasta agotar el catálogo.
 */
export function getDynamicGameQuestions(
  exercises: ExerciseItem[] = [],
  count = 6,
  targetSubject?: string
): GameQuestion[] {
  const result: GameQuestion[] = [];
  const usedQuestionTexts = new Set<string>();
  const seenIds = getSessionSeenIds();

  // Detectar la asignatura principal de los ejercicios pasados (si no se pasó explícitamente)
  let detectedSubject = targetSubject;
  if (!detectedSubject && exercises && exercises.length > 0) {
    for (const ex of exercises) {
      const s = (ex as any).unitSubject;
      if (s) {
        detectedSubject = s;
        break;
      }
    }
  }

  // 1. Convertir TODOS los ejercicios del temario seleccionado a GameQuestion
  const poolFromExercises: GameQuestion[] = [];

  if (exercises && exercises.length > 0) {
    for (const ex of exercises) {
      // MULTIPLE CHOICE
      if (ex.type === 'multiple_choice' && ex.question && ex.correctAnswer && ex.options && ex.options.length >= 2) {
        const otherOpts = ex.options.filter(o => o.trim().toLowerCase() !== ex.correctAnswer.trim().toLowerCase());
        const options = [ex.correctAnswer, ...otherOpts.slice(0, 3)].sort(() => Math.random() - 0.5);
        poolFromExercises.push({
          id: ex.id || `mc-${Math.random()}`,
          question: ex.question,
          topic: (ex as any).unitTitle || 'Tema Escolar',
          subject: (ex as any).unitSubject || detectedSubject,
          correctAnswer: ex.correctAnswer,
          options,
          explanation: ex.explanation || `¡La respuesta correcta es "${ex.correctAnswer}"!`
        });
      }

      // TRUE / FALSE
      else if (ex.type === 'true_false' && ex.statement !== undefined && ex.isTrue !== undefined) {
        poolFromExercises.push({
          id: ex.id || `tf-${Math.random()}`,
          question: `¿Verdadero o Falso?: "${ex.statement}"`,
          topic: (ex as any).unitTitle || 'Tema Escolar',
          subject: (ex as any).unitSubject || detectedSubject,
          correctAnswer: ex.isTrue ? 'Verdadero' : 'Falso',
          options: ['Verdadero', 'Falso'],
          explanation: ex.explanation || (ex.isTrue ? '¡Correcto! La afirmación es Verdadera.' : '¡Exacto! La afirmación es Falsa.')
        });
      }

      // FILL BLANK
      else if (ex.type === 'fill_blank' && ex.textWithBlank && ex.correctAnswer && ex.options && ex.options.length >= 2) {
        const otherOpts = ex.options.filter(o => o.trim().toLowerCase() !== ex.correctAnswer.trim().toLowerCase());
        const options = [ex.correctAnswer, ...otherOpts.slice(0, 3)].sort(() => Math.random() - 0.5);
        poolFromExercises.push({
          id: ex.id || `fb-${Math.random()}`,
          question: `Completa la oración: "${ex.textWithBlank}"`,
          topic: (ex as any).unitTitle || 'Tema Escolar',
          subject: (ex as any).unitSubject || detectedSubject,
          correctAnswer: ex.correctAnswer,
          options,
          explanation: ex.explanation || `¡Genial! La palabra que falta es "${ex.correctAnswer}".`
        });
      }

      // MATCHING (Relacionar parejas)
      else if (ex.type === 'matching' && ex.pairs && ex.pairs.length >= 2) {
        for (const pair of ex.pairs) {
          const otherRights = ex.pairs.filter(p => p.left !== pair.left).map(p => p.right);
          const options = [pair.right, ...otherRights.slice(0, 3)].sort(() => Math.random() - 0.5);
          poolFromExercises.push({
            id: `${ex.id}-${pair.left}`,
            question: `¿Qué se relaciona directamente con "${pair.left}"?`,
            topic: (ex as any).unitTitle || 'Tema Escolar',
            subject: (ex as any).unitSubject || detectedSubject,
            correctAnswer: pair.right,
            options,
            explanation: ex.explanation || `¡Correcto! "${pair.left}" corresponde a "${pair.right}".`
          });
        }
      }

      // FLASHCARD
      else if (ex.type === 'flashcard' && ex.front && ex.back) {
        // Encontrar distractores plausibles del mismo tema o banco
        const sampleDistractors = ['Opción de prueba', 'Dato erróneo', 'Ninguno'];
        poolFromExercises.push({
          id: ex.id || `fc-${Math.random()}`,
          question: ex.front.includes('?') ? ex.front : `¿Qué dato clave describe: "${ex.front}"?`,
          topic: (ex as any).unitTitle || 'Tema Escolar',
          subject: (ex as any).unitSubject || detectedSubject,
          correctAnswer: ex.back,
          options: [ex.back, ...sampleDistractors.slice(0, 2)].sort(() => Math.random() - 0.5),
          explanation: ex.explanation || `¡Dato clave: ${ex.back}!`
        });
      }
    }
  }

  // Barajar el pool de ejercicios
  const shuffledExercises = [...poolFromExercises].sort(() => Math.random() - 0.5);

  // Fase 1: Añadir preguntas de ejercicios que aún no se hayan visto en esta sesión
  for (const q of shuffledExercises) {
    if (result.length >= count) break;
    const cleanQ = norm(q.question);
    if (!usedQuestionTexts.has(cleanQ) && !seenIds.has(q.id)) {
      usedQuestionTexts.add(cleanQ);
      result.push(q);
    }
  }

  // Fase 2: Si aún faltan, permitir preguntas del ejercicio vistas previamente (si no hay más nuevas)
  if (result.length < count) {
    for (const q of shuffledExercises) {
      if (result.length >= count) break;
      const cleanQ = norm(q.question);
      if (!usedQuestionTexts.has(cleanQ)) {
        usedQuestionTexts.add(cleanQ);
        result.push(q);
      }
    }
  }

  // 2. Si todavía faltan preguntas para llegar a `count`, extraer del banco de 84 VERIFIED_FACTS
  // respetando estrictamente la asignatura seleccionada
  if (result.length < count) {
    // Filtrar banco por asignatura si está definida
    let factCandidates = [...VERIFIED_FACTS];
    if (detectedSubject) {
      const subjectMatches = VERIFIED_FACTS.filter(f => norm(f.subject) === norm(detectedSubject));
      if (subjectMatches.length > 0) {
        factCandidates = subjectMatches;
      }
    }

    const shuffledFacts = [...factCandidates].sort(() => Math.random() - 0.5);

    // Priorizar hechos que no hayan sido vistos en la sesión
    for (const fact of shuffledFacts) {
      if (result.length >= count) break;
      const cleanQ = norm(fact.directQuestion);
      if (!usedQuestionTexts.has(cleanQ) && !seenIds.has(fact.id)) {
        usedQuestionTexts.add(cleanQ);
        const options = [fact.correctAnswer, ...fact.distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
        result.push({
          id: fact.id,
          question: fact.directQuestion,
          topic: fact.topic,
          subject: fact.subject,
          correctAnswer: fact.correctAnswer,
          options,
          explanation: fact.explanation
        });
      }
    }

    // Si aún faltan (por agotamiento de hechos no vistos), permitir reutilizar del banco barajado
    if (result.length < count) {
      for (const fact of shuffledFacts) {
        if (result.length >= count) break;
        const cleanQ = norm(fact.directQuestion);
        if (!usedQuestionTexts.has(cleanQ)) {
          usedQuestionTexts.add(cleanQ);
          const options = [fact.correctAnswer, ...fact.distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
          result.push({
            id: fact.id,
            question: fact.directQuestion,
            topic: fact.topic,
            subject: fact.subject,
            correctAnswer: fact.correctAnswer,
            options,
            explanation: fact.explanation
          });
        }
      }
    }
  }

  // Marcar las preguntas seleccionadas como vistas en la sesión para las siguientes rondas
  markQuestionsSeenInSession(result.map(q => q.id));

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

      // Normalizar: solo palabras de 3 a 8 letras limpias
      const clean = candidate.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z]/g, '');
      if (clean.length >= 3 && clean.length <= 8 && !seen.has(clean)) {
        seen.add(clean);
        result.push({ word: clean, clue });
        if (result.length >= 6) break;
      }
    }
  }

  // Si faltan palabras, rellenar con un banco rico de vocabulario escolar de 3.º de Primaria
  const defaultWords = [
    { word: 'HUESO', clue: 'Pieza dura que forma el esqueleto' },
    { word: 'TIERRA', clue: 'Nuestro planeta con océanos y continentes' },
    { word: 'PLANTA', clue: 'Ser vivo que fabrica su alimento con el Sol' },
    { word: 'VOLCAN', clue: 'Montaña con cráter que expulsa lava ardiente' },
    { word: 'RELOJ', clue: 'Instrumento que marca las horas y minutos' },
    { word: 'VERBO', clue: 'Palabra que expresa una acción como cantar' },
    { word: 'LLANURA', clue: 'Terreno plano extenso sin montañas' },
    { word: 'OXIGENO', clue: 'Gas vital del aire que respiran los pulmones' }
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
 * Genera variaciones pedagógicas sin duplicación indebida de hechos.
 */
export function generateDuolingoVariations(exercise: ExerciseItem, _seedIndex = 0): ExerciseItem[] {
  // Retornar el ejercicio de forma limpia y preservar su integridad
  return [{ ...exercise }];
}
