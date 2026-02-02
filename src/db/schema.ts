export const SCHEMA_VERSION = 1;

export const CREATE_TABLES = `
  -- Babies table
  CREATE TABLE IF NOT EXISTS babies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    avatar_uri TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Baby settings
  CREATE TABLE IF NOT EXISTS baby_settings (
    id TEXT PRIMARY KEY,
    baby_id TEXT NOT NULL UNIQUE,
    daily_pumping_goal_oz REAL,
    feeding_reminder_hours REAL,
    use_metric_units INTEGER DEFAULT 0,
    FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
  );

  -- Sleep logs
  CREATE TABLE IF NOT EXISTS sleep_logs (
    id TEXT PRIMARY KEY,
    baby_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    sleep_type TEXT NOT NULL CHECK (sleep_type IN ('nap', 'night')),
    location TEXT,
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
  );

  -- Feeding logs
  CREATE TABLE IF NOT EXISTS feeding_logs (
    id TEXT PRIMARY KEY,
    baby_id TEXT NOT NULL,
    feed_type TEXT NOT NULL CHECK (feed_type IN ('breast_left', 'breast_right', 'bottle', 'solids')),
    start_time TEXT NOT NULL,
    end_time TEXT,
    amount_oz REAL,
    content_type TEXT CHECK (content_type IN ('breast_milk', 'formula', 'food')),
    food_name TEXT,
    reaction_flag INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
  );

  -- Diaper logs
  CREATE TABLE IF NOT EXISTS diaper_logs (
    id TEXT PRIMARY KEY,
    baby_id TEXT NOT NULL,
    logged_at TEXT NOT NULL,
    diaper_type TEXT NOT NULL CHECK (diaper_type IN ('wet', 'dirty', 'both')),
    color TEXT,
    consistency TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
  );

  -- Pumping logs
  CREATE TABLE IF NOT EXISTS pumping_logs (
    id TEXT PRIMARY KEY,
    baby_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    output_oz REAL NOT NULL,
    output_left_oz REAL,
    output_right_oz REAL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
  );

  -- Milestone photos
  CREATE TABLE IF NOT EXISTS milestone_photos (
    id TEXT PRIMARY KEY,
    baby_id TEXT NOT NULL,
    image_uri TEXT NOT NULL,
    thumbnail_uri TEXT,
    taken_at TEXT NOT NULL,
    month_number INTEGER,
    milestone_type TEXT NOT NULL CHECK (milestone_type IN ('monthly', 'developmental', 'custom')),
    milestone_name TEXT,
    caption TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
  );

  -- App settings (single row)
  CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    has_completed_onboarding INTEGER DEFAULT 0,
    selected_baby_id TEXT,
    appearance_mode TEXT DEFAULT 'system' CHECK (appearance_mode IN ('light', 'dark', 'system')),
    has_unlocked_premium INTEGER DEFAULT 0,
    premium_unlock_date TEXT,
    tip_jar_total REAL DEFAULT 0
  );

  -- Initialize app settings
  INSERT OR IGNORE INTO app_settings (id) VALUES (1);

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_sleep_logs_baby_date ON sleep_logs(baby_id, start_time);
  CREATE INDEX IF NOT EXISTS idx_feeding_logs_baby_date ON feeding_logs(baby_id, start_time);
  CREATE INDEX IF NOT EXISTS idx_diaper_logs_baby_date ON diaper_logs(baby_id, logged_at);
  CREATE INDEX IF NOT EXISTS idx_pumping_logs_baby_date ON pumping_logs(baby_id, start_time);
  CREATE INDEX IF NOT EXISTS idx_photos_baby_date ON milestone_photos(baby_id, taken_at);
`;
