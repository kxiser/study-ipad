import { ExerciseSet, UnitSummary, UserProfile, ReviewItem } from '../types.js';
import { LocalStore } from './storage.js';

const API_BASE = '/api';

export async function checkServerHealth(): Promise<{ status: string; provider: string; providerName: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Servidor no disponible');
  return res.json();
}

/**
 * Comprime una imagen en el navegador del iPad usando HTMLCanvasElement.
 * Reduce el peso drásticamente (de ~8-15MB a ~300KB) acelerando la subida por WiFi.
 */
export async function compressImage(file: File, maxDimension = 1600, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function scanPages(files: File[], subject?: string): Promise<{ unitId: string; exerciseSet: ExerciseSet }> {
  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    const compressedBlob = await compressImage(files[i]);
    formData.append(`file${i}`, compressedBlob, `page_${i + 1}.jpg`);
  }

  if (subject) {
    formData.append('subject', subject);
  }

  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} al procesar imágenes.`);
  }

  const result = await res.json();
  // Guardar en caché para poder repasarlo offline
  LocalStore.cacheUnit(result.unitId, result.exerciseSet);
  return result;
}

export async function fetchUnits(): Promise<UnitSummary[]> {
  try {
    const res = await fetch(`${API_BASE}/units`);
    if (!res.ok) throw new Error('Error al obtener unidades');
    return await res.json();
  } catch (err) {
    // Si estamos offline, armar lista desde el caché local
    const cached = LocalStore.getAllCachedUnits();
    return Object.entries(cached).map(([id, set]) => ({
      id,
      title: set.title,
      subject: set.subject,
      summary: set.summary,
      estimated_minutes: set.estimatedMinutes || 7,
      created_at: set.cachedAt || new Date().toISOString(),
      exercise_count: set.exercises.length
    }));
  }
}

export async function fetchUnit(id: string): Promise<ExerciseSet> {
  try {
    const res = await fetch(`${API_BASE}/units/${id}`);
    if (!res.ok) throw new Error('Unidad no encontrada');
    const data = await res.json();
    LocalStore.cacheUnit(id, data);
    return data;
  } catch (err) {
    const cached = LocalStore.getCachedUnit(id);
    if (cached) return cached;
    throw err;
  }
}

export async function fetchReviewToday(limit = 8): Promise<ReviewItem[]> {
  try {
    const res = await fetch(`${API_BASE}/review/today?limit=${limit}`);
    if (!res.ok) throw new Error('Error al obtener repaso');
    return await res.json();
  } catch (err) {
    // Fallback offline: tomar ejercicios de las unidades en caché
    const all = LocalStore.getAllCachedUnits();
    const items: ReviewItem[] = [];
    for (const [unitId, set] of Object.entries(all)) {
      for (const ex of set.exercises) {
        items.push({
          srsId: `offline-${ex.id}`,
          exerciseId: ex.id,
          unitTitle: set.title,
          subject: set.subject,
          exercise: ex
        });
        if (items.length >= limit) break;
      }
      if (items.length >= limit) break;
    }
    return items;
  }
}

export async function fetchReviewCount(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/review/count`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

export async function submitExerciseAnswer(exerciseId: string, isCorrect: boolean): Promise<void> {
  if (!navigator.onLine) {
    LocalStore.queueAnswer(exerciseId, isCorrect);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/exercises/${exerciseId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCorrect })
    });
    if (!res.ok) {
      LocalStore.queueAnswer(exerciseId, isCorrect);
    }
  } catch {
    LocalStore.queueAnswer(exerciseId, isCorrect);
  }
}

export async function completeStudySession(params: {
  unitId?: string;
  sessionType: 'new' | 'review';
  durationSeconds: number;
  totalQuestions: number;
  correctAnswers: number;
  starsEarned: number;
}): Promise<any> {
  if (!navigator.onLine) {
    LocalStore.queueSession({ ...params, timestamp: new Date().toISOString() });
    return { offline: true };
  }

  try {
    const res = await fetch(`${API_BASE}/sessions/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await res.json();
  } catch {
    LocalStore.queueSession({ ...params, timestamp: new Date().toISOString() });
    return { offline: true };
  }
}

export async function fetchProfile(): Promise<UserProfile> {
  try {
    const res = await fetch(`${API_BASE}/profile`);
    if (!res.ok) throw new Error('Error al cargar perfil');
    const profile = await res.json();
    LocalStore.cacheProfile(profile);
    return profile;
  } catch {
    return LocalStore.getCachedProfile() || {
      name: 'Campeona',
      stars: 10,
      currentStreak: 1,
      bestStreak: 1,
      mascot: 'chispa'
    };
  }
}

export async function verifyPinCode(pin: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    return res.ok;
  } catch {
    // Si está offline, admitir PIN estándar
    return pin === '1234';
  }
}

export async function updateMascotPreference(mascot: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/profile/mascot`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mascot })
    });
  } catch {}
}

/**
 * Sincroniza las respuestas y sesiones acumuladas mientras el iPad estuvo offline
 */
export async function syncOfflineProgress(): Promise<number> {
  if (!navigator.onLine) return 0;

  let syncedCount = 0;
  const pendingAnswers = LocalStore.getPendingAnswers();
  if (pendingAnswers.length > 0) {
    for (const item of pendingAnswers) {
      try {
        await fetch(`${API_BASE}/exercises/${item.exerciseId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isCorrect: item.isCorrect })
        });
        syncedCount++;
      } catch {}
    }
    LocalStore.clearPendingAnswers();
  }

  const pendingSessions = LocalStore.getPendingSessions();
  if (pendingSessions.length > 0) {
    for (const ses of pendingSessions) {
      try {
        await fetch(`${API_BASE}/sessions/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ses)
        });
        syncedCount++;
      } catch {}
    }
    LocalStore.clearPendingSessions();
  }

  return syncedCount;
}
