import { getDatabase } from '../database';
import { generateId } from '../../utils/ids';
import type { DiaperLog, DiaperLogInsert, DiaperLogRow } from '../../types';

function mapRowToDiaperLog(row: DiaperLogRow): DiaperLog {
  return {
    id: row.id,
    babyId: row.baby_id,
    loggedAt: row.logged_at,
    diaperType: row.diaper_type,
    color: row.color,
    consistency: row.consistency,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getDiaperLogs(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<DiaperLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DiaperLogRow>(
    `SELECT * FROM diaper_logs
     WHERE baby_id = ? AND logged_at >= ? AND logged_at < ?
     ORDER BY logged_at DESC`,
    [babyId, startDate, endDate]
  );
  return rows.map(mapRowToDiaperLog);
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

export async function getLastDiaperLog(babyId: string): Promise<DiaperLog | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<DiaperLogRow>(
    'SELECT * FROM diaper_logs WHERE baby_id = ? ORDER BY logged_at DESC LIMIT 1',
    [babyId]
  );
  return row ? mapRowToDiaperLog(row) : null;
}

export async function insertDiaperLog(log: DiaperLogInsert): Promise<DiaperLog> {
  const db = await getDatabase();
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO diaper_logs (id, baby_id, logged_at, diaper_type, color, consistency, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      log.babyId,
      log.loggedAt,
      log.diaperType,
      log.color ?? null,
      log.consistency ?? null,
      log.notes ?? null,
      now,
    ]
  );

  return {
    id,
    babyId: log.babyId,
    loggedAt: log.loggedAt,
    diaperType: log.diaperType,
    color: log.color ?? null,
    consistency: log.consistency ?? null,
    notes: log.notes ?? null,
    createdAt: now,
  };
}

export async function updateDiaperLog(id: string, updates: Partial<DiaperLogInsert>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (updates.loggedAt !== undefined) {
    fields.push('logged_at = ?');
    values.push(updates.loggedAt);
  }
  if (updates.diaperType !== undefined) {
    fields.push('diaper_type = ?');
    values.push(updates.diaperType);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color ?? null);
  }
  if (updates.consistency !== undefined) {
    fields.push('consistency = ?');
    values.push(updates.consistency ?? null);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes ?? null);
  }

  if (fields.length > 0) {
    values.push(id);
    await db.runAsync(`UPDATE diaper_logs SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteDiaperLog(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM diaper_logs WHERE id = ?', [id]);
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
