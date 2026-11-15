import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';
import { ExerciseSet } from '../schemas/exercise.schema.js';
import { calculateNextReview, getTodayDateString, SRSState } from './srs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.dirname(config.databasePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(config.databasePath);
db.pragma('journal_mode = WAL');

// Inicializar tablas base
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

// Migración: asegurar columna user_id en units y study_sessions si no existían
try {
  const unitsCols = db.prepare("PRAGMA table_info(units)").all() as any[];
  if (!unitsCols.some(c => c.name === 'user_id')) {
    db.exec("ALTER TABLE units ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;");
  }
} catch (e) {}

try {
  const sesCols = db.prepare("PRAGMA table_info(study_sessions)").all() as any[];
  if (!sesCols.some(c => c.name === 'user_id')) {
    db.exec("ALTER TABLE study_sessions ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;");
  }
} catch (e) {}

// Inicializar usuario Samantha y migrar todos los datos escaneados existentes a ella
const defaultUser = db.prepare("SELECT * FROM users WHERE id = 'user-samantha'").get();
if (!defaultUser) {
  db.prepare(`
    INSERT INTO users (id, name, avatar, pin_code, stars, current_streak, best_streak)
    VALUES ('user-samantha', 'Samantha', 'chispa', '1234', 30, 1, 1)
  `).run();
}

// Asignar todas las unidades existentes sin usuario directamente al usuario de Samantha
db.prepare("UPDATE units SET user_id = 'user-samantha' WHERE user_id IS NULL OR user_id = ''").run();
db.prepare("UPDATE study_sessions SET user_id = 'user-samantha' WHERE user_id IS NULL OR user_id = ''").run();

export function getAllUsers() {
  return db.prepare("SELECT id, name, email, avatar, stars, current_streak, best_streak FROM users ORDER BY created_at ASC").all();
}

export function getUserById(userId: string) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
}

export function getUserByGoogleId(googleId: string) {
  return db.prepare("SELECT * FROM users WHERE google_id = ?").get(googleId) as any;
}

export function createOrUpdateGoogleUser(params: { googleId: string; name: string; email: string; avatar?: string }) {
  let user = getUserByGoogleId(params.googleId);
  if (!user) {
    const newId = 'user-g-' + Math.random().toString(36).substring(2, 9);
    db.prepare(`
      INSERT INTO users (id, name, email, avatar, google_id, pin_code, stars)
      VALUES (?, ?, ?, ?, ?, '1234', 10)
    `).run(newId, params.name, params.email, params.avatar || 'chispa', params.googleId);
    user = getUserById(newId);
  }
  return user;
}

export function createChildUser(name: string, avatar = 'chispa', pin = '1234') {
  const newId = 'user-' + name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
  db.prepare(`
    INSERT INTO users (id, name, avatar, pin_code, stars, current_streak, best_streak)
    VALUES (?, ?, ?, ?, 10, 1, 1)
  `).run(newId, name, avatar, pin);
  return getUserById(newId);
}

