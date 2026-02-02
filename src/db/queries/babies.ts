import { getDatabase } from '../database';
import { generateId } from '../../utils/ids';
import type { Baby, BabyInsert, BabyRow } from '../../types';

function mapRowToBaby(row: BabyRow): Baby {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birth_date,
    avatarUri: row.avatar_uri,
    createdAt: row.created_at,
  };
}

export async function getAllBabies(): Promise<Baby[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<BabyRow>('SELECT * FROM babies ORDER BY created_at DESC');
  return rows.map(mapRowToBaby);
}

export async function getBabyById(id: string): Promise<Baby | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<BabyRow>('SELECT * FROM babies WHERE id = ?', [id]);
  return row ? mapRowToBaby(row) : null;
}

export async function insertBaby(baby: BabyInsert): Promise<Baby> {
  const db = await getDatabase();
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    'INSERT INTO babies (id, name, birth_date, avatar_uri, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, baby.name, baby.birthDate, baby.avatarUri ?? null, now]
  );

  // Create default settings
  await db.runAsync(
    'INSERT INTO baby_settings (id, baby_id) VALUES (?, ?)',
    [generateId(), id]
  );

  return {
    id,
    name: baby.name,
    birthDate: baby.birthDate,
    avatarUri: baby.avatarUri ?? null,
    createdAt: now,
  };
}

export async function updateBaby(id: string, updates: Partial<BabyInsert>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | null)[] = [];

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
    values.push(updates.avatarUri ?? null);
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

export async function getBabyCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM babies');
  return result?.count ?? 0;
}
