import { ExerciseSetSchema, ExerciseSet } from '../schemas/exercise.schema.js';

/**
 * Normaliza y sanea las respuestas generadas por los modelos de IA (Gemini, Claude, Ollama)
 * evitando fallbacks erróneos (como 'palabra' o asumir options[0]).
 */
export function normalizeRawExerciseSet(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;

  const normalized: any = {
    title: raw.title || 'Actividades de Estudio',
    subject: raw.subject || 'Ciencias Naturales',
    summary: raw.summary || 'Juegos didácticos para aprender y repasar.',
    estimatedMinutes: raw.estimatedMinutes || 7,
    exercises: []
  };

  const rawExercises = Array.isArray(raw.exercises) ? raw.exercises : [];

  normalized.exercises = rawExercises.map((ex: any, idx: number) => {
    if (!ex || typeof ex !== 'object') return null;

    // Detectar y normalizar el tipo
    let type = String(ex.type || '').toLowerCase();
    if (type.includes('choice') || type.includes('multiple') || type.includes('opcion') || type.includes('quiz') || type.includes('test')) {
      type = 'multiple_choice';
    } else if (type.includes('true') || type.includes('false') || type.includes('verdadero') || type.includes('falso') || type === 'tf') {
      type = 'true_false';
    } else if (type.includes('blank') || type.includes('fill') || type.includes('completar') || type.includes('hueco')) {
      type = 'fill_blank';
    } else if (type.includes('order') || type.includes('ordenar') || type.includes('sequence') || type.includes('secuencia')) {
      type = 'ordering';
    } else if (type.includes('match') || type.includes('unir') || type.includes('pareja') || type.includes('relacionar')) {
      type = 'matching';
    } else if (type.includes('card') || type.includes('tarjeta') || type.includes('flash')) {
      type = 'flashcard';
    } else {
      if (ex.options && ex.options.length >= 2) {
        type = 'multiple_choice';
      } else if (typeof ex.isTrue !== 'undefined' || typeof ex.is_true !== 'undefined') {
        type = 'true_false';
      } else if (ex.pairs) {
        type = 'matching';
      } else if (ex.items) {
        type = 'ordering';
      } else {
        type = 'multiple_choice';
      }
    }

    const explanation = String(ex.explanation || ex.feedback || ex.razon || '¡Muy buen trabajo!');

    const base: any = {
      id: ex.id ? String(ex.id) : `ex-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      explanation
    };

    if (ex.hint) base.hint = String(ex.hint);

    // ==========================================
    // MULTIPLE CHOICE
    // ==========================================
    if (type === 'multiple_choice') {
      base.question = ex.question || ex.enunciado || ex.statement || 'Selecciona la opción correcta:';
      let options = Array.isArray(ex.options)
        ? ex.options.map((o: any) => String(o).trim()).filter((o: string) => o.toLowerCase() !== 'palabra')
        : [];
      if (options.length < 2) {
        options = ['Opción A', 'Opción B'];
      }
      base.options = options.slice(0, 4);

      // Resolver respuesta correcta con alta tolerancia
      base.correctAnswer = resolveCorrectOption(
        ex.correctAnswer ?? ex.correct ?? ex.respuesta ?? ex.answer,
        base.options,
        explanation
      );
    }

    // ==========================================
    // TRUE / FALSE
    // ==========================================
    else if (type === 'true_false') {
      base.statement = ex.statement || ex.question || ex.afirmacion || '¿Es verdadero o falso?';

      let rawVal = ex.isTrue ?? ex.is_true ?? ex.correctAnswer ?? ex.correct ?? ex.answer ?? ex.respuesta;
      let isTrue = false;

      if (typeof rawVal === 'boolean') {
        isTrue = rawVal;
      } else if (typeof rawVal === 'number') {
        isTrue = rawVal === 1;
      } else if (typeof rawVal === 'string') {
        const lower = rawVal.trim().toLowerCase();
        isTrue = lower === 'true' || lower === 'verdadero' || lower === 'v' || lower === 'si' || lower === 'sí' || lower === 'cierto';
      } else {
        // Analizar la explicación si no viene el booleano
        const lowerExp = explanation.toLowerCase();
        if (
          (lowerExp.includes('¡exacto!') || lowerExp.includes('¡muy bien!') || lowerExp.includes('¡correcto!')) &&
          !lowerExp.includes('en realidad') && !lowerExp.includes('falso') && !lowerExp.includes('casi')
        ) {
          isTrue = true;
        }
      }

      base.isTrue = isTrue;
    }

    // ==========================================
    // FILL IN THE BLANK
    // ==========================================
    else if (type === 'fill_blank') {
      let text = String(ex.textWithBlank || ex.sentence || ex.frase || ex.question || '').trim();
      let rawCorrect = ex.correctAnswer ?? ex.answer ?? ex.palabra ?? ex.missingWord ?? ex.blankWord ?? ex.target ?? ex.correct;

      let options = Array.isArray(ex.options)
        ? ex.options.map((o: any) => String(o).trim()).filter((o: string) => o.toLowerCase() !== 'palabra')
        : [];

      // Si el texto está casi vacío o solo contiene el hueco
      const contentWithoutBlank = text.replace(/___|\[\.\.\.\]/g, '').trim();
      if (contentWithoutBlank.length < 8) {
        if (explanation && explanation.length > 15) {
          // Extraer frase didáctica de la explicación
          const cleanExp = explanation.replace(/^[¡!¿?A-Za-z\s]+!/i, '').trim();
          text = cleanExp.includes('___') ? cleanExp : `En esta lección aprendemos que el concepto clave es: ___ .`;
        } else {
          text = `Completa la siguiente afirmación con la palabra adecuada: ___ .`;
        }
      }

      // Si no hay hueco, crearlo
      if (!text.includes('___') && !text.includes('[...]')) {
        text = `${text} ___ .`;
      }
      base.textWithBlank = text;

      // Resolver respuesta correcta evitando 'palabra'
      let correct = resolveCorrectOption(rawCorrect, options, explanation);

      if (!correct || correct.toLowerCase() === 'palabra') {
        // Extraer de las opciones aquella que aparezca en la explicación
        const matchInExp = options.find((opt: string) => opt && explanation.toLowerCase().includes(opt.toLowerCase()));
        correct = matchInExp || options[0] || 'respuesta';
      }

      base.correctAnswer = correct;

      if (!options.includes(base.correctAnswer)) {
        options.push(base.correctAnswer);
      }
      if (options.length < 2) {
        options.push('otra opción');
      }
      base.options = options.slice(0, 4);
    }

    // ==========================================
    // ORDERING
    // ==========================================
    else if (type === 'ordering') {
      base.instruction = ex.instruction || ex.question || ex.instruccion || 'Ordena los pasos correctamente:';
      let items = Array.isArray(ex.items) ? ex.items.map(String) : (Array.isArray(ex.steps) ? ex.steps.map(String) : []);
      if (items.length < 2) {
        items = ['Paso 1', 'Paso 2', 'Paso 3'];
      }
      base.items = items.slice(0, 5);
    }

    // ==========================================
    // MATCHING
    // ==========================================
    else if (type === 'matching') {
      base.instruction = ex.instruction || ex.question || ex.instruccion || 'Une cada pareja:';
      let rawPairs = Array.isArray(ex.pairs) ? ex.pairs : [];
      base.pairs = rawPairs
        .map((p: any) => {
          if (Array.isArray(p)) {
            return { left: String(p[0] || '').trim(), right: String(p[1] || '').trim() };
          }
          return {
            left: String(p.left || p.concepto || p.termino || p.item || '').trim(),
            right: String(p.right || p.definicion || p.pareja || p.valor || '').trim()
          };
        })
        .filter((p: any) => {
          const l = p.left.toLowerCase();
          const r = p.right.toLowerCase();
          // Prohibir terminantemente 'Concepto' y 'Definición'
          return l && r && l !== 'concepto' && r !== 'definición' && r !== 'definicion';
        })
        .slice(0, 5);

      if (base.pairs.length < 2) {
        base.pairs = [
          { left: 'Ejemplo A', right: 'Descripción A' },
          { left: 'Ejemplo B', right: 'Descripción B' }
        ];
      }
    }

    // ==========================================
    // FLASHCARD
    // ==========================================
    else if (type === 'flashcard') {
      base.front = String(ex.front || ex.anverso || ex.question || 'Concepto clave');
      base.back = String(ex.back || ex.reverso || ex.answer || 'Explicación detallada');
      if (ex.tip) base.tip = String(ex.tip);
    }

    return base;
  }).filter(Boolean);

  return normalized;
}

/**
 * Resuelve qué opción es la correcta considerando índices 0-based, 1-based, letras A/B/C y menciones en la explicación.
 */
function resolveCorrectOption(rawCorrect: any, options: string[], explanation?: string): string {
  if (options.length === 0) return 'opción';

  // Si es un número (ej: 0, 1, 2)
  if (typeof rawCorrect === 'number') {
    if (rawCorrect >= 0 && rawCorrect < options.length) {
      return options[rawCorrect];
    }
    if (rawCorrect >= 1 && rawCorrect <= options.length) {
      return options[rawCorrect - 1];
    }
  }

  if (typeof rawCorrect === 'string') {
    const trimmed = rawCorrect.trim();

    // Si es un string numérico ("0", "1", "2")
    const num = parseInt(trimmed, 10);
    if (!isNaN(num)) {
      if (num >= 0 && num < options.length) return options[num];
      if (num >= 1 && num <= options.length) return options[num - 1];
    }

    // Si es una letra ("A", "B", "C", "D")
    const upper = trimmed.toUpperCase();
    if (upper === 'A' && options.length > 0) return options[0];
    if (upper === 'B' && options.length > 1) return options[1];
    if (upper === 'C' && options.length > 2) return options[2];
    if (upper === 'D' && options.length > 3) return options[3];

    // Si coincide con alguna opción
    const exactMatch = options.find(o => o.toLowerCase() === trimmed.toLowerCase());
    if (exactMatch) return exactMatch;

    // Si la opción está contenida
    const partialMatch = options.find(o => o.toLowerCase().includes(trimmed.toLowerCase()) || trimmed.toLowerCase().includes(o.toLowerCase()));
    if (partialMatch && trimmed.toLowerCase() !== 'palabra') return partialMatch;
  }

  // Si la explicación menciona explícitamente alguna de las opciones, esa es la ganadora
  if (explanation) {
    const lowerExp = explanation.toLowerCase();
    for (const opt of options) {
      if (opt && opt.length >= 3 && lowerExp.includes(opt.toLowerCase())) {
        return opt;
      }
    }
  }

  // Fallback seguro a la primera opción no vacía
  return options[0] || 'opción';
}

export function parseAndValidateExerciseSet(rawText: string): { success: true; data: ExerciseSet } | { success: false; error: string } {
  try {
    let clean = rawText.trim();
    if (clean.includes('```')) {
      const match = clean.match(/```(?:json)?([\s\S]*?)```/);
      if (match) clean = match[1].trim();
    }

    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(clean);
    const normalized = normalizeRawExerciseSet(parsed);
    const validated = ExerciseSetSchema.parse(normalized);

    return {
      success: true,
      data: validated
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Error de validación del set de ejercicios.'
    };
  }
}
