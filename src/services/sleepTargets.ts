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

export function getWakeWindowProgress(lastWakeTime: Date, ageMonths: number): {
  progress: number; // 0-1
  minutesAwake: number;
  minutesRemaining: number;
  isOverdue: boolean;
} {
  const targets = getSleepTargets(ageMonths);
  const avgWakeWindow = (targets.wakeWindow.min + targets.wakeWindow.max) / 2;
  const minutesAwake = Math.floor((Date.now() - lastWakeTime.getTime()) / 60000);
  const minutesRemaining = Math.max(0, avgWakeWindow - minutesAwake);
  const progress = Math.min(1, minutesAwake / avgWakeWindow);

  return {
    progress,
    minutesAwake,
    minutesRemaining,
    isOverdue: minutesAwake > targets.wakeWindow.max,
  };
}

export function formatWakeWindowStatus(lastWakeTime: Date, ageMonths: number): string {
  const { minutesRemaining, isOverdue } = getWakeWindowProgress(lastWakeTime, ageMonths);

  if (isOverdue) {
    return 'Past nap time';
  }

  if (minutesRemaining < 60) {
    return `${minutesRemaining}m until nap`;
  }

  const hours = Math.floor(minutesRemaining / 60);
  const mins = minutesRemaining % 60;
  return `${hours}h ${mins}m until nap`;
}
