import { getDatabase } from '../database';
import { generateId } from '../../utils/ids';
import type { PumpingLog, PumpingLogInsert, PumpingLogRow } from '../../types';

function mapRowToPumpingLog(row: PumpingLogRow): PumpingLog {
  return {
    id: row.id,
    babyId: row.baby_id,
    startTime: row.start_time,
    endTime: row.end_time,
    outputOz: row.output_oz,
    outputLeftOz: row.output_left_oz,
    outputRightOz: row.output_right_oz,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getPumpingLogs(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<PumpingLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PumpingLogRow>(
    `SELECT * FROM pumping_logs
     WHERE baby_id = ? AND start_time >= ? AND start_time < ?
     ORDER BY start_time DESC`,
    [babyId, startDate, endDate]
  );
  return rows.map(mapRowToPumpingLog);
}

export async function getTodayPumpingLogs(babyId: string): Promise<PumpingLog[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getPumpingLogs(babyId, today.toISOString(), tomorrow.toISOString());
}

export async function getLastPumpingLog(babyId: string): Promise<PumpingLog | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PumpingLogRow>(
    'SELECT * FROM pumping_logs WHERE baby_id = ? ORDER BY start_time DESC LIMIT 1',
    [babyId]
  );
  return row ? mapRowToPumpingLog(row) : null;
}

export async function getTodayPumpingTotal(babyId: string): Promise<number> {
  const logs = await getTodayPumpingLogs(babyId);
  return logs.reduce((sum, log) => sum + log.outputOz, 0);
}

export async function insertPumpingLog(log: PumpingLogInsert): Promise<PumpingLog> {
  const db = await getDatabase();
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO pumping_logs (id, baby_id, start_time, end_time, output_oz, output_left_oz, output_right_oz, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      log.babyId,
      log.startTime,
      log.endTime ?? null,
      log.outputOz,
      log.outputLeftOz ?? null,
      log.outputRightOz ?? null,
      log.notes ?? null,
      now,
    ]
  );

  return {
    id,
    babyId: log.babyId,
    startTime: log.startTime,
    endTime: log.endTime ?? null,
    outputOz: log.outputOz,
    outputLeftOz: log.outputLeftOz ?? null,
    outputRightOz: log.outputRightOz ?? null,
    notes: log.notes ?? null,
    createdAt: now,
  };
}

export async function updatePumpingLog(id: string, updates: Partial<PumpingLogInsert>): Promise<void> {
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
  if (updates.outputOz !== undefined) {
    fields.push('output_oz = ?');
    values.push(updates.outputOz);
  }
  if (updates.outputLeftOz !== undefined) {
    fields.push('output_left_oz = ?');
    values.push(updates.outputLeftOz ?? null);
  }
  if (updates.outputRightOz !== undefined) {
    fields.push('output_right_oz = ?');
    values.push(updates.outputRightOz ?? null);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes ?? null);
  }

  if (fields.length > 0) {
    values.push(id);
    await db.runAsync(`UPDATE pumping_logs SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deletePumpingLog(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM pumping_logs WHERE id = ?', [id]);
}

export async function getPumpingOzByDay(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<{ date: string; total_oz: number }[]> {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT date(start_time) as date, SUM(output_oz) as total_oz
     FROM pumping_logs
     WHERE baby_id = ? AND start_time >= ? AND start_time < ?
     GROUP BY date(start_time)
     ORDER BY date`,
    [babyId, startDate, endDate]
  );
}
