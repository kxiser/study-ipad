import { ExerciseSet, UnitSummary, UserProfile, ReviewItem } from '../types.js';

const CACHE_UNITS_KEY = 'study_cached_units_v10';
const CACHE_PROFILE_KEY = 'study_cached_profile';
const PENDING_ANSWERS_KEY = 'study_pending_answers';
const PENDING_SESSIONS_KEY = 'study_pending_sessions';

export interface PendingAnswer {
  exerciseId: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface PendingSession {
  unitId?: string;
  sessionType: 'new' | 'review';
  durationSeconds: number;
  totalQuestions: number;
  correctAnswers: number;
  starsEarned: number;
  timestamp: string;
}

export const LocalStore = {
  // Caché de unidades para jugar offline
  cacheUnit(id: string, unit: ExerciseSet) {
    try {
      const all = LocalStore.getAllCachedUnits();
      all[id] = { ...unit, cachedAt: new Date().toISOString() };
      localStorage.setItem(CACHE_UNITS_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn('Error guardando unidad en caché', e);
    }
  },

  getAllCachedUnits(): Record<string, ExerciseSet & { cachedAt: string }> {
    try {
      const data = localStorage.getItem(CACHE_UNITS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  getCachedUnit(id: string): ExerciseSet | null {
    const all = LocalStore.getAllCachedUnits();
    return all[id] || null;
  },

  // Perfil
  cacheProfile(profile: UserProfile) {
    try {
      localStorage.setItem(CACHE_PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {}
  },

  getCachedProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(CACHE_PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Cola de respuestas offline
  queueAnswer(exerciseId: string, isCorrect: boolean) {
    try {
      const pending = LocalStore.getPendingAnswers();
      pending.push({
        exerciseId,
        isCorrect,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(PENDING_ANSWERS_KEY, JSON.stringify(pending));
    } catch (e) {}
  },

  getPendingAnswers(): PendingAnswer[] {
    try {
      const data = localStorage.getItem(PENDING_ANSWERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  clearPendingAnswers() {
    localStorage.removeItem(PENDING_ANSWERS_KEY);
  },

  // Cola de sesiones offline
  queueSession(session: PendingSession) {
    try {
      const pending = LocalStore.getPendingSessions();
      pending.push(session);
      localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(pending));
    } catch (e) {}
  },

  getPendingSessions(): PendingSession[] {
    try {
      const data = localStorage.getItem(PENDING_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  clearPendingSessions() {
    localStorage.removeItem(PENDING_SESSIONS_KEY);
  }
};
