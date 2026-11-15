import { z } from 'zod';

const IdSchema = z.union([z.string(), z.number()]).transform(v => String(v)).default(() => Math.random().toString(36).substring(2, 9));
const StringOrNumberToString = z.union([z.string(), z.number()]).transform(v => String(v));

export const MultipleChoiceSchema = z.object({
  id: IdSchema,
  type: z.literal('multiple_choice'),
  question: z.string().min(2),
  options: z.array(StringOrNumberToString).min(2).max(5),
  correctAnswer: StringOrNumberToString,
  explanation: z.string().default('¡Gran respuesta! Continúa así.'),
  hint: z.string().optional()
});

export const TrueFalseSchema = z.object({
  id: IdSchema,
  type: z.literal('true_false'),
  statement: z.string().min(2),
  isTrue: z.union([z.boolean(), z.string(), z.number()]).transform(v => {
    if (typeof v === 'boolean') return v;
    const str = String(v).trim().toLowerCase();
    return str === 'true' || str === 'verdadero' || str === '1' || str === 'si' || str === 'sí';
  }),
  explanation: z.string().default('¡Muy bien observado!'),
  hint: z.string().optional()
});

export const FillBlankSchema = z.object({
  id: IdSchema,
  type: z.literal('fill_blank'),
  textWithBlank: z.string().min(2).refine(val => val.includes('___') || val.includes('[...]'), {
    message: "Debe contener '___' para marcar el hueco"
  }),
  options: z.array(StringOrNumberToString).min(2).max(6),
  correctAnswer: StringOrNumberToString,
  explanation: z.string().default('¡Excelente deducción!'),
  hint: z.string().optional()
});

export const OrderingSchema = z.object({
  id: IdSchema,
  type: z.literal('ordering'),
  instruction: z.string().default('Ordena los siguientes pasos en la secuencia correcta:'),
  items: z.array(StringOrNumberToString).min(2).max(6),
  explanation: z.string().default('¡Has ordenado los pasos a la perfección!'),
  hint: z.string().optional()
});

export const MatchingPairSchema = z.object({
  left: StringOrNumberToString,
  right: StringOrNumberToString
});

export const MatchingSchema = z.object({
  id: IdSchema,
  type: z.literal('matching'),
  instruction: z.string().default('Relaciona cada pareja correspondiente:'),
  pairs: z.array(MatchingPairSchema).min(2).max(6),
  explanation: z.string().default('¡Todas las parejas están correctas!'),
  hint: z.string().optional()
});

export const FlashcardSchema = z.object({
  id: IdSchema,
  type: z.literal('flashcard'),
  front: StringOrNumberToString,
  back: StringOrNumberToString,
  tip: z.string().optional(),
  explanation: z.string().default('¡Dato clave guardado en tu memoria!')
});

export const ExerciseItemSchema = z.discriminatedUnion('type', [
  MultipleChoiceSchema,
  TrueFalseSchema,
  FillBlankSchema,
  OrderingSchema,
  MatchingSchema,
  FlashcardSchema
]);

export const ExerciseSetSchema = z.object({
  title: z.string().min(2),
  subject: z.string().default('General'),
  summary: z.string().default('Actividades de aprendizaje y repaso.'),
  estimatedMinutes: z.number().int().min(1).max(25).default(7),
  exercises: z.array(ExerciseItemSchema).min(2).max(15)
});

export type ExerciseItem = z.infer<typeof ExerciseItemSchema>;
export type ExerciseSet = z.infer<typeof ExerciseSetSchema>;
export type MultipleChoice = z.infer<typeof MultipleChoiceSchema>;
export type TrueFalse = z.infer<typeof TrueFalseSchema>;
export type FillBlank = z.infer<typeof FillBlankSchema>;
export type Ordering = z.infer<typeof OrderingSchema>;
export type Matching = z.infer<typeof MatchingSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>;
