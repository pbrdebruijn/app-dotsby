import { useEffect, useState, useCallback } from 'react';
import { getTodaySleepLogs, getTotalSleepToday } from '../db/queries/sleep';
import { getTodayFeedingLogs, getLastFeedingLog, getLastNursingSide } from '../db/queries/feeding';
import { getTodayDiaperCounts, getLastDiaperLog } from '../db/queries/diapers';
import { getTodayPumpingTotal, getLastPumpingLog } from '../db/queries/pumping';
import type { SleepLog, FeedingLog, DiaperLog, PumpingLog } from '../types';

interface TodayStats {
  sleepMinutes: number;
  feedCount: number;
  diaperCounts: { wet: number; dirty: number };
  pumpingOz: number;
  lastFeed: FeedingLog | null;
  lastSleep: SleepLog | null;
  lastDiaper: DiaperLog | null;
  lastPumping: PumpingLog | null;
  lastNursingSide: 'left' | 'right' | null;
  isLoading: boolean;
}

export function useTodayStats(babyId: string | null) {
  const [stats, setStats] = useState<TodayStats>({
    sleepMinutes: 0,
    feedCount: 0,
    diaperCounts: { wet: 0, dirty: 0 },
    pumpingOz: 0,
    lastFeed: null,
    lastSleep: null,
    lastDiaper: null,
    lastPumping: null,
    lastNursingSide: null,
    isLoading: true,
  });

  const fetchStats = useCallback(async () => {
    if (!babyId) {
      setStats((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const [
        sleepMinutes,
        feedingLogs,
        diaperCounts,
        pumpingOz,
        lastFeed,
        lastDiaper,
        lastPumping,
        lastNursingSide,
        todaySleepLogs,
      ] = await Promise.all([
        getTotalSleepToday(babyId),
        getTodayFeedingLogs(babyId),
        getTodayDiaperCounts(babyId),
        getTodayPumpingTotal(babyId),
        getLastFeedingLog(babyId),
        getLastDiaperLog(babyId),
        getLastPumpingLog(babyId),
        getLastNursingSide(babyId),
        getTodaySleepLogs(babyId),
      ]);

      const lastSleep = todaySleepLogs.length > 0 ? todaySleepLogs[0] : null;

      setStats({
        sleepMinutes,
        feedCount: feedingLogs.length,
        diaperCounts,
        pumpingOz,
        lastFeed,
        lastSleep,
        lastDiaper,
        lastPumping,
        lastNursingSide,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching today stats:', error);
      setStats((prev) => ({ ...prev, isLoading: false }));
    }
  }, [babyId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...stats, refresh: fetchStats };
}
