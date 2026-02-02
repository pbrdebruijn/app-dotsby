# Dotsby Technical Specification

**Expo + React Native | Local-First Architecture**

Version 1.0 | February 2025

---

## 1. Architecture Overview

### 1.1 Design Principles

| Principle | Implementation |
|-----------|----------------|
| Local-first | All data stored on device with SQLite |
| Offline always | App works 100% without internet |
| Privacy by default | No analytics, no tracking, no accounts required |
| Cross-platform | iOS primary, Android secondary |
| No backend required | Optional cloud sync via user's own iCloud/Google |

### 1.2 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Expo SDK 52+ | Managed workflow, fast iteration, OTA updates |
| Language | TypeScript | Type safety, better DX |
| UI Framework | React Native + Expo Router | File-based routing, native feel |
| Styling | NativeWind (Tailwind) | Consistent styling, rapid development |
| Data Persistence | expo-sqlite | Local SQLite, performant queries |
| State Management | Zustand + React Query | Lightweight, persist to SQLite |
| Charts | react-native-svg | Custom pattern grid rendering |
| Notifications | expo-notifications | Local notifications only |
| Images | expo-image-picker + expo-file-system | Photo capture and local storage |
| IAP | expo-in-app-purchases or react-native-iap | One-time purchases + tips |
| Icons | lucide-react-native | Consistent, minimal icons |

### 1.3 Expo Config

```json
// app.json
{
  "expo": {
    "name": "Dotsby",
    "slug": "dotsby",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "dotsby",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.dotsby",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "Take milestone photos of your baby",
        "NSPhotoLibraryUsageDescription": "Save milestone photos to your library"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.dotsby"
    },
    "plugins": [
      "expo-router",
      "expo-sqlite",
      "expo-notifications",
      "expo-image-picker",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ]
  }
}
```

---

## 2. Project Structure

```
dotsby/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Redirect to tabs or onboarding
│   ├── onboarding/
│   │   ├── index.tsx             # Welcome screen
│   │   └── add-baby.tsx          # Add first baby
│   │
│   └── (tabs)/                   # Main tab navigation
│       ├── _layout.tsx           # Tab bar configuration
│       ├── index.tsx             # Home screen
│       ├── patterns.tsx          # Pattern graphs
│       ├── photos.tsx            # Milestone photos
│       └── settings.tsx          # Settings
│
├── src/
│   ├── components/
│   │   ├── ui/                   # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Sheet.tsx
│   │   │   └── Timer.tsx
│   │   │
│   │   ├── patterns/             # Pattern graph components
│   │   │   ├── PatternGrid.tsx
│   │   │   ├── PatternDot.tsx
│   │   │   └── DayDetailSheet.tsx
│   │   │
│   │   ├── logging/              # Quick log components
│   │   │   ├── QuickLogButton.tsx
│   │   │   ├── SleepLogSheet.tsx
│   │   │   ├── FeedingLogSheet.tsx
│   │   │   ├── DiaperLogSheet.tsx
│   │   │   ├── PumpingLogSheet.tsx
│   │   │   └── NursingTimer.tsx
│   │   │
│   │   ├── schedule/             # Sleep schedule components
│   │   │   ├── TodaySchedule.tsx
│   │   │   └── WakeWindowCard.tsx
│   │   │
│   │   └── photos/               # Photo components
│   │       ├── PhotoGallery.tsx
│   │       ├── PhotoCard.tsx
│   │       └── MonthOverlay.tsx
│   │
│   ├── db/                       # Database layer
│   │   ├── schema.ts             # SQLite schema
│   │   ├── database.ts           # Database connection
│   │   ├── migrations.ts         # Schema migrations
│   │   └── queries/
│   │       ├── babies.ts
│   │       ├── sleep.ts
│   │       ├── feeding.ts
│   │       ├── diapers.ts
│   │       ├── pumping.ts
│   │       └── photos.ts
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── appStore.ts           # Global app state
│   │   ├── babyStore.ts          # Selected baby, babies list
│   │   └── timerStore.ts         # Active timers
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useDatabase.ts
│   │   ├── usePatternData.ts
│   │   ├── useSleepSchedule.ts
│   │   ├── useTimer.ts
│   │   └── useNotifications.ts
│   │
│   ├── services/                 # Business logic
│   │   ├── sleepTargets.ts       # Age-based sleep data
│   │   ├── patternCalculator.ts  # Intensity calculations
│   │   ├── notifications.ts      # Local notifications
│   │   ├── export.ts             # CSV export
│   │   └── photos.ts             # Image processing
│   │
│   ├── utils/
│   │   ├── dates.ts              # Date formatting helpers
│   │   ├── formatters.ts         # Display formatters
│   │   └── constants.ts          # App constants
│   │
│   └── types/
│       └── index.ts              # TypeScript types
│
├── assets/
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── photo-prompts.json        # Monthly photo prompts
│
├── app.json
├── babel.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 3. Database Layer (expo-sqlite)

### 3.1 Schema Definition

```typescript
// src/db/schema.ts

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
```

### 3.2 Database Connection

```typescript
// src/db/database.ts

import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES, SCHEMA_VERSION } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('dotsby.db');
  
  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');
  
  // Run migrations
  await runMigrations(db);
  
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  // Check current version
  const result = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;'
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < SCHEMA_VERSION) {
    // Run schema creation
    await database.execAsync(CREATE_TABLES);
    
    // Update version
    await database.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
```

### 3.3 Query Functions

```typescript
// src/db/queries/babies.ts

import { getDatabase } from '../database';
import { generateId } from '../../utils/ids';
import type { Baby, BabyInsert } from '../../types';

export async function getAllBabies(): Promise<Baby[]> {
  const db = await getDatabase();
  return db.getAllAsync<Baby>('SELECT * FROM babies ORDER BY created_at DESC');
}

export async function getBabyById(id: string): Promise<Baby | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Baby>('SELECT * FROM babies WHERE id = ?', [id]);
}

