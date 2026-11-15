import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';
import { ExerciseSet, ExerciseItem } from '../schemas/exercise.schema.js';
import { calculateNextReview, getTodayDateString, SRSState } from './srs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurar carpeta de la BD
const dbDir = path.dirname(config.databasePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(config.databasePath);
db.pragma('journal_mode = WAL');

// Inicializar esquema
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

// Sembrar datos de ejemplo si no hay unidades creadas
const countRow = db.prepare('SELECT COUNT(*) as count FROM units').get() as { count: number };
if (countRow.count === 0) {
  seedExampleData();
}

function seedExampleData() {
  const exampleUnit: ExerciseSet = {
    title: 'El Ciclo del Agua y los Seres Vivos',
    subject: 'Ciencias Naturales',
    summary: 'Aprende cómo viaja el agua en la naturaleza y por qué es tan importante para todos nosotros.',
    estimatedMinutes: 6,
    exercises: [
      {
        id: 'agua-1',
        type: 'multiple_choice',
        question: '¿Qué hace que el agua del mar se caliente y se evapore subiendo al cielo?',
        options: ['El calor del Sol', 'El viento suave', 'La luz de la Luna', 'Los peces'],
        correctAnswer: 'El calor del Sol',
        explanation: '¡Muy bien! El Sol calienta el agua líquida y la transforma en vapor de agua.',
        hint: 'Es la estrella brillante que nos da calor cada día.'
      },
      {
        id: 'agua-2',
        type: 'true_false',
        statement: 'Las nubes están formadas por millones de diminutas gotitas de agua.',
        isTrue: true,
        explanation: '¡Exacto! El vapor de agua sube, se enfría y forma las nubes en el cielo.',
        hint: 'Piensa en qué cae de las nubes cuando llueve.'
      },
      {
        id: 'agua-3',
        type: 'fill_blank',
        textWithBlank: 'Cuando el agua cae de las nubes en forma de lluvia, decimos que hay ___ .',
        options: ['precipitación', 'congelación', 'fotosíntesis'],
        correctAnswer: 'precipitación',
        explanation: '¡Genial! La precipitación puede ser en forma de lluvia, nieve o granizo.',
        hint: 'Es la palabra científica para cuando el agua cae del cielo.'
      },
      {
        id: 'agua-4',
        type: 'ordering',
        instruction: 'Ordena el viaje que hace una gota de agua:',
        items: [
          'El Sol calienta el agua del río o mar',
          'El agua se evapora y sube al cielo',
          'Se forman nubes en el cielo',
          'Cae en forma de lluvia a la tierra'
        ],
        explanation: '¡Excelente orden! Así se repite el ciclo del agua sin parar.',
        hint: 'Todo empieza con el calor del Sol.'
      },
      {
        id: 'agua-5',
        type: 'matching',
        instruction: 'Une cada estado del agua con un ejemplo de la vida real:',
        pairs: [
          { left: 'Estado Líquido', right: 'El agua del grifo o de un río' },
          { left: 'Estado Sólido', right: 'Un cubito de hielo o nieve' },
          { left: 'Estado Gaseoso', right: 'El vapor de una olla caliente' }
        ],
        explanation: '¡Fabuloso! El agua puede presentarse en tres estados maravillosos.',
        hint: 'Piensa si puedes tocarlo duro, beberlo o si flota en el aire.'
      },
      {
        id: 'agua-6',
        type: 'flashcard',
        front: '¿Por qué debemos cerrar el grifo mientras nos lavamos los dientes?',
        back: 'Para no malgastar agua dulce, ya que es un tesoro escaso y necesario para todos los seres vivos.',
        tip: '¡Cada gota cuenta para cuidar el planeta!',
        explanation: '¡Eres una gran cuidadora del planeta!'
      }
    ]
  };

  saveExerciseSet('unit-ejemplo-agua', exampleUnit);
}

export function saveExerciseSet(unitId: string, set: ExerciseSet): void {
  const insertUnit = db.prepare(`
    INSERT OR REPLACE INTO units (id, title, subject, summary, estimated_minutes)
    VALUES (?, ?, ?, ?, ?)
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
    insertUnit.run(unitId, set.title, set.subject, set.summary, set.estimatedMinutes || 7);

    set.exercises.forEach((ex, idx) => {
      // Garantizar ID globalmente único para evitar colisiones entre distintas páginas escaneadas
      const exId = `${unitId}-ex-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`;
      ex.id = exId;
      insertExercise.run(exId, unitId, ex.type, JSON.stringify(ex));
      insertSrs.run(`srs-${exId}`, exId, getTodayDateString(0));
    });
  });

  transaction();
}

export function getUnitsList() {
  const rows = db.prepare(`
    SELECT u.id, u.title, u.subject, u.summary, u.estimated_minutes, u.created_at,
           COUNT(e.id) as exercise_count
    FROM units u
    LEFT JOIN exercises e ON e.unit_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();
  return rows;
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

export function getExercisesForReview(limit: number = 8) {
  const today = getTodayDateString();
  const rows = db.prepare(`
    SELECT s.id as srs_id, s.exercise_id, s.ease_factor, s.interval_days, s.repetitions, s.next_review_date,
           e.type, e.data_json, u.title as unit_title, u.subject
    FROM srs_items s
    JOIN exercises e ON e.id = s.exercise_id
    JOIN units u ON u.id = e.unit_id
    WHERE s.next_review_date <= ?
    ORDER BY s.repetitions ASC, s.interval_days ASC
    LIMIT ?
  `).all(today, limit) as any[];

  return rows.map(r => ({
    srsId: r.srs_id,
    exerciseId: r.exercise_id,
    unitTitle: r.unit_title,
    subject: r.subject,
    exercise: JSON.parse(r.data_json)
  }));
}

export function getReviewCountToday(): number {
  const today = getTodayDateString();
  const row = db.prepare(`
    SELECT COUNT(*) as count
    FROM srs_items
    WHERE next_review_date <= ?
  `).get(today) as { count: number };
  return row.count;
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
  unitId?: string;
  sessionType: 'new' | 'review';
  durationSeconds: number;
  totalQuestions: number;
  correctAnswers: number;
  starsEarned: number;
}) {
  const sessionId = 'ses-' + Math.random().toString(36).substring(2, 10);
  db.prepare(`
    INSERT INTO study_sessions (id, unit_id, session_type, duration_seconds, total_questions, correct_answers, stars_earned)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    sessionId,
    params.unitId || null,
    params.sessionType,
    params.durationSeconds,
    params.totalQuestions,
    params.correctAnswers,
    params.starsEarned
  );

  // Actualizar perfil de usuario (estrellas, racha)
  const profile = getUserProfile();
  const today = getTodayDateString();
  let newStreak = profile.currentStreak;

  if (profile.lastStudyDate !== today) {
    const yesterday = getTodayDateString(-1);
    if (profile.lastStudyDate === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1; // empezó nueva racha
    }
  }

  const bestStreak = Math.max(newStreak, profile.bestStreak);
  const totalStars = profile.stars + params.starsEarned;

  db.prepare(`
    UPDATE user_profile
    SET stars = ?, current_streak = ?, best_streak = ?, last_study_date = ?
    WHERE id = 1
  `).run(totalStars, newStreak, bestStreak, today);

  return {
    sessionId,
    totalStars,
    newStreak,
    bestStreak
  };
}

export function getUserProfile() {
  const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get() as any;
  return {
    name: profile.name,
    stars: profile.stars,
    currentStreak: profile.current_streak,
    bestStreak: profile.best_streak,
    lastStudyDate: profile.last_study_date,
    mascot: profile.mascot,
    pinCode: profile.pin_code
  };
}

export function updateMascot(mascot: string) {
  db.prepare('UPDATE user_profile SET mascot = ? WHERE id = 1').run(mascot);
}

export function verifyPin(pin: string): boolean {
  const row = db.prepare('SELECT pin_code FROM user_profile WHERE id = 1').get() as any;
  return row && (row.pin_code === pin || config.pinCode === pin);
}

export function updatePin(newPin: string) {
  db.prepare('UPDATE user_profile SET pin_code = ? WHERE id = 1').run(newPin);
}
