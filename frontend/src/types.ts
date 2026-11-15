export type ExerciseType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'ordering'
  | 'matching'
  | 'flashcard';

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  explanation: string;
  hint?: string;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple_choice';
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface TrueFalseExercise extends BaseExercise {
  type: 'true_false';
  statement: string;
  isTrue: boolean;
}

export interface FillBlankExercise extends BaseExercise {
  type: 'fill_blank';
  textWithBlank: string;
  options: string[];
  correctAnswer: string;
}

export interface OrderingExercise extends BaseExercise {
  type: 'ordering';
  instruction: string;
  items: string[]; // en orden correcto original
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface MatchingExercise extends BaseExercise {
  type: 'matching';
  instruction: string;
  pairs: MatchingPair[];
}

export interface FlashcardExercise extends BaseExercise {
  type: 'flashcard';
  front: string;
  back: string;
  tip?: string;
}

export type ExerciseItem =
  | MultipleChoiceExercise
  | TrueFalseExercise
  | FillBlankExercise
  | OrderingExercise
  | MatchingExercise
  | FlashcardExercise;

export interface ExerciseSet {
  title: string;
  subject: string;
  summary: string;
  estimatedMinutes?: number;
  exercises: ExerciseItem[];
}

export interface UnitSummary {
  id: string;
  title: string;
  subject: string;
  summary: string;
  estimated_minutes: number;
  created_at: string;
  exercise_count: number;
}

export interface UserProfile {
  id?: string;
  name: string;
  email?: string | null;
  stars: number;
  currentStreak: number;
  bestStreak: number;
  lastStudyDate?: string;
  mascot: string;
}

export interface ReviewItem {
  srsId: string;
  exerciseId: string;
  unitTitle: string;
  subject: string;
  exercise: ExerciseItem;
}
