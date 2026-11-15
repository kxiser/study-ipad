import { ExerciseSetSchema, ExerciseSet } from '../schemas/exercise.schema.js';

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
      // Tipo por defecto si no se reconoce
      if (ex.options && ex.options.length >= 2) {
        type = 'multiple_choice';
      } else if (typeof ex.isTrue !== 'undefined') {
        type = 'true_false';
      } else if (ex.pairs) {
        type = 'matching';
      } else if (ex.items) {
        type = 'ordering';
      } else {
        type = 'multiple_choice';
      }
    }

    const base: any = {
      id: ex.id ? String(ex.id) : `ex-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      explanation: ex.explanation || ex.feedback || '¡Muy buen trabajo!'
    };

    if (ex.hint) base.hint = String(ex.hint);

    if (type === 'multiple_choice') {
      base.question = ex.question || ex.enunciado || ex.statement || 'Selecciona la opción correcta:';
      let options = Array.isArray(ex.options) ? ex.options.map(String) : [];
      if (options.length < 2) {
        options = ['Opción A', 'Opción B'];
      }
      base.options = options.slice(0, 4);

      let correct = ex.correctAnswer ?? ex.correct ?? ex.respuesta ?? options[0];
      // Si el LLM envió el índice numérico de la opción (ej: 0, 1, 2)
      if (typeof correct === 'number' && correct >= 0 && correct < options.length) {
        base.correctAnswer = options[correct];
      } else {
        base.correctAnswer = String(correct);
      }
    } else if (type === 'true_false') {
      base.statement = ex.statement || ex.question || ex.afirmacion || '¿Es verdadero o falso?';
      let isTrue = ex.isTrue;
      if (typeof isTrue === 'undefined') {
        isTrue = ex.correctAnswer === true || String(ex.correctAnswer).toLowerCase() === 'verdadero';
      }
      base.isTrue = isTrue;
    } else if (type === 'fill_blank') {
      let text = ex.textWithBlank || ex.sentence || ex.frase || ex.question || '';
      let correct = String(ex.correctAnswer || ex.answer || ex.palabra || '');

      // Asegurar que contenga '___'
      if (!text.includes('___') && !text.includes('[...]')) {
        if (correct && text.includes(correct)) {
          text = text.replace(correct, '___');
        } else {
          text = `${text} ___ .`;
        }
      }
      base.textWithBlank = text;
      base.correctAnswer = correct || 'palabra';

      let options = Array.isArray(ex.options) ? ex.options.map(String) : [];
      if (!options.includes(base.correctAnswer)) {
        options.unshift(base.correctAnswer);
      }
      if (options.length < 2) {
        options.push('otra palabra');
      }
      base.options = options.slice(0, 4);
    } else if (type === 'ordering') {
      base.instruction = ex.instruction || ex.question || ex.instruccion || 'Ordena los pasos correctamente:';
      let items = Array.isArray(ex.items) ? ex.items.map(String) : (Array.isArray(ex.steps) ? ex.steps.map(String) : []);
      if (items.length < 2) {
        items = ['Paso 1', 'Paso 2', 'Paso 3'];
      }
      base.items = items.slice(0, 5);
    } else if (type === 'matching') {
      base.instruction = ex.instruction || ex.question || ex.instruccion || 'Une cada pareja:';
      let rawPairs = Array.isArray(ex.pairs) ? ex.pairs : [];
      base.pairs = rawPairs.map((p: any) => {
        if (Array.isArray(p)) {
          return { left: String(p[0]), right: String(p[1]) };
        }
        return {
          left: String(p.left || p.concepto || p.termino || p.item || 'Concepto'),
          right: String(p.right || p.definicion || p.pareja || p.valor || 'Definición')
        };
      }).slice(0, 5);

      if (base.pairs.length < 2) {
        base.pairs = [
          { left: 'Elemento A', right: 'Definición A' },
          { left: 'Elemento B', right: 'Definición B' }
        ];
      }
    } else if (type === 'flashcard') {
      base.front = String(ex.front || ex.anverso || ex.question || 'Concepto clave');
      base.back = String(ex.back || ex.reverso || ex.answer || 'Explicación detallada');
      if (ex.tip) base.tip = String(ex.tip);
    }

    return base;
  }).filter(Boolean);

  return normalized;
}

export function parseAndValidateExerciseSet(rawText: string): { success: true; data: ExerciseSet } | { success: false; error: string } {
  try {
    let cleaned = rawText.trim();

    // Extraer bloque JSON si viene rodeado de texto
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    const parsed = JSON.parse(cleaned);
    const normalized = normalizeRawExerciseSet(parsed);

    const validated = ExerciseSetSchema.safeParse(normalized);

    if (!validated.success) {
      return {
        success: false,
        error: `Error de validación de esquema: ${validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`
      };
    }

    return {
      success: true,
      data: validated.data
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Error al parsear JSON: ${err.message}`
    };
  }
}
