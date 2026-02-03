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

export const INTENSITY_COLORS = {
  light: [
    '#EEEEF0', // 0 - no data
    '#C0C0C4', // 1 - low
    '#808088', // 2 - medium-low
    '#44444C', // 3 - medium-high
    '#000000', // 4 - high
  ],
  dark: [
    '#1C1C1E', // 0 - no data
    '#3A3A3C', // 1 - low
    '#6C6C70', // 2 - medium-low
    '#AEAEB2', // 3 - medium-high
    '#FFFFFF', // 4 - high
  ],
};

export function getIntensityColor(intensity: number, isDark = false): string {
  const colors = isDark ? INTENSITY_COLORS.dark : INTENSITY_COLORS.light;
  return colors[Math.min(Math.max(0, intensity), 4)];
}

export function getIntensityLabel(intensity: number): string {
  switch (intensity) {
    case 0:
      return 'No data';
    case 1:
      return 'Light';
    case 2:
      return 'Moderate';
    case 3:
      return 'Active';
    case 4:
      return 'Very active';
    default:
      return 'Unknown';
  }
}
