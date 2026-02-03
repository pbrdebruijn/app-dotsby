export const FREE_BABY_LIMIT = 1;
export const FREE_PHOTO_LIMIT = 24;
export const FREE_PATTERN_WEEKS_OPTIONS = [1, 4, 8, 12] as const;
export const PREMIUM_PATTERN_WEEKS_OPTIONS = [1, 4, 8, 12, 26, 52] as const;

export function canAddBaby(currentCount: number, isPremium: boolean): boolean {
  return isPremium || currentCount < FREE_BABY_LIMIT;
}

export function canAddPhoto(currentCount: number, isPremium: boolean): boolean {
  return isPremium || currentCount < FREE_PHOTO_LIMIT;
}
