/**
 * Validador inteligente y pedagógico de respuestas escritas para 3.º de Primaria (8 años).
 * 
 * Diseñado con pedagogía constructiva:
 * - Acepta respuestas correctas tanto con tildes como sin tildes, pero añade una nota de ortografía educativa si faltaba la tilde.
 * - Tolera artículos iniciales ("el perro" === "perro", "la raíz" === "raíz", "un mamífero" === "mamífero").
 * - Soporta números tanto en dígitos como en letras ("60" === "sesenta", "56" === "cincuenta y seis", "100" === "cien").
 * - Tolera sinónimos comunes del currículo escolar ("cima" o "cumbre", "fotosíntesis" o "fabricar alimento").
 * - Permite 1 errata tipográfica leve en palabras largas para no frustrar a niños que teclean en iPad.
 */

export interface ValidationResult {
  isCorrect: boolean;
  userClean: string;
  expectedClean: string;
  spellingTip?: string;
  feedbackNote?: string;
}

// Mapa de números a palabras en español
const NUMBER_WORDS: Record<string, string> = {
  '0': 'cero',
  '1': 'uno',
  '2': 'dos',
  '3': 'tres',
  '4': 'cuatro',
  '5': 'cinco',
  '6': 'seis',
  '7': 'siete',
  '8': 'ocho',
  '9': 'nueve',
  '10': 'diez',
  '15': 'quince',
  '20': 'veinte',
  '24': 'veinticuatro',
  '30': 'treinta',
  '42': 'cuarenta y dos',
  '43': 'cuarenta y tres',
  '48': 'cuarenta y ocho',
  '50': 'cincuenta',
  '54': 'cincuenta y cuatro',
  '56': 'cincuenta y seis',
  '60': 'sesenta',
  '64': 'sesenta y cuatro',
  '81': 'ochenta y uno',
  '100': 'cien',
  '200': 'doscientos',
  '500': 'quinientos',
  '1000': 'mil',
  '1.000': 'mil',
  '3520': 'tres mil quinientos veinte',
  '3.520': 'tres mil quinientos veinte'
};

/**
 * Normaliza una cadena eliminando puntuación, espacios extra y pasando a minúsculas
 */
