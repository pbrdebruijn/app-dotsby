import { getDatabase } from '../database';
import { generateId } from '../../utils/ids';
import type { SleepLog, SleepLogInsert, SleepLogRow } from '../../types';

function mapRowToSleepLog(row: SleepLogRow): SleepLog {
  return {
    id: row.id,
    babyId: row.baby_id,
    startTime: row.start_time,
    endTime: row.end_time,
    sleepType: row.sleep_type,
    location: row.location,
    qualityRating: row.quality_rating,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getSleepLogs(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<SleepLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SleepLogRow>(
    `SELECT * FROM sleep_logs
     WHERE baby_id = ? AND start_time >= ? AND start_time < ?
     ORDER BY start_time DESC`,
    [babyId, startDate, endDate]
  );
  return rows.map(mapRowToSleepLog);
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
  const row = await db.getFirstAsync<SleepLogRow>(
    'SELECT * FROM sleep_logs WHERE baby_id = ? ORDER BY start_time DESC LIMIT 1',
    [babyId]
  );
  return row ? mapRowToSleepLog(row) : null;
}

export async function getActiveSleepLog(babyId: string): Promise<SleepLog | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<SleepLogRow>(
    'SELECT * FROM sleep_logs WHERE baby_id = ? AND end_time IS NULL LIMIT 1',
    [babyId]
  );
  return row ? mapRowToSleepLog(row) : null;
}

export async function insertSleepLog(log: SleepLogInsert): Promise<SleepLog> {
  const db = await getDatabase();
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO sleep_logs (id, baby_id, start_time, end_time, sleep_type, location, quality_rating, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      log.babyId,
      log.startTime,
      log.endTime ?? null,
      log.sleepType,
      log.location ?? null,
      log.qualityRating ?? null,
      log.notes ?? null,
      now,
    ]
  );

  return {
    id,
    babyId: log.babyId,
    startTime: log.startTime,
    endTime: log.endTime ?? null,
    sleepType: log.sleepType,
    location: log.location ?? null,
    qualityRating: log.qualityRating ?? null,
    notes: log.notes ?? null,
    createdAt: now,
  };
}

export async function endSleepLog(id: string, endTime: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE sleep_logs SET end_time = ? WHERE id = ?', [endTime, id]);
}

export async function updateSleepLog(id: string, updates: Partial<SleepLogInsert>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.startTime !== undefined) {
    fields.push('start_time = ?');
    values.push(updates.startTime);
  }
  if (updates.endTime !== undefined) {
    fields.push('end_time = ?');
    values.push(updates.endTime ?? null);
  }
  if (updates.sleepType !== undefined) {
    fields.push('sleep_type = ?');
    values.push(updates.sleepType);
  }
  if (updates.location !== undefined) {
    fields.push('location = ?');
    values.push(updates.location ?? null);
  }
  if (updates.qualityRating !== undefined) {
    fields.push('quality_rating = ?');
    values.push(updates.qualityRating ?? null);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes ?? null);
  }

  if (fields.length > 0) {
    values.push(id);
    await db.runAsync(`UPDATE sleep_logs SET ${fields.join(', ')} WHERE id = ?`, values);
  }
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

export async function getTotalSleepToday(babyId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await getSleepMinutesByDay(babyId, today.toISOString(), tomorrow.toISOString());
  return result[0]?.minutes ?? 0;
}