export async function insertBaby(baby: BabyInsert): Promise<Baby> {
  const db = await getDatabase();
  const id = generateId();
  
  await db.runAsync(
    'INSERT INTO babies (id, name, birth_date, avatar_uri) VALUES (?, ?, ?, ?)',
    [id, baby.name, baby.birthDate, baby.avatarUri ?? null]
  );
  
  // Create default settings
  await db.runAsync(
    'INSERT INTO baby_settings (id, baby_id) VALUES (?, ?)',
    [generateId(), id]
  );
  
  return { id, ...baby, createdAt: new Date().toISOString() };
}

export async function updateBaby(id: string, updates: Partial<BabyInsert>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.birthDate !== undefined) {
    fields.push('birth_date = ?');
    values.push(updates.birthDate);
  }
  if (updates.avatarUri !== undefined) {
    fields.push('avatar_uri = ?');
    values.push(updates.avatarUri);
  }
  
  if (fields.length > 0) {
    values.push(id);
    await db.runAsync(
      `UPDATE babies SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
}

export async function deleteBaby(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM babies WHERE id = ?', [id]);
}
```

```typescript
// src/db/queries/sleep.ts

import { getDatabase } from '../database';
import { generateId } from '../../utils/ids';
import type { SleepLog, SleepLogInsert } from '../../types';

export async function getSleepLogs(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<SleepLog[]> {
  const db = await getDatabase();
  return db.getAllAsync<SleepLog>(
    `SELECT * FROM sleep_logs 
     WHERE baby_id = ? AND start_time >= ? AND start_time < ?
     ORDER BY start_time DESC`,
    [babyId, startDate, endDate]
  );
}

export async function getTodaySleepLogs(babyId: string): Promise<SleepLog[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getSleepLogs(babyId, today.toISOString(), tomorrow.toISOString());
}

export async function getLastSleepLog(babyId: string): Promise<SleepLog | null> {
  const db = await getDatabase();
  return db.getFirstAsync<SleepLog>(
    'SELECT * FROM sleep_logs WHERE baby_id = ? ORDER BY start_time DESC LIMIT 1',
    [babyId]
  );
}

export async function getActiveSleepLog(babyId: string): Promise<SleepLog | null> {
  const db = await getDatabase();
  return db.getFirstAsync<SleepLog>(
    'SELECT * FROM sleep_logs WHERE baby_id = ? AND end_time IS NULL LIMIT 1',
    [babyId]
  );
}

export async function insertSleepLog(log: SleepLogInsert): Promise<SleepLog> {
  const db = await getDatabase();
  const id = generateId();
  
  await db.runAsync(
    `INSERT INTO sleep_logs (id, baby_id, start_time, end_time, sleep_type, location, quality_rating, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, log.babyId, log.startTime, log.endTime ?? null, log.sleepType, log.location ?? null, log.qualityRating ?? null, log.notes ?? null]
  );
  
  return { id, ...log, createdAt: new Date().toISOString() };
}

export async function endSleepLog(id: string, endTime: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE sleep_logs SET end_time = ? WHERE id = ?',
    [endTime, id]
  );
}

export async function deleteSleepLog(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sleep_logs WHERE id = ?', [id]);
}

// Aggregate queries for patterns
export async function getSleepMinutesByDay(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<{ date: string; minutes: number }[]> {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT 
       date(start_time) as date,
       SUM(
         CAST((julianday(COALESCE(end_time, datetime('now'))) - julianday(start_time)) * 24 * 60 AS INTEGER)
       ) as minutes
     FROM sleep_logs
     WHERE baby_id = ? AND start_time >= ? AND start_time < ?
     GROUP BY date(start_time)
     ORDER BY date`,
    [babyId, startDate, endDate]
  );
}
```

```typescript
// src/db/queries/feeding.ts

import { getDatabase } from '../database';
import { generateId } from '../../utils/ids';
import type { FeedingLog, FeedingLogInsert } from '../../types';

export async function getFeedingLogs(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<FeedingLog[]> {
  const db = await getDatabase();
  return db.getAllAsync<FeedingLog>(
    `SELECT * FROM feeding_logs 
     WHERE baby_id = ? AND start_time >= ? AND start_time < ?
     ORDER BY start_time DESC`,
    [babyId, startDate, endDate]
  );
}

export async function getTodayFeedingLogs(babyId: string): Promise<FeedingLog[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getFeedingLogs(babyId, today.toISOString(), tomorrow.toISOString());
}

export async function getLastFeedingLog(babyId: string): Promise<FeedingLog | null> {
  const db = await getDatabase();
  return db.getFirstAsync<FeedingLog>(
    'SELECT * FROM feeding_logs WHERE baby_id = ? ORDER BY start_time DESC LIMIT 1',
    [babyId]
  );
}

export async function getLastNursingSide(babyId: string): Promise<'left' | 'right' | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ feed_type: string }>(
    `SELECT feed_type FROM feeding_logs 
     WHERE baby_id = ? AND feed_type IN ('breast_left', 'breast_right')
     ORDER BY start_time DESC LIMIT 1`,
    [babyId]
  );
  
  if (!result) return null;
  return result.feed_type === 'breast_left' ? 'left' : 'right';
}

export async function insertFeedingLog(log: FeedingLogInsert): Promise<FeedingLog> {
  const db = await getDatabase();
  const id = generateId();
  
  await db.runAsync(
    `INSERT INTO feeding_logs (id, baby_id, feed_type, start_time, end_time, amount_oz, content_type, food_name, reaction_flag, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, log.babyId, log.feedType, log.startTime, log.endTime ?? null, log.amountOz ?? null, log.contentType ?? null, log.foodName ?? null, log.reactionFlag ? 1 : 0, log.notes ?? null]
  );
  
  return { id, ...log, createdAt: new Date().toISOString() };
}