export function cleanString(s: string): string {
  if (!s) return '';
  return s
    .trim()
    .toLowerCase()
    .replace(/[¿?¡!.,:;()\[\]"']/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Elimina acentos/tildes para comparación fonética tolerante
 */
export function stripAccents(s: string): string {
  return cleanString(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Elimina artículos determinados e indeterminados al inicio de la frase
 */
export function stripArticles(s: string): string {
  const words = cleanString(s).split(' ');
  const articles = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'al', 'del', 'en', 'de'];
  while (words.length > 1 && articles.includes(words[0])) {
    words.shift();
  }
  return words.join(' ');
}

/**
 * Distancia de Levenshtein para medir erratas tipográficas en iPad
 */
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // sustitución
          matrix[i][j - 1] + 1,     // inserción
          matrix[i - 1][j] + 1      // eliminación
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Genera posibles variantes válidas de una respuesta correcta
 * (por ejemplo: "La cima o cumbre" genera ["cima", "cumbre", "la cima", "la cumbre", "cima o cumbre"])
 */
export function generateValidVariants(correctAnswer: string): string[] {
  const rawClean = cleanString(correctAnswer);
  const variants = new Set<string>();

  variants.add(rawClean);
  variants.add(stripAccents(rawClean));
  variants.add(stripArticles(rawClean));
  variants.add(stripAccents(stripArticles(rawClean)));

  // Si contiene "o" (ej: "cima o cumbre"), separar en alternativas
  if (rawClean.includes(' o ')) {
    const parts = rawClean.split(' o ');
    for (const p of parts) {
      const cleanP = cleanString(p);
      variants.add(cleanP);
      variants.add(stripAccents(cleanP));
      variants.add(stripArticles(cleanP));
      variants.add(stripAccents(stripArticles(cleanP)));
    }
  }

  // Si contiene números en dígitos o letras
  for (const [digit, word] of Object.entries(NUMBER_WORDS)) {
    if (rawClean.includes(digit)) {
      const replaced = rawClean.replace(new RegExp(`\\b${digit}\\b`, 'g'), word);
      variants.add(replaced);
      variants.add(stripArticles(replaced));
      variants.add(stripAccents(stripArticles(replaced)));
    }
    if (rawClean.includes(word)) {
      const replaced = rawClean.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
      variants.add(replaced);
      variants.add(stripArticles(replaced));
      variants.add(stripAccents(stripArticles(replaced)));
    }
  }

  // Tratamiento especial de Verdadero / Falso (V / F)
  if (rawClean === 'verdadero') {
    variants.add('v');
    variants.add('verdad');
    variants.add('si');
    variants.add('sí');
  } else if (rawClean === 'falso') {
    variants.add('f');
    variants.add('no');
  }

  return Array.from(variants).filter(v => v.length > 0);
}

/**
 * Valida la respuesta escrita por el alumno frente a la respuesta correcta esperada.
 */
export function validateWrittenAnswer(
  userInput: string,
  correctAnswer: string,
  options: string[] = []
): ValidationResult {
  const uClean = cleanString(userInput);
  const uNoAccent = stripAccents(userInput);
  const uNoArticle = stripArticles(userInput);
  const uNoAccentNoArticle = stripAccents(uNoArticle);

  if (!uClean) {
    return {
      isCorrect: false,
      userClean: '',
      expectedClean: correctAnswer,
      feedbackNote: 'Escribe tu respuesta para comprobarla.'
    };
  }

  const validVariants = generateValidVariants(correctAnswer);

  // 1. Coincidencia exacta o por variantes
  let matched = false;
  let exactAccentMatch = false;

  for (const v of validVariants) {
    if (uClean === v || uNoArticle === v) {
      matched = true;
      exactAccentMatch = true;
      break;
    }
    if (uNoAccent === v || uNoAccentNoArticle === v) {
      matched = true;
      break;
    }
  }

  // 2. Coincidencia si el texto del usuario está contenido en una variante larga
  // Ejemplo: usuario escribe "pacifico" y la respuesta es "El Océano Pacífico"
  if (!matched) {
    for (const v of validVariants) {
      if (v.length > 3 && (v.includes(uNoAccentNoArticle) || uNoAccentNoArticle.includes(v))) {
        // Asegurarse de que no sea solo una letra
        if (uNoAccentNoArticle.length >= 3) {
          matched = true;
          break;
        }
      }
    }
  }

  // 3. Tolerancia de 1 errata leve en palabras de más de 4 letras (para errores de tecleo en iPad)
  if (!matched && uNoAccentNoArticle.length >= 4) {
    for (const v of validVariants) {
      const dist = levenshtein(uNoAccentNoArticle, stripAccents(stripArticles(v)));
      if (dist <= 1) {
        matched = true;
        break;
      }
    }
  }

  // 4. Comprobar si coincide con alguna de las opciones incorrectas (distractores)
  if (!matched && options.length > 0) {
    for (const opt of options) {
      if (cleanString(opt) === cleanString(correctAnswer)) continue;
      const optClean = stripAccents(stripArticles(opt));
      if (uNoAccentNoArticle === optClean || levenshtein(uNoAccentNoArticle, optClean) <= 1) {
        return {
          isCorrect: false,
          userClean: userInput,
          expectedClean: correctAnswer,
          feedbackNote: `Has puesto "${opt}", pero la respuesta correcta es "${correctAnswer}".`
        };
      }
    }
  }

  // Comprobar si faltaba una tilde para dar feedback de refuerzo ortográfico amigable
  let spellingTip: string | undefined;
  if (matched && !exactAccentMatch && correctAnswer.match(/[áéíóúÁÉÍÓÚ]/)) {
    spellingTip = `¡Muy bien! Recuerda para tus exámenes que se escribe con tilde: "${correctAnswer}".`;
  }

  return {
    isCorrect: matched,
    userClean: userInput,
    expectedClean: correctAnswer,
    spellingTip,
    feedbackNote: matched
      ? (spellingTip || `¡Respuesta exacta! "${correctAnswer}" es totalmente correcto.`)
      : `No es exacto. La respuesta correcta era "${correctAnswer}".`
  };
}
