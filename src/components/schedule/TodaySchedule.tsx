import React from 'react';
import { View, Text } from 'react-native';
import { Moon, Clock, Zap } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { useSleepSchedule } from '../../hooks/useSleepSchedule';
import { useBabyStore } from '../../stores/babyStore';
import { useIsDark } from '../ThemeProvider';
import { formatDuration, formatTime, formatRelativeTime } from '../../utils/dates';

interface TodayScheduleProps {
  babyId: string | null;
}

export function TodaySchedule({ babyId }: TodayScheduleProps) {
  const babies = useBabyStore((s) => s.babies);
  const baby = babies.find((b) => b.id === babyId) || null;
  const schedule = useSleepSchedule(baby);
  const isDark = useIsDark();

  if (schedule.isLoading) {
    return (
      <Card className="bg-gray-100 dark:bg-zinc-900">
        <View className="h-32 items-center justify-center">
          <Text className="text-gray-400">Loading...</Text>
        </View>
      </Card>
    );
  }

  if (!baby) {
    return (
      <Card className="bg-gray-100 dark:bg-zinc-900">
        <View className="h-32 items-center justify-center">
          <Text className="text-gray-400">No baby selected</Text>
        </View>
      </Card>
    );
  }

  // Currently sleeping
  if (schedule.activeSleep) {
    return (
      <Card className="bg-black dark:bg-white">
        <View className="flex-row items-center mb-3">
          <Moon size={20} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={1.5} />
          <Text className="text-white dark:text-black font-semibold ml-2">Currently Sleeping</Text>
        </View>
        <Text className="text-gray-300 dark:text-gray-600">
          Started {formatRelativeTime(schedule.activeSleep.startTime)}
        </Text>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-100 dark:bg-zinc-900">
      {/* Wake Window Progress */}
      {schedule.wakeWindowProgress && (
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Clock size={16} color={isDark ? '#999999' : '#666666'} strokeWidth={1.5} />
              <Text className="text-gray-600 dark:text-gray-400 ml-1.5">Wake window</Text>
            </View>
            <Text className="text-gray-600 dark:text-gray-400">
              {schedule.wakeWindowProgress.minutesAwake}m awake
            </Text>
          </View>

          {/* Progress bar */}
          <View className="h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${
                schedule.wakeWindowProgress.isOverdue ? 'bg-red-500' : 'bg-black dark:bg-white'
              }`}
              style={{ width: `${schedule.wakeWindowProgress.progress * 100}%` }}
            />
          </View>

          {schedule.nextNapTime && (
            <Text className="text-gray-500 text-sm mt-2">
              {schedule.wakeWindowProgress.isOverdue
                ? 'Past ideal nap time'
                : `Next nap around ${formatTime(schedule.nextNapTime)}`}
            </Text>
          )}
        </View>
      )}

      {/* Today's Stats */}
      <View className="flex-row gap-4">
        <View className="flex-1 bg-white dark:bg-zinc-800 rounded-xl p-3">
          <View className="flex-row items-center mb-1">
            <Moon size={14} color={isDark ? '#999999' : '#666666'} strokeWidth={1.5} />
            <Text className="text-gray-500 text-xs ml-1">Total Sleep</Text>
          </View>
          <Text className="text-xl font-semibold text-black dark:text-white">
            {schedule.totalSleepMinutes > 0
              ? formatDuration(schedule.totalSleepMinutes)
              : '--'}
          </Text>
        </View>

        <View className="flex-1 bg-white dark:bg-zinc-800 rounded-xl p-3">
          <View className="flex-row items-center mb-1">
            <Zap size={14} color={isDark ? '#999999' : '#666666'} strokeWidth={1.5} />
            <Text className="text-gray-500 text-xs ml-1">Naps Today</Text>
          </View>
          <Text className="text-xl font-semibold text-black dark:text-white">
            {schedule.napsToday} / {schedule.targets.naps.max}
          </Text>
        </View>
      </View>

      {/* Target info */}
      <Text className="text-gray-400 text-xs mt-3 text-center">
        Target: {schedule.targets.totalHours.min}-{schedule.targets.totalHours.max}h total sleep
      </Text>
    </Card>
  );
}