export async function getFeedCountByDay(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<{ date: string; count: number }[]> {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT date(start_time) as date, COUNT(*) as count
     FROM feeding_logs
     WHERE baby_id = ? AND start_time >= ? AND start_time < ?
     GROUP BY date(start_time)
     ORDER BY date`,
    [babyId, startDate, endDate]
  );
}
```

```typescript
// src/db/queries/diapers.ts

import { getDatabase } from '../database';
import { generateId } from '../../utils/ids';
import type { DiaperLog, DiaperLogInsert } from '../../types';

export async function getDiaperLogs(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<DiaperLog[]> {
  const db = await getDatabase();
  return db.getAllAsync<DiaperLog>(
    `SELECT * FROM diaper_logs 
     WHERE baby_id = ? AND logged_at >= ? AND logged_at < ?
     ORDER BY logged_at DESC`,
    [babyId, startDate, endDate]
  );
}

export async function getTodayDiaperLogs(babyId: string): Promise<DiaperLog[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getDiaperLogs(babyId, today.toISOString(), tomorrow.toISOString());
}

export async function getTodayDiaperCounts(babyId: string): Promise<{ wet: number; dirty: number }> {
  const logs = await getTodayDiaperLogs(babyId);
  
  let wet = 0;
  let dirty = 0;
  
  for (const log of logs) {
    if (log.diaperType === 'wet' || log.diaperType === 'both') wet++;
    if (log.diaperType === 'dirty' || log.diaperType === 'both') dirty++;
  }
  
  return { wet, dirty };
}

export async function insertDiaperLog(log: DiaperLogInsert): Promise<DiaperLog> {
  const db = await getDatabase();
  const id = generateId();
  
  await db.runAsync(
    `INSERT INTO diaper_logs (id, baby_id, logged_at, diaper_type, color, consistency, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, log.babyId, log.loggedAt, log.diaperType, log.color ?? null, log.consistency ?? null, log.notes ?? null]
  );
  
  return { id, ...log, createdAt: new Date().toISOString() };
}

