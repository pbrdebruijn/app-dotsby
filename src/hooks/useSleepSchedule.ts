import { useEffect, useState, useCallback } from 'react';
import { getLastSleepLog, getTodaySleepLogs, getActiveSleepLog } from '../db/queries/sleep';
import { getSleepTargets, getWakeWindowProgress, getNextNapTime } from '../services/sleepTargets';
import { getAgeInMonths } from '../utils/dates';
import type { SleepLog, Baby } from '../types';

interface SleepScheduleData {
  lastSleep: SleepLog | null;
  activeSleep: SleepLog | null;
  todaySleep: SleepLog[];
  totalSleepMinutes: number;
  napsToday: number;
  wakeWindowProgress: {
    progress: number;
    minutesAwake: number;
    minutesRemaining: number;
    isOverdue: boolean;
  } | null;
  nextNapTime: Date | null;
  targets: ReturnType<typeof getSleepTargets>;
  isLoading: boolean;
}

export function useSleepSchedule(baby: Baby | null) {
  const [data, setData] = useState<SleepScheduleData>({
    lastSleep: null,
    activeSleep: null,
    todaySleep: [],
    totalSleepMinutes: 0,
    napsToday: 0,
    wakeWindowProgress: null,
    nextNapTime: null,
    targets: getSleepTargets(0),
    isLoading: true,
  });

  const fetchData = useCallback(async () => {
    if (!baby) {
      setData((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const ageMonths = getAgeInMonths(baby.birthDate);
      const targets = getSleepTargets(ageMonths);

      const [lastSleep, activeSleep, todaySleep] = await Promise.all([
        getLastSleepLog(baby.id),
        getActiveSleepLog(baby.id),
        getTodaySleepLogs(baby.id),
      ]);

      // Calculate total sleep today
      const totalSleepMinutes = todaySleep.reduce((sum, log) => {
        if (log.endTime) {
          const duration = Math.floor(
            (new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 60000
          );
          return sum + duration;
        }
        return sum;
      }, 0);

      // Count naps today
      const napsToday = todaySleep.filter((log) => log.sleepType === 'nap').length;

      // Calculate wake window progress
      let wakeWindowProgress = null;
      let nextNapTime = null;

      if (lastSleep?.endTime && !activeSleep) {
        const lastWakeTime = new Date(lastSleep.endTime);
        wakeWindowProgress = getWakeWindowProgress(lastWakeTime, ageMonths);
        nextNapTime = getNextNapTime(lastWakeTime, ageMonths);
      }

      setData({
        lastSleep,
        activeSleep,
        todaySleep,
        totalSleepMinutes,
        napsToday,
        wakeWindowProgress,
        nextNapTime,
        targets,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching sleep schedule:', error);
      setData((prev) => ({ ...prev, isLoading: false }));
    }
  }, [baby]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every minute for accurate wake window tracking
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { ...data, refresh: fetchData };
}
