import { getDatabase } from '../database';
import { generateId } from '../../utils/ids';
import type { MilestonePhoto, MilestonePhotoInsert, MilestonePhotoRow } from '../../types';

function mapRowToPhoto(row: MilestonePhotoRow): MilestonePhoto {
  return {
    id: row.id,
    babyId: row.baby_id,
    imageUri: row.image_uri,
    thumbnailUri: row.thumbnail_uri,
    takenAt: row.taken_at,
    monthNumber: row.month_number,
    milestoneType: row.milestone_type,
    milestoneName: row.milestone_name,
    caption: row.caption,
    isFavorite: Boolean(row.is_favorite),
    createdAt: row.created_at,
  };
}

export async function getAllPhotos(babyId: string): Promise<MilestonePhoto[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MilestonePhotoRow>(
    'SELECT * FROM milestone_photos WHERE baby_id = ? ORDER BY taken_at DESC',
    [babyId]
  );
  return rows.map(mapRowToPhoto);
}

export async function getPhotosByMonth(babyId: string, monthNumber: number): Promise<MilestonePhoto[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MilestonePhotoRow>(
    'SELECT * FROM milestone_photos WHERE baby_id = ? AND month_number = ? ORDER BY taken_at DESC',
    [babyId, monthNumber]
  );
  return rows.map(mapRowToPhoto);
}

export async function getFavoritePhotos(babyId: string): Promise<MilestonePhoto[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MilestonePhotoRow>(
    'SELECT * FROM milestone_photos WHERE baby_id = ? AND is_favorite = 1 ORDER BY taken_at DESC',
    [babyId]
  );
  return rows.map(mapRowToPhoto);
}

export async function getPhotoCount(babyId: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM milestone_photos WHERE baby_id = ?',
    [babyId]
  );
  return result?.count ?? 0;
}

export async function insertPhoto(photo: MilestonePhotoInsert): Promise<MilestonePhoto> {
  const db = await getDatabase();
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO milestone_photos (id, baby_id, image_uri, thumbnail_uri, taken_at, month_number, milestone_type, milestone_name, caption, is_favorite, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      photo.babyId,
      photo.imageUri,
      photo.thumbnailUri ?? null,
      photo.takenAt,
      photo.monthNumber ?? null,
      photo.milestoneType,
      photo.milestoneName ?? null,
      photo.caption ?? null,
      photo.isFavorite ? 1 : 0,
      now,
    ]
  );

  return {
    id,
    babyId: photo.babyId,
    imageUri: photo.imageUri,
    thumbnailUri: photo.thumbnailUri ?? null,
    takenAt: photo.takenAt,
    monthNumber: photo.monthNumber ?? null,
    milestoneType: photo.milestoneType,
    milestoneName: photo.milestoneName ?? null,
    caption: photo.caption ?? null,
    isFavorite: photo.isFavorite ?? false,
    createdAt: now,
  };
}

export async function updatePhoto(id: string, updates: Partial<MilestonePhotoInsert>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.caption !== undefined) {
    fields.push('caption = ?');
    values.push(updates.caption ?? null);
  }
  if (updates.milestoneName !== undefined) {
    fields.push('milestone_name = ?');
    values.push(updates.milestoneName ?? null);
  }
  if (updates.isFavorite !== undefined) {
    fields.push('is_favorite = ?');
    values.push(updates.isFavorite ? 1 : 0);
  }

  if (fields.length > 0) {
    values.push(id);
    await db.runAsync(`UPDATE milestone_photos SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function toggleFavorite(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE milestone_photos SET is_favorite = NOT is_favorite WHERE id = ?',
    [id]
  );
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM milestone_photos WHERE id = ?', [id]);
}
