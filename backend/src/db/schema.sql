CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar TEXT NOT NULL DEFAULT 'chispa',
  pin_code TEXT NOT NULL DEFAULT '1234',
  google_id TEXT UNIQUE,
  stars INTEGER NOT NULL DEFAULT 10,
  current_streak INTEGER NOT NULL DEFAULT 1,
  best_streak INTEGER NOT NULL DEFAULT 1,
  last_study_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  summary TEXT NOT NULL,
  estimated_minutes INTEGER DEFAULT 7,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS srs_items (
  id TEXT PRIMARY KEY,
  exercise_id TEXT NOT NULL UNIQUE REFERENCES exercises(id) ON DELETE CASCADE,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  next_review_date TEXT NOT NULL, -- YYYY-MM-DD
  last_reviewed_at TEXT,
  times_correct INTEGER NOT NULL DEFAULT 0,
  times_incorrect INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS study_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL DEFAULT 'new', -- 'new' | 'review'
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  stars_earned INTEGER NOT NULL DEFAULT 0
);
