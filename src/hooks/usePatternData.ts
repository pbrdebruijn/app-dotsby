import { useEffect, useState, useCallback } from 'react';
import { getSleepMinutesByDay } from '../db/queries/sleep';
import { getFeedCountByDay } from '../db/queries/feeding';
import { getDiaperCountByDay } from '../db/queries/diapers';
import { getPumpingOzByDay } from '../db/queries/pumping';
import { calculateIntensity } from '../services/patternCalculator';
import type { DayActivity } from '../types';

export function usePatternData(babyId: string | null, weeks: number = 12) {
  const [activities, setActivities] = useState<DayActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!babyId) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - weeks * 7);

      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();

      // Fetch all data in parallel
      const [sleepData, feedData, diaperData, pumpingData] = await Promise.all([
        getSleepMinutesByDay(babyId, startStr, endStr),
        getFeedCountByDay(babyId, startStr, endStr),
        getDiaperCountByDay(babyId, startStr, endStr),
        getPumpingOzByDay(babyId, startStr, endStr),
      ]);

      // Create maps for quick lookup
      const sleepMap = new Map(sleepData.map((d) => [d.date, d.minutes]));
      const feedMap = new Map(feedData.map((d) => [d.date, d.count]));
      const diaperMap = new Map(diaperData.map((d) => [d.date, d.count]));
      const pumpingMap = new Map(pumpingData.map((d) => [d.date, d.total_oz]));

      // Generate activities for each day
      const result: DayActivity[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];

        const sleepMinutes = sleepMap.get(dateStr) || 0;
        const feedCount = feedMap.get(dateStr) || 0;
        const diaperCount = diaperMap.get(dateStr) || 0;
        const pumpingOz = pumpingMap.get(dateStr) || 0;

        const intensity = calculateIntensity({
          sleepMinutes,
          feedCount,
          diaperCount,
          pumpingOz,
          photoCount: 0,
        });

        result.push({
          date: dateStr,
          intensity,
          sleepMinutes,
          feedCount,
          diaperCount,
          pumpingOz,
          photoCount: 0,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      setActivities(result);
    } catch (error) {
      console.error('Error fetching pattern data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [babyId, weeks]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { activities, isLoading, refresh: fetchData };
}
