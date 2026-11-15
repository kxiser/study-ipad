import { describe, it, expect } from 'vitest';
import { calculateNextReview, getTodayDateString } from '../src/db/srs.js';

describe('Algoritmo de Repetición Espaciada (SRS)', () => {
  it('un nuevo acierto programa el repaso para mañana (1 día)', () => {
    const next = calculateNextReview(null, true);
    expect(next.intervalDays).toBe(1);
    expect(next.repetitions).toBe(1);
    expect(next.timesCorrect).toBe(1);
    expect(next.timesIncorrect).toBe(0);
    expect(next.nextReviewDate).toBe(getTodayDateString(1));
  });

  it('un segundo acierto consecutivo sube a 3 días', () => {
    const step1 = calculateNextReview(null, true);
    const step2 = calculateNextReview(step1, true);
    expect(step2.intervalDays).toBe(3);
    expect(step2.repetitions).toBe(2);
  });

  it('un tercer acierto consecutivo sube a 7 días', () => {
    const step1 = calculateNextReview(null, true);
    const step2 = calculateNextReview(step1, true);
    const step3 = calculateNextReview(step2, true);
    expect(step3.intervalDays).toBe(7);
    expect(step3.repetitions).toBe(3);
  });

  it('un fallo no destruye el progreso pero vuelve a programar para mañana (1 día)', () => {
    const step1 = calculateNextReview(null, true);
    const step2 = calculateNextReview(step1, true); // interval 3
    const step3 = calculateNextReview(step2, false); // falló
    expect(step3.intervalDays).toBe(1);
    expect(step3.repetitions).toBe(0);
    expect(step3.timesIncorrect).toBe(1);
    expect(step3.nextReviewDate).toBe(getTodayDateString(1));
  });
});