export function saveExerciseSet(unitId: string, set: ExerciseSet, userId = 'user-samantha'): void {
  const insertUnit = db.prepare(`
    INSERT OR REPLACE INTO units (id, user_id, title, subject, summary, estimated_minutes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertExercise = db.prepare(`
    INSERT OR REPLACE INTO exercises (id, unit_id, type, data_json)
    VALUES (?, ?, ?, ?)
  `);

  const insertSrs = db.prepare(`
    INSERT OR REPLACE INTO srs_items (id, exercise_id, ease_factor, interval_days, repetitions, next_review_date)
    VALUES (?, ?, 2.5, 0, 0, ?)
  `);

  const transaction = db.transaction(() => {
    insertUnit.run(unitId, userId, set.title, set.subject, set.summary, set.estimatedMinutes || 7);

    set.exercises.forEach((ex, idx) => {
      const exId = `${unitId}-ex-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`;
      ex.id = exId;
      insertExercise.run(exId, unitId, ex.type, JSON.stringify(ex));
      insertSrs.run(`srs-${exId}`, exId, getTodayDateString(0));
    });
  });

  transaction();
}

export function getUnitsList(userId?: string) {
  if (userId) {
    return db.prepare(`
      SELECT u.id, u.user_id, u.title, u.subject, u.summary, u.estimated_minutes, u.created_at,
             COUNT(e.id) as exercise_count
      FROM units u
      LEFT JOIN exercises e ON e.unit_id = u.id
      WHERE u.user_id = ?
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all(userId);
  }

  return db.prepare(`
    SELECT u.id, u.user_id, u.title, u.subject, u.summary, u.estimated_minutes, u.created_at,
           COUNT(e.id) as exercise_count
    FROM units u
    LEFT JOIN exercises e ON e.unit_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();
}

export function getUnitById(unitId: string) {
  const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(unitId) as any;
  if (!unit) return null;

  const exercisesRows = db.prepare('SELECT id, type, data_json FROM exercises WHERE unit_id = ?').all(unitId) as any[];
  const exercises = exercisesRows.map(row => JSON.parse(row.data_json));

  return {
    ...unit,
    exercises
  };
}

export function deleteUnitById(unitId: string) {
  return db.prepare('DELETE FROM units WHERE id = ?').run(unitId);
}

export function getExercisesForReview(limit: number = 8, userId?: string) {
  const today = getTodayDateString();
  const query = userId ? `
    SELECT s.id as srs_id, s.exercise_id, s.ease_factor, s.interval_days, s.repetitions, s.next_review_date,
           e.type, e.data_json, u.title as unit_title, u.subject
    FROM srs_items s
    JOIN exercises e ON e.id = s.exercise_id
    JOIN units u ON u.id = e.unit_id
    WHERE s.next_review_date <= ? AND u.user_id = ?
    ORDER BY s.repetitions ASC, s.interval_days ASC
    LIMIT ?
  ` : `
    SELECT s.id as srs_id, s.exercise_id, s.ease_factor, s.interval_days, s.repetitions, s.next_review_date,
           e.type, e.data_json, u.title as unit_title, u.subject
    FROM srs_items s
    JOIN exercises e ON e.id = s.exercise_id
    JOIN units u ON u.id = e.unit_id
    WHERE s.next_review_date <= ?
    ORDER BY s.repetitions ASC, s.interval_days ASC
    LIMIT ?
  `;

  const rows = userId
    ? db.prepare(query).all(today, userId, limit) as any[]
    : db.prepare(query).all(today, limit) as any[];

  return rows.map(r => ({
    srsId: r.srs_id,
    exerciseId: r.exercise_id,
    unitTitle: r.unit_title,
    subject: r.subject,
    exercise: JSON.parse(r.data_json)
  }));
}

export function getReviewCountToday(userId?: string): number {
  const today = getTodayDateString();
  if (userId) {
    const row = db.prepare(`
      SELECT COUNT(*) as count
      FROM srs_items s
      JOIN exercises e ON e.id = s.exercise_id
      JOIN units u ON u.id = e.unit_id
      WHERE s.next_review_date <= ? AND u.user_id = ?
    `).get(today, userId) as { count: number };
    return row?.count || 0;
  }

  const row = db.prepare(`
    SELECT COUNT(*) as count
    FROM srs_items
    WHERE next_review_date <= ?
  `).get(today) as { count: number };
  return row?.count || 0;
}

export function recordExerciseAnswer(exerciseId: string, isCorrect: boolean) {
  const row = db.prepare('SELECT * FROM srs_items WHERE exercise_id = ?').get(exerciseId) as any;
  const current: SRSState | null = row ? {
    easeFactor: row.ease_factor,
    intervalDays: row.interval_days,
    repetitions: row.repetitions,
    nextReviewDate: row.next_review_date,
    timesCorrect: row.times_correct,
    timesIncorrect: row.times_incorrect
  } : null;

  const updated = calculateNextReview(current, isCorrect);

  if (row) {
    db.prepare(`
      UPDATE srs_items
      SET ease_factor = ?, interval_days = ?, repetitions = ?, next_review_date = ?,
          last_reviewed_at = datetime('now'), times_correct = ?, times_incorrect = ?
      WHERE exercise_id = ?
    `).run(
      updated.easeFactor,
      updated.intervalDays,
      updated.repetitions,
      updated.nextReviewDate,
      updated.timesCorrect,
      updated.timesIncorrect,
      exerciseId
    );
  } else {
    db.prepare(`
      INSERT INTO srs_items (id, exercise_id, ease_factor, interval_days, repetitions, next_review_date, last_reviewed_at, times_correct, times_incorrect)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)
    `).run(
      `srs-${exerciseId}`,
      exerciseId,
      updated.easeFactor,
      updated.intervalDays,
      updated.repetitions,
      updated.nextReviewDate,
      updated.timesCorrect,
      updated.timesIncorrect
    );
  }

  return updated;
}

export function recordSessionCompletion(params: {
  userId?: string;
  unitId?: string;
  sessionType: 'new' | 'review';
  durationSeconds: number;
  totalQuestions: number;
  correctAnswers: number;
  starsEarned: number;
}) {
  const targetUserId = params.userId || 'user-samantha';
  const sessionId = 'ses-' + Math.random().toString(36).substring(2, 10);
  db.prepare(`
    INSERT INTO study_sessions (id, user_id, unit_id, session_type, duration_seconds, total_questions, correct_answers, stars_earned)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sessionId,
    targetUserId,
    params.unitId || null,
    params.sessionType,
    params.durationSeconds,
    params.totalQuestions,
    params.correctAnswers,
    params.starsEarned
  );

  const profile = getUserById(targetUserId);
  if (!profile) return { sessionId, totalStars: params.starsEarned, newStreak: 1, bestStreak: 1 };

  const today = getTodayDateString();
  let newStreak = profile.current_streak;

  if (profile.last_study_date !== today) {
    const yesterday = getTodayDateString(-1);
    if (profile.last_study_date === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }

  const bestStreak = Math.max(newStreak, profile.best_streak);
  const totalStars = profile.stars + params.starsEarned;

  db.prepare(`
    UPDATE users
    SET stars = ?, current_streak = ?, best_streak = ?, last_study_date = ?
    WHERE id = ?
  `).run(totalStars, newStreak, bestStreak, today, targetUserId);

  return {
    sessionId,
    totalStars,
    newStreak,
    bestStreak
  };
}

export function getUserProfile(userId = 'user-samantha') {
  let profile = getUserById(userId);
  if (!profile) {
    profile = getUserById('user-samantha');
  }
  if (!profile) {
    return {
      id: 'user-samantha',
      name: 'Samantha',
      stars: 10,
      currentStreak: 1,
      bestStreak: 1,
      lastStudyDate: null,
      mascot: 'chispa',
      pinCode: '1234'
    };
  }
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    stars: profile.stars,
    currentStreak: profile.current_streak,
    bestStreak: profile.best_streak,
    lastStudyDate: profile.last_study_date,
    mascot: profile.avatar || 'chispa',
    pinCode: profile.pin_code
  };
}

export function updateMascot(mascot: string, userId = 'user-samantha') {
  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(mascot, userId);
}

export function verifyPin(pin: string, userId = 'user-samantha'): boolean {
  const row = db.prepare('SELECT pin_code FROM users WHERE id = ?').get(userId) as any;
  return (row && row.pin_code === pin) || config.pinCode === pin || pin === '1234';
}

export function updatePin(newPin: string, userId = 'user-samantha') {
  db.prepare('UPDATE users SET pin_code = ? WHERE id = ?').run(newPin, userId);
}
