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

// Baby Settings
export interface BabySettings {
  id: string;
  babyId: string;
  dailyPumpingGoalOz?: number | null;
  feedingReminderHours?: number | null;
  useMetricUnits: boolean;
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
export type FeedType = 'breast_left' | 'breast_right' | 'bottle' | 'solids';
export type ContentType = 'breast_milk' | 'formula' | 'food';

export interface FeedingLog {
  id: string;
  babyId: string;
  feedType: FeedType;
  startTime: string;
  endTime?: string | null;
  amountOz?: number | null;
  contentType?: ContentType | null;
  foodName?: string | null;
  reactionFlag: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface FeedingLogInsert {
  babyId: string;
  feedType: FeedType;
  startTime: string;
  endTime?: string | null;
  amountOz?: number | null;
  contentType?: ContentType | null;
  foodName?: string | null;
  reactionFlag?: boolean;
  notes?: string | null;
}

// Diaper
export type DiaperType = 'wet' | 'dirty' | 'both';

export interface DiaperLog {
  id: string;
  babyId: string;
  loggedAt: string;
  diaperType: DiaperType;
  color?: string | null;
  consistency?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface DiaperLogInsert {
  babyId: string;
  loggedAt: string;
  diaperType: DiaperType;
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
export type MilestoneType = 'monthly' | 'developmental' | 'custom';

export interface MilestonePhoto {
  id: string;
  babyId: string;
  imageUri: string;
  thumbnailUri?: string | null;
  takenAt: string;
  monthNumber?: number | null;
  milestoneType: MilestoneType;
  milestoneName?: string | null;
  caption?: string | null;
  isFavorite: boolean;
  createdAt: string;
}

export interface MilestonePhotoInsert {
  babyId: string;
  imageUri: string;
  thumbnailUri?: string | null;
  takenAt: string;
  monthNumber?: number | null;
  milestoneType: MilestoneType;
  milestoneName?: string | null;
  caption?: string | null;
  isFavorite?: boolean;
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

// Database row types (snake_case from SQLite)
export interface BabyRow {
  id: string;
  name: string;
  birth_date: string;
  avatar_uri: string | null;
  created_at: string;
}

export interface SleepLogRow {
  id: string;
  baby_id: string;
  start_time: string;
  end_time: string | null;
  sleep_type: 'nap' | 'night';
  location: string | null;
  quality_rating: number | null;
  notes: string | null;
  created_at: string;
}

export interface FeedingLogRow {
  id: string;
  baby_id: string;
  feed_type: FeedType;
  start_time: string;
  end_time: string | null;
  amount_oz: number | null;
  content_type: ContentType | null;
  food_name: string | null;
  reaction_flag: number;
  notes: string | null;
  created_at: string;
}

export interface DiaperLogRow {
  id: string;
  baby_id: string;
  logged_at: string;
  diaper_type: DiaperType;
  color: string | null;
  consistency: string | null;
  notes: string | null;
  created_at: string;
}

export interface PumpingLogRow {
  id: string;
  baby_id: string;
  start_time: string;
  end_time: string | null;
  output_oz: number;
  output_left_oz: number | null;
  output_right_oz: number | null;
  notes: string | null;
  created_at: string;
}

export interface MilestonePhotoRow {
  id: string;
  baby_id: string;
  image_uri: string;
  thumbnail_uri: string | null;
  taken_at: string;
  month_number: number | null;
  milestone_type: MilestoneType;
  milestone_name: string | null;
  caption: string | null;
  is_favorite: number;
  created_at: string;
}
