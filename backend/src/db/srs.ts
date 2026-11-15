export interface SRSState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string; // YYYY-MM-DD
  timesCorrect: number;
  timesIncorrect: number;
}

export function getTodayDateString(offsetDays: number = 0): string {
  const date = new Date();
  if (offsetDays !== 0) {
    date.setDate(date.getDate() + offsetDays);
  }
  return date.toISOString().split('T')[0];
}

/**
 * Calcula el siguiente intervalo para repetición espaciada didáctica (8 años)
 * Si acierta: avanza progresivamente (1 día, 3 días, 7 días, 15 días, 30 días)
 * Si falla: vuelve a programarse para mañana (1 día) para afianzar sin castigar.
 */
export function calculateNextReview(
  current: SRSState | null,
  isCorrect: boolean
): SRSState {
  if (!current) {
    if (isCorrect) {
      return {
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 1,
        nextReviewDate: getTodayDateString(1),
        timesCorrect: 1,
        timesIncorrect: 0
      };
    } else {
      return {
        easeFactor: 2.4,
        intervalDays: 1,
        repetitions: 0,
        nextReviewDate: getTodayDateString(1),
        timesCorrect: 0,
        timesIncorrect: 1
      };
    }
  }

  let { easeFactor, intervalDays, repetitions, timesCorrect, timesIncorrect } = current;

  if (isCorrect) {
    timesCorrect += 1;
    repetitions += 1;

    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 3;
    } else if (repetitions === 3) {
      intervalDays = 7;
    } else {
      intervalDays = Math.min(30, Math.round(intervalDays * easeFactor));
    }

    // Aumentar ligeramente facilidad si responde con éxito
    easeFactor = Math.min(2.8, easeFactor + 0.1);
  } else {
    timesIncorrect += 1;
    repetitions = 0; // Se reinicia la racha de este ejercicio específico
    intervalDays = 1; // Mañana vuelve para que lo recuerde fresco
    easeFactor = Math.max(1.8, easeFactor - 0.15);
  }

  const nextReviewDate = getTodayDateString(intervalDays);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    intervalDays,
    repetitions,
    nextReviewDate,
    timesCorrect,
    timesIncorrect
  };
}