export async function getDiaperCountByDay(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<{ date: string; count: number }[]> {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT date(logged_at) as date, COUNT(*) as count
     FROM diaper_logs
     WHERE baby_id = ? AND logged_at >= ? AND logged_at < ?
     GROUP BY date(logged_at)
     ORDER BY date`,
    [babyId, startDate, endDate]
  );
}
```

---

## 4. Types

```typescript
// src/types/index.ts

// Baby
export interface Baby {
  id: string;
  name: string;
  birthDate: string;
  avatarUri?: string | null;
  createdAt: string;
}

export interface BabyInsert {
  name: string;
  birthDate: string;
  avatarUri?: string | null;
}

// Sleep
export interface SleepLog {
  id: string;
  babyId: string;
  startTime: string;
  endTime?: string | null;
  sleepType: 'nap' | 'night';
  location?: string | null;
  qualityRating?: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface SleepLogInsert {
  babyId: string;
  startTime: string;
  endTime?: string | null;
  sleepType: 'nap' | 'night';
  location?: string | null;
  qualityRating?: number | null;
  notes?: string | null;
}

// Feeding
export interface FeedingLog {
  id: string;
  babyId: string;
  feedType: 'breast_left' | 'breast_right' | 'bottle' | 'solids';
  startTime: string;
  endTime?: string | null;
  amountOz?: number | null;
  contentType?: 'breast_milk' | 'formula' | 'food' | null;
  foodName?: string | null;
  reactionFlag: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface FeedingLogInsert {
  babyId: string;
  feedType: 'breast_left' | 'breast_right' | 'bottle' | 'solids';
  startTime: string;
  endTime?: string | null;
  amountOz?: number | null;
  contentType?: 'breast_milk' | 'formula' | 'food' | null;
  foodName?: string | null;
  reactionFlag?: boolean;
  notes?: string | null;
}

// Diaper
export interface DiaperLog {
  id: string;
  babyId: string;
  loggedAt: string;
  diaperType: 'wet' | 'dirty' | 'both';
  color?: string | null;
  consistency?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface DiaperLogInsert {
  babyId: string;
  loggedAt: string;
  diaperType: 'wet' | 'dirty' | 'both';
  color?: string | null;
  consistency?: string | null;
  notes?: string | null;
}

// Pumping
export interface PumpingLog {
  id: string;
  babyId: string;
  startTime: string;
  endTime?: string | null;
  outputOz: number;
  outputLeftOz?: number | null;
  outputRightOz?: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface PumpingLogInsert {
  babyId: string;
  startTime: string;
  endTime?: string | null;
  outputOz: number;
  outputLeftOz?: number | null;
  outputRightOz?: number | null;
  notes?: string | null;
}

// Photos
export interface MilestonePhoto {
  id: string;
  babyId: string;
  imageUri: string;
  thumbnailUri?: string | null;
  takenAt: string;
  monthNumber?: number | null;
  milestoneType: 'monthly' | 'developmental' | 'custom';
  milestoneName?: string | null;
  caption?: string | null;
  isFavorite: boolean;
  createdAt: string;
}

// Pattern data
export interface DayActivity {
  date: string;
  intensity: number; // 0-4
  sleepMinutes: number;
  feedCount: number;
  diaperCount: number;
  pumpingOz: number;
  photoCount: number;
}

// App settings
export interface AppSettings {
  hasCompletedOnboarding: boolean;
  selectedBabyId?: string | null;
  appearanceMode: 'light' | 'dark' | 'system';
  hasUnlockedPremium: boolean;
  premiumUnlockDate?: string | null;
  tipJarTotal: number;
}
```

---

## 5. State Management (Zustand)

```typescript
// src/stores/appStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  hasCompletedOnboarding: boolean;
  selectedBabyId: string | null;
  appearanceMode: 'light' | 'dark' | 'system';
  hasUnlockedPremium: boolean;
  
  // Actions
  setOnboardingComplete: () => void;
  setSelectedBaby: (id: string) => void;
  setAppearanceMode: (mode: 'light' | 'dark' | 'system') => void;
  unlockPremium: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      selectedBabyId: null,
      appearanceMode: 'system',
      hasUnlockedPremium: false,
      
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      setSelectedBaby: (id) => set({ selectedBabyId: id }),
      setAppearanceMode: (mode) => set({ appearanceMode: mode }),
      unlockPremium: () => set({ hasUnlockedPremium: true }),
    }),
    {
      name: 'dotsby-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

```typescript
// src/stores/timerStore.ts

import { create } from 'zustand';

interface TimerState {
  // Active timers
  activeSleepTimer: { babyId: string; startTime: Date } | null;
  activeNursingTimer: { babyId: string; side: 'left' | 'right'; startTime: Date } | null;
  activePumpingTimer: { babyId: string; startTime: Date } | null;
  
  // Actions
  startSleepTimer: (babyId: string) => void;
  stopSleepTimer: () => { babyId: string; startTime: Date } | null;
  
  startNursingTimer: (babyId: string, side: 'left' | 'right') => void;
  switchNursingSide: () => void;
  stopNursingTimer: () => { babyId: string; side: 'left' | 'right'; startTime: Date } | null;
  
  startPumpingTimer: (babyId: string) => void;
  stopPumpingTimer: () => { babyId: string; startTime: Date } | null;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  activeSleepTimer: null,
  activeNursingTimer: null,
  activePumpingTimer: null,
  
  startSleepTimer: (babyId) => set({ 
    activeSleepTimer: { babyId, startTime: new Date() } 
  }),
  
  stopSleepTimer: () => {
    const timer = get().activeSleepTimer;
    set({ activeSleepTimer: null });
    return timer;
  },
  
  startNursingTimer: (babyId, side) => set({ 
    activeNursingTimer: { babyId, side, startTime: new Date() } 
  }),
  
  switchNursingSide: () => {
    const current = get().activeNursingTimer;
    if (current) {
      set({ 
        activeNursingTimer: { 
          ...current, 
          side: current.side === 'left' ? 'right' : 'left' 
        } 
      });
    }
  },
  
  stopNursingTimer: () => {
    const timer = get().activeNursingTimer;
    set({ activeNursingTimer: null });
    return timer;
  },
  
  startPumpingTimer: (babyId) => set({ 
    activePumpingTimer: { babyId, startTime: new Date() } 
  }),
  
  stopPumpingTimer: () => {
    const timer = get().activePumpingTimer;
    set({ activePumpingTimer: null });
    return timer;
  },
}));
```

---

## 6. Key Components

### 6.1 Pattern Grid Component

```tsx
// src/components/patterns/PatternGrid.tsx

import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import type { DayActivity } from '../../types';

interface PatternGridProps {
  activities: DayActivity[];
  weeks?: number;
  onDayPress?: (activity: DayActivity) => void;
}

const DOT_SIZE = 12;
const DOT_GAP = 4;
const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const INTENSITY_COLORS = [
  '#F5F5F5', // 0 - no data
  '#E0E0E0', // 1 - low
  '#AAAAAA', // 2 - medium-low
  '#666666', // 3 - medium-high
  '#000000', // 4 - high
];

