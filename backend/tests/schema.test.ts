import { describe, it, expect } from 'vitest';
import {
  ExerciseSetSchema,
  MultipleChoiceSchema,
  TrueFalseSchema,
  FillBlankSchema,
  OrderingSchema,
  MatchingSchema,
  FlashcardSchema
} from '../src/schemas/exercise.schema.js';
import { parseAndValidateExerciseSet } from '../src/providers/validate.js';

describe('Esquemas Zod de Ejercicios para 8 años', () => {
  it('debe validar un ejercicio de opción múltiple correctamente', () => {
    const validMC = {
      type: 'multiple_choice',
      question: '¿Cuántos días tiene una semana?',
      options: ['5 días', '7 días', '10 días'],
      correctAnswer: '7 días',
      explanation: '¡Muy bien! Lunes, martes, miércoles, jueves, viernes, sábado y domingo.'
    };
    const result = MultipleChoiceSchema.safeParse(validMC);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBeDefined();
    }
  });

  it('debe validar verdadero / falso', () => {
    const validTF = {
      type: 'true_false',
      statement: 'El Sol sale por el Este.',
      isTrue: true,
      explanation: '¡Exacto! Cada mañana el Sol asoma por el Este.'
    };
    const result = TrueFalseSchema.safeParse(validTF);
    expect(result.success).toBe(true);
  });

  it('debe exigir el marcador de hueco ___ en fill_blank', () => {
    const invalidFB = {
      type: 'fill_blank',
      textWithBlank: 'Los pájaros vuelan alto en el cielo.',
      options: ['vuelan', 'nadan'],
      correctAnswer: 'vuelan',
      explanation: 'Explicación'
    };
    const invalidResult = FillBlankSchema.safeParse(invalidFB);
    expect(invalidResult.success).toBe(false);

    const validFB = {
      ...invalidFB,
      textWithBlank: 'Los pájaros ___ alto en el cielo.'
    };
    const validResult = FillBlankSchema.safeParse(validFB);
    expect(validResult.success).toBe(true);
  });

  it('debe validar ordenación con al menos 3 items', () => {
    const validOrder = {
      type: 'ordering',
      instruction: 'Ordena de menor a mayor:',
      items: ['Uno', 'Dos', 'Tres', 'Cuatro'],
      explanation: '¡Perfecto orden numérico!'
    };
    const result = OrderingSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it('debe validar parejas de matching', () => {
    const validMatch = {
      type: 'matching',
      instruction: 'Une cada animal con su sonido:',
      pairs: [
        { left: 'Perro', right: 'Guau' },
        { left: 'Gato', right: 'Miau' },
        { left: 'Vaca', right: 'Muu' }
      ],
      explanation: '¡Genial! Reconoces todos los sonidos.'
    };
    const result = MatchingSchema.safeParse(validMatch);
    expect(result.success).toBe(true);
  });

  it('debe validar flashcard', () => {
    const validCard = {
      type: 'flashcard',
      front: '¿Cuánto es 6 x 8?',
      back: '48',
      tip: '6 x 7 son 42, más 6 son 48',
      explanation: '¡Tabla del 6 dominada!'
    };
    const result = FlashcardSchema.safeParse(validCard);
    expect(result.success).toBe(true);
  });

  it('debe limpiar bloques markdown ```json ... ``` y validar set completo', () => {
    const rawJsonWithMarkdown = '```json\n' + JSON.stringify({
      title: 'Matemáticas Divertidas',
      subject: 'Matemáticas',
      summary: 'Practica sumas y multiplicaciones fáciles.',
      estimatedMinutes: 5,
      exercises: [
        {
          type: 'multiple_choice',
          question: '¿Cuánto es 5 + 5?',
          options: ['8', '10', '12'],
          correctAnswer: '10',
          explanation: '¡Eso es! Cinco más cinco suman diez.'
        },
        {
          type: 'true_false',
          statement: 'Un triángulo tiene 4 lados.',
          isTrue: false,
          explanation: '¡Correcto! El triángulo tiene 3 lados.'
        },
        {
          type: 'fill_blank',
          textWithBlank: 'Una docena de huevos son ___ huevos.',
          options: ['10', '12', '24'],
          correctAnswer: '12',
          explanation: '¡Eso es! Doce unidades forman una docena.'
        }
      ]
    }) + '\n```';

    const parseResult = parseAndValidateExerciseSet(rawJsonWithMarkdown);
    expect(parseResult.success).toBe(true);
  });
});
