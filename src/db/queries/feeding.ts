import { getDatabase } from '../database';
import { generateId } from '../../utils/ids';
import type { FeedingLog, FeedingLogInsert, FeedingLogRow } from '../../types';

function mapRowToFeedingLog(row: FeedingLogRow): FeedingLog {
  return {
    id: row.id,
    babyId: row.baby_id,
    feedType: row.feed_type,
    startTime: row.start_time,
    endTime: row.end_time,
    amountOz: row.amount_oz,
    contentType: row.content_type,
    foodName: row.food_name,
    reactionFlag: Boolean(row.reaction_flag),
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getFeedingLogs(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<FeedingLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<FeedingLogRow>(
    `SELECT * FROM feeding_logs
     WHERE baby_id = ? AND start_time >= ? AND start_time < ?
     ORDER BY start_time DESC`,
    [babyId, startDate, endDate]
  );
  return rows.map(mapRowToFeedingLog);
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
  const row = await db.getFirstAsync<FeedingLogRow>(
    'SELECT * FROM feeding_logs WHERE baby_id = ? ORDER BY start_time DESC LIMIT 1',
    [babyId]
  );
  return row ? mapRowToFeedingLog(row) : null;
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
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO feeding_logs (id, baby_id, feed_type, start_time, end_time, amount_oz, content_type, food_name, reaction_flag, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      log.babyId,
      log.feedType,
      log.startTime,
      log.endTime ?? null,
      log.amountOz ?? null,
      log.contentType ?? null,
      log.foodName ?? null,
      log.reactionFlag ? 1 : 0,
      log.notes ?? null,
      now,
    ]
  );

  return {
    id,
    babyId: log.babyId,
    feedType: log.feedType,
    startTime: log.startTime,
    endTime: log.endTime ?? null,
    amountOz: log.amountOz ?? null,
    contentType: log.contentType ?? null,
    foodName: log.foodName ?? null,
    reactionFlag: log.reactionFlag ?? false,
    notes: log.notes ?? null,
    createdAt: now,
  };
}

export async function updateFeedingLog(id: string, updates: Partial<FeedingLogInsert>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.feedType !== undefined) {
    fields.push('feed_type = ?');
    values.push(updates.feedType);
  }
  if (updates.startTime !== undefined) {
    fields.push('start_time = ?');
    values.push(updates.startTime);
  }
  if (updates.endTime !== undefined) {
    fields.push('end_time = ?');
    values.push(updates.endTime ?? null);
  }
  if (updates.amountOz !== undefined) {
    fields.push('amount_oz = ?');
    values.push(updates.amountOz ?? null);
  }
  if (updates.contentType !== undefined) {
    fields.push('content_type = ?');
    values.push(updates.contentType ?? null);
  }
  if (updates.foodName !== undefined) {
    fields.push('food_name = ?');
    values.push(updates.foodName ?? null);
  }
  if (updates.reactionFlag !== undefined) {
    fields.push('reaction_flag = ?');
    values.push(updates.reactionFlag ? 1 : 0);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes ?? null);
  }

  if (fields.length > 0) {
    values.push(id);
    await db.runAsync(`UPDATE feeding_logs SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteFeedingLog(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM feeding_logs WHERE id = ?', [id]);
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

export async function getTodayFeedCount(babyId: string): Promise<number> {
  const logs = await getTodayFeedingLogs(babyId);
  return logs.length;
}