export function PatternGrid({ activities, weeks = 12, onDayPress }: PatternGridProps) {
  const gridWidth = weeks * (DOT_SIZE + DOT_GAP);
  const gridHeight = 7 * (DOT_SIZE + DOT_GAP);
  
  // Organize activities into weeks
  const grid = useMemo(() => {
    const result: DayActivity[][] = [];
    for (let w = 0; w < weeks; w++) {
      const week: DayActivity[] = [];
      for (let d = 0; d < 7; d++) {
        const index = w * 7 + d;
        week.push(activities[index] || { date: '', intensity: 0, sleepMinutes: 0, feedCount: 0, diaperCount: 0, pumpingOz: 0, photoCount: 0 });
      }
      result.push(week);
    }
    return result;
  }, [activities, weeks]);

  return (
    <View className="bg-white p-4 rounded-2xl">
      {/* Day labels */}
      <View className="flex-row">
        <View className="w-5 mr-2">
          {DAYS_OF_WEEK.map((day, i) => (
            <Text
              key={i}
              className="text-xs text-gray-400 h-4"
              style={{ height: DOT_SIZE + DOT_GAP, lineHeight: DOT_SIZE + DOT_GAP }}
            >
              {i % 2 === 0 ? day : ''}
            </Text>
          ))}
        </View>
        
        {/* SVG Grid */}
        <Svg width={gridWidth} height={gridHeight}>
          {grid.map((week, weekIndex) =>
            week.map((day, dayIndex) => (
              <Rect
                key={`${weekIndex}-${dayIndex}`}
                x={weekIndex * (DOT_SIZE + DOT_GAP)}
                y={dayIndex * (DOT_SIZE + DOT_GAP)}
                width={DOT_SIZE}
                height={DOT_SIZE}
                rx={2}
                fill={INTENSITY_COLORS[day.intensity]}
                onPress={() => day.date && onDayPress?.(day)}
              />
            ))
          )}
        </Svg>
      </View>
      
      {/* Legend */}
      <View className="flex-row items-center justify-end mt-3 gap-1">
        <Text className="text-xs text-gray-400 mr-1">Less</Text>
        {INTENSITY_COLORS.map((color, i) => (
          <View
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
        <Text className="text-xs text-gray-400 ml-1">More</Text>
      </View>
    </View>
  );
}
```

### 6.2 Quick Log Button

```tsx
// src/components/logging/QuickLogButton.tsx

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LucideIcon } from 'lucide-react-native';

interface QuickLogButtonProps {
  title: string;
  icon: LucideIcon;
  onPress: () => void;
  subtitle?: string;
  isActive?: boolean;
}

export function QuickLogButton({ 
  title, 
  icon: Icon, 
  onPress, 
  subtitle,
  isActive = false 
}: QuickLogButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`
        flex-1 items-center justify-center p-4 rounded-2xl min-h-[100px]
        ${isActive ? 'bg-black' : 'bg-gray-100'}
        active:scale-95
      `}
      style={{ transition: 'transform 0.1s' }}
    >
      <Icon 
        size={28} 
        color={isActive ? '#FFFFFF' : '#000000'} 
        strokeWidth={1.5}
      />
      <Text className={`mt-2 font-medium ${isActive ? 'text-white' : 'text-black'}`}>
        {title}
      </Text>
      {subtitle && (
        <Text className={`text-xs mt-1 ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
          {subtitle}
        </Text>
      )}
    </Pressable>
  );
}
```

### 6.3 Timer Component

```tsx
// src/components/ui/Timer.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Play, Square } from 'lucide-react-native';

interface TimerProps {
  isRunning: boolean;
  startTime: Date | null;
  onStart: () => void;
  onStop: () => void;
}

export function Timer({ isRunning, startTime, onStart, onStop }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && startTime) {
      // Initial calculation
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      
      // Update every second
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isRunning) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <View className="items-center">
      {/* Time display */}
      <Text className="text-6xl font-light tracking-tight text-black font-mono">
        {formatTime(elapsed)}
      </Text>

      {/* Start/Stop button */}
      <Pressable
        onPress={handlePress}
        className={`
          mt-6 w-20 h-20 rounded-full items-center justify-center
          border-2 border-black
          ${isRunning ? 'bg-black' : 'bg-white'}
          active:scale-95
        `}
      >
        {isRunning ? (
          <Square size={28} color="#FFFFFF" fill="#FFFFFF" />
        ) : (
          <Play size={28} color="#000000" fill="#000000" />
        )}
      </Pressable>

      <Text className="mt-3 text-gray-500">
        {isRunning ? 'Tap to stop' : 'Tap to start'}
      </Text>
    </View>
  );
}
```

### 6.4 Nursing Timer (Dual Sided)

```tsx
// src/components/logging/NursingTimer.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTimerStore } from '../../stores/timerStore';

interface NursingTimerProps {
  babyId: string;
  lastSide: 'left' | 'right' | null;
  onComplete: (side: 'left' | 'right', durationSeconds: number) => void;
}

export function NursingTimer({ babyId, lastSide, onComplete }: NursingTimerProps) {
  const { activeNursingTimer, startNursingTimer, switchNursingSide, stopNursingTimer } = useTimerStore();
  const [elapsed, setElapsed] = useState(0);

  const isRunning = activeNursingTimer?.babyId === babyId;
  const currentSide = activeNursingTimer?.side;
  const suggestedSide = lastSide === 'left' ? 'right' : 'left';

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && activeNursingTimer?.startTime) {
      setElapsed(Math.floor((Date.now() - activeNursingTimer.startTime.getTime()) / 1000));
      
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - activeNursingTimer.startTime.getTime()) / 1000));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, activeNursingTimer?.startTime]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSidePress = (side: 'left' | 'right') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!isRunning) {
      startNursingTimer(babyId, side);
    } else if (currentSide !== side) {
      switchNursingSide();
    }
  };

  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const timer = stopNursingTimer();
    if (timer) {
      const duration = Math.floor((Date.now() - timer.startTime.getTime()) / 1000);
      onComplete(timer.side, duration);
    }
    setElapsed(0);
  };

  return (
    <View className="items-center p-6">
      {/* Timer display */}
      <Text className="text-5xl font-light tracking-tight text-black font-mono mb-8">
        {formatTime(elapsed)}
      </Text>

      {/* Side buttons */}
      <View className="flex-row gap-4 w-full">
        <Pressable
          onPress={() => handleSidePress('left')}
          className={`
            flex-1 py-6 rounded-2xl items-center
            ${currentSide === 'left' ? 'bg-black' : 'bg-gray-100'}
            active:scale-95
          `}
        >
          <Text className={`text-lg font-semibold ${currentSide === 'left' ? 'text-white' : 'text-black'}`}>
            Left
          </Text>
          {!isRunning && suggestedSide === 'left' && (
            <Text className="text-xs text-gray-500 mt-1">Start here</Text>
          )}
          {currentSide === 'left' && (
            <Text className="text-xs text-gray-300 mt-1">Active</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => handleSidePress('right')}
          className={`
            flex-1 py-6 rounded-2xl items-center
            ${currentSide === 'right' ? 'bg-black' : 'bg-gray-100'}
            active:scale-95
          `}
        >
          <Text className={`text-lg font-semibold ${currentSide === 'right' ? 'text-white' : 'text-black'}`}>
            Right
          </Text>
          {!isRunning && suggestedSide === 'right' && (
            <Text className="text-xs text-gray-500 mt-1">Start here</Text>
          )}
          {currentSide === 'right' && (
            <Text className="text-xs text-gray-300 mt-1">Active</Text>
          )}
        </Pressable>
      </View>

      {/* Stop button */}
      {isRunning && (
        <Pressable
          onPress={handleStop}
          className="mt-6 py-4 px-8 bg-black rounded-full active:scale-95"
        >
          <Text className="text-white font-semibold">Save & Stop</Text>
        </Pressable>
      )}

      {/* Last feed indicator */}
      {lastSide && !isRunning && (
        <Text className="mt-4 text-gray-400 text-sm">
          Last feed: {lastSide} side
        </Text>
      )}
    </View>
  );
}
```

---

## 7. App Navigation (Expo Router)

### 7.1 Root Layout

```tsx
// app/_layout.tsx

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../src/stores/appStore';
import { getDatabase } from '../src/db/database';
import '../global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appearanceMode = useAppStore((s) => s.appearanceMode);

  // Initialize database on app start
  useEffect(() => {
    getDatabase();
  }, []);

  const isDark = appearanceMode === 'dark' || (appearanceMode === 'system' && colorScheme === 'dark');

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? '#000000' : '#FFFFFF' },
        }}
      />
    </>
  );
}
```

### 7.2 Tab Layout

```tsx
// app/(tabs)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';
import { Home, BarChart3, Image, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5E5',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="patterns"
        options={{
          title: 'Patterns',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{
          title: 'Photos',
          tabBarIcon: ({ color, size }) => <Image size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}
```

### 7.3 Home Screen

```tsx
// app/(tabs)/index.tsx

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Baby, Droplets, Milk } from 'lucide-react-native';
import { QuickLogButton } from '../../src/components/logging/QuickLogButton';
import { TodaySchedule } from '../../src/components/schedule/TodaySchedule';
import { PatternGrid } from '../../src/components/patterns/PatternGrid';
import { SleepLogSheet } from '../../src/components/logging/SleepLogSheet';
import { FeedingLogSheet } from '../../src/components/logging/FeedingLogSheet';
import { DiaperLogSheet } from '../../src/components/logging/DiaperLogSheet';
import { PumpingLogSheet } from '../../src/components/logging/PumpingLogSheet';
import { useAppStore } from '../../src/stores/appStore';
import { usePatternData } from '../../src/hooks/usePatternData';

type SheetType = 'sleep' | 'feeding' | 'diaper' | 'pumping' | null;

export default function HomeScreen() {
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const selectedBabyId = useAppStore((s) => s.selectedBabyId);
  const { activities } = usePatternData(selectedBabyId, 2); // Last 2 weeks for mini view

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-black">Dotsby</Text>
          <Pressable className="bg-gray-100 px-4 py-2 rounded-full">
            <Text className="text-black font-medium">Baby Name ▾</Text>
          </Pressable>
        </View>

        {/* Quick Log Buttons */}
        <View className="flex-row gap-3 mb-6">
          <QuickLogButton
            title="Sleep"
            icon={Moon}
            onPress={() => setActiveSheet('sleep')}
          />
          <QuickLogButton
            title="Feed"
            icon={Baby}
            onPress={() => setActiveSheet('feeding')}
          />
        </View>

        <View className="flex-row gap-3 mb-6">
          <QuickLogButton
            title="Diaper"
            icon={Droplets}
            onPress={() => setActiveSheet('diaper')}
          />
          <QuickLogButton
            title="Pump"
            icon={Milk}
            onPress={() => setActiveSheet('pumping')}
          />
        </View>

        {/* Today's Schedule */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-black mb-3">Today's Schedule</Text>
          <TodaySchedule babyId={selectedBabyId} />
        </View>

        {/* Mini Pattern Graph */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-black mb-3">This Week</Text>
          <PatternGrid activities={activities} weeks={2} />
        </View>
      </ScrollView>

      {/* Log Sheets */}
      <SleepLogSheet
        isOpen={activeSheet === 'sleep'}
        onClose={() => setActiveSheet(null)}
        babyId={selectedBabyId}
      />
      <FeedingLogSheet
        isOpen={activeSheet === 'feeding'}
        onClose={() => setActiveSheet(null)}
        babyId={selectedBabyId}
      />
      <DiaperLogSheet
        isOpen={activeSheet === 'diaper'}
        onClose={() => setActiveSheet(null)}
        babyId={selectedBabyId}
      />
      <PumpingLogSheet
        isOpen={activeSheet === 'pumping'}
        onClose={() => setActiveSheet(null)}
        babyId={selectedBabyId}
      />
    </SafeAreaView>
  );
}
```

---

## 8. Pattern Data Hook

```typescript
// src/hooks/usePatternData.ts

import { useEffect, useState, useCallback } from 'react';
import { getSleepMinutesByDay } from '../db/queries/sleep';
import { getFeedCountByDay } from '../db/queries/feeding';
import { getDiaperCountByDay } from '../db/queries/diapers';
import { calculateIntensity } from '../services/patternCalculator';
import type { DayActivity } from '../types';

export function usePatternData(babyId: string | null, weeks: number = 12) {
  const [activities, setActivities] = useState<DayActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!babyId) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - weeks * 7);

      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();

      // Fetch all data in parallel
      const [sleepData, feedData, diaperData] = await Promise.all([
        getSleepMinutesByDay(babyId, startStr, endStr),
        getFeedCountByDay(babyId, startStr, endStr),
        getDiaperCountByDay(babyId, startStr, endStr),
      ]);

      // Create map for quick lookup
      const sleepMap = new Map(sleepData.map((d) => [d.date, d.minutes]));
      const feedMap = new Map(feedData.map((d) => [d.date, d.count]));
      const diaperMap = new Map(diaperData.map((d) => [d.date, d.count]));

      // Generate activities for each day
      const result: DayActivity[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];

        const sleepMinutes = sleepMap.get(dateStr) || 0;
        const feedCount = feedMap.get(dateStr) || 0;
        const diaperCount = diaperMap.get(dateStr) || 0;

        const intensity = calculateIntensity({
          sleepMinutes,
          feedCount,
          diaperCount,
          pumpingOz: 0, // Add if needed
          photoCount: 0,
        });

        result.push({
          date: dateStr,
          intensity,
          sleepMinutes,
          feedCount,
          diaperCount,
          pumpingOz: 0,
          photoCount: 0,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      setActivities(result);
    } catch (error) {
      console.error('Error fetching pattern data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [babyId, weeks]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { activities, isLoading, refresh: fetchData };
}
```

---

## 9. Services

### 9.1 Sleep Targets

```typescript
// src/services/sleepTargets.ts

export interface SleepTarget {
  totalHours: { min: number; max: number };
  naps: { min: number; max: number };
  wakeWindow: { min: number; max: number }; // in minutes
  nightSleep: { min: number; max: number };
}

export function getSleepTargets(ageMonths: number): SleepTarget {
  if (ageMonths < 1) {
    return {
      totalHours: { min: 14, max: 17 },
      naps: { min: 5, max: 6 },
      wakeWindow: { min: 45, max: 60 },
      nightSleep: { min: 8, max: 10 },
    };
  }
  
  if (ageMonths < 3) {
    return {
      totalHours: { min: 14, max: 16 },
      naps: { min: 4, max: 5 },
      wakeWindow: { min: 60, max: 90 },
      nightSleep: { min: 9, max: 10 },
    };
  }
  
  if (ageMonths < 5) {
    return {
      totalHours: { min: 13, max: 15 },
      naps: { min: 3, max: 4 },
      wakeWindow: { min: 75, max: 120 },
      nightSleep: { min: 10, max: 11 },
    };
  }
  
  if (ageMonths < 8) {
    return {
      totalHours: { min: 13, max: 15 },
      naps: { min: 2, max: 3 },
      wakeWindow: { min: 120, max: 180 },
      nightSleep: { min: 10, max: 11 },
    };
  }
  
  if (ageMonths < 13) {
    return {
      totalHours: { min: 12, max: 14 },
      naps: { min: 2, max: 2 },
      wakeWindow: { min: 150, max: 210 },
      nightSleep: { min: 11, max: 12 },
    };
  }
  
  if (ageMonths < 18) {
    return {
      totalHours: { min: 12, max: 14 },
      naps: { min: 1, max: 2 },
      wakeWindow: { min: 240, max: 360 },
      nightSleep: { min: 11, max: 12 },
    };
  }
  
  // 18+ months
  return {
    totalHours: { min: 11, max: 14 },
    naps: { min: 1, max: 1 },
    wakeWindow: { min: 300, max: 420 },
    nightSleep: { min: 11, max: 12 },
  };
}

export function getNextNapTime(lastWakeTime: Date, ageMonths: number): Date {
  const targets = getSleepTargets(ageMonths);
  const avgWakeWindow = (targets.wakeWindow.min + targets.wakeWindow.max) / 2;
  
  const nextNap = new Date(lastWakeTime);
  nextNap.setMinutes(nextNap.getMinutes() + avgWakeWindow);
  
  return nextNap;
}
```

### 9.2 Pattern Calculator

```typescript
// src/services/patternCalculator.ts

interface ActivityData {
  sleepMinutes: number;
  feedCount: number;
  diaperCount: number;
  pumpingOz: number;
  photoCount: number;
}

export function calculateIntensity(data: ActivityData): number {
  const { sleepMinutes, feedCount, diaperCount } = data;

  // No data
  if (sleepMinutes === 0 && feedCount === 0 && diaperCount === 0) {
    return 0;
  }

  // Calculate score based on activity levels
  // These thresholds can be adjusted based on age
  let score = 0;

  // Sleep score (target: 12-16 hours = 720-960 minutes)
  if (sleepMinutes > 0) {
    const sleepScore = Math.min(sleepMinutes / 720, 1);
    score += sleepScore * 40;
  }

  // Feed score (target: 6-12 feeds)
  if (feedCount > 0) {
    const feedScore = Math.min(feedCount / 8, 1);
    score += feedScore * 30;
  }

  // Diaper score (target: 6-10 diapers)
  if (diaperCount > 0) {
    const diaperScore = Math.min(diaperCount / 6, 1);
    score += diaperScore * 30;
  }

  // Convert score to intensity (0-4)
  if (score < 20) return 1;
  if (score < 40) return 2;
  if (score < 70) return 3;
  return 4;
}
```

### 9.3 Local Notifications

```typescript
// src/services/notifications.ts

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleNapReminder(
  napTime: Date,
  babyName: string
): Promise<string> {
  // Schedule 15 minutes before nap time
  const reminderTime = new Date(napTime);
  reminderTime.setMinutes(reminderTime.getMinutes() - 15);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nap Time Approaching',
      body: `${babyName}'s wake window is ending in 15 minutes`,
      sound: true,
    },
    trigger: {
      date: reminderTime,
    },
  });

  return id;
}

export async function scheduleMonthlyPhotoReminder(
  babyBirthDate: Date,
  babyName: string
): Promise<string> {
  // Calculate next month birthday
  const today = new Date();
  const nextMonthBirthday = new Date(babyBirthDate);
  
  while (nextMonthBirthday <= today) {
    nextMonthBirthday.setMonth(nextMonthBirthday.getMonth() + 1);
  }
  
  // Set reminder for 10 AM on that day
  nextMonthBirthday.setHours(10, 0, 0, 0);

  const monthsOld = Math.floor(
    (nextMonthBirthday.getTime() - babyBirthDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
  );

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📸 Monthly Photo Day!',
      body: `${babyName} is ${monthsOld} months old today!`,
      sound: true,
    },
    trigger: {
      date: nextMonthBirthday,
    },
  });

  return id;
}

export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
```

---

## 10. Export Service

```typescript
// src/services/export.ts

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getSleepLogs } from '../db/queries/sleep';
import { getFeedingLogs } from '../db/queries/feeding';
import { getDiaperLogs } from '../db/queries/diapers';
import { getPumpingLogs } from '../db/queries/pumping';
import type { Baby } from '../types';

export async function exportToCSV(baby: Baby): Promise<void> {
  const now = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1); // Last year of data

  const startStr = startDate.toISOString();
  const endStr = now.toISOString();

  // Fetch all data
  const [sleepLogs, feedingLogs, diaperLogs, pumpingLogs] = await Promise.all([
    getSleepLogs(baby.id, startStr, endStr),
    getFeedingLogs(baby.id, startStr, endStr),
    getDiaperLogs(baby.id, startStr, endStr),
    getPumpingLogs(baby.id, startStr, endStr),
  ]);

  // Build CSV content
  let csv = `Dotsby Export - ${baby.name}\n`;
  csv += `Exported: ${now.toLocaleString()}\n\n`;

  // Sleep logs
  csv += 'SLEEP LOGS\n';
  csv += 'Date,Start,End,Duration (min),Type,Quality,Notes\n';
  for (const log of sleepLogs) {
    const duration = log.endTime
      ? Math.floor((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 60000)
      : 0;
    csv += `${formatDate(log.startTime)},${formatTime(log.startTime)},${log.endTime ? formatTime(log.endTime) : 'ongoing'},${duration},${log.sleepType},${log.qualityRating || ''},${escapeCSV(log.notes)}\n`;
  }

  // Feeding logs
  csv += '\nFEEDING LOGS\n';
  csv += 'Date,Time,Type,Duration (min),Amount (oz),Content,Notes\n';
  for (const log of feedingLogs) {
    const duration = log.endTime
      ? Math.floor((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 60000)
      : 0;
    csv += `${formatDate(log.startTime)},${formatTime(log.startTime)},${log.feedType},${duration},${log.amountOz || ''},${log.contentType || ''},${escapeCSV(log.notes)}\n`;
  }

  // Diaper logs
  csv += '\nDIAPER LOGS\n';
  csv += 'Date,Time,Type,Color,Notes\n';
  for (const log of diaperLogs) {
    csv += `${formatDate(log.loggedAt)},${formatTime(log.loggedAt)},${log.diaperType},${log.color || ''},${escapeCSV(log.notes)}\n`;
  }

  // Pumping logs
  csv += '\nPUMPING LOGS\n';
  csv += 'Date,Time,Duration (min),Output (oz),Notes\n';
  for (const log of pumpingLogs) {
    const duration = log.endTime
      ? Math.floor((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 60000)
      : 0;
    csv += `${formatDate(log.startTime)},${formatTime(log.startTime)},${duration},${log.outputOz},${escapeCSV(log.notes)}\n`;
  }

  // Save and share
  const fileName = `dotsby-export-${formatDateFile(now)}.csv`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Dotsby Data',
    });
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateFile(date: Date): string {
  return date.toISOString().split('T')[0];
}

function escapeCSV(str: string | null | undefined): string {
  if (!str) return '';
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
```

---

## 11. Package.json

```json
{
  "name": "dotsby",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-sqlite": "~15.0.0",
    "expo-file-system": "~18.0.0",
    "expo-image-picker": "~16.0.0",
    "expo-notifications": "~0.29.0",
    "expo-sharing": "~13.0.0",
    "expo-haptics": "~14.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.1.0",
    "react-native-svg": "15.8.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "zustand": "^5.0.0",
    "@react-native-async-storage/async-storage": "^2.0.0",
    "lucide-react-native": "^0.460.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "typescript": "~5.3.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0"
  },
  "private": true
}
```

---

## 12. Development Checklist

### Phase 1: Core (Weeks 1-4)
- [ ] Project setup with Expo Router
- [ ] SQLite database schema and migrations
- [ ] Baby profile CRUD
- [ ] Sleep logging with timer
- [ ] Feeding logging with nursing timer
- [ ] Diaper logging
- [ ] Basic pattern grid (2 weeks)

### Phase 2: Features (Weeks 5-6)
- [ ] Full pattern grid (12 weeks)
- [ ] Sleep schedule calculator
- [ ] Pumping tracker
- [ ] Local notifications
- [ ] Photo capture and gallery

### Phase 3: Polish (Weeks 7-8)
- [ ] Premium unlock flow
- [ ] Data export
- [ ] Settings screen
- [ ] Dark mode
- [ ] Performance optimization
- [ ] App Store assets

---

*End of Technical Specification*
