import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Moon, Baby, Droplets, Milk } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { PatternGrid } from '../../src/components/patterns/PatternGrid';
import { DayDetailSheet } from '../../src/components/patterns/DayDetailSheet';
import { useAppStore } from '../../src/stores/appStore';
import { useBabyStore } from '../../src/stores/babyStore';
import { usePatternData } from '../../src/hooks/usePatternData';
import { useIsDark } from '../../src/components/ThemeProvider';
import { formatDuration } from '../../src/utils/dates';
import { getIntensityColor } from '../../src/services/patternCalculator';
import { FREE_PATTERN_WEEKS_OPTIONS, PREMIUM_PATTERN_WEEKS_OPTIONS } from '../../src/utils/premium';
import type { DayActivity } from '../../src/types';

type TimeRange = 1 | 4 | 8 | 12 | 26 | 52;

export default function PatternsScreen() {
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(1);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const selectedBabyId = useAppStore((s) => s.selectedBabyId);
  const hasUnlockedPremium = useAppStore((s) => s.hasUnlockedPremium);
  const babies = useBabyStore((s) => s.babies);
  const selectedBaby = babies.find((b) => b.id === selectedBabyId);
  const isDark = useIsDark();

  const weeksOptions = hasUnlockedPremium ? PREMIUM_PATTERN_WEEKS_OPTIONS : FREE_PATTERN_WEEKS_OPTIONS;

  const { activities, isLoading, refresh } = usePatternData(selectedBabyId, timeRange);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Calculate totals for the period
  const totals = activities.reduce(
    (acc, day) => ({
      sleepMinutes: acc.sleepMinutes + day.sleepMinutes,
      feedCount: acc.feedCount + day.feedCount,
      diaperCount: acc.diaperCount + day.diaperCount,
      pumpingOz: acc.pumpingOz + day.pumpingOz,
      daysWithData: acc.daysWithData + (day.intensity > 0 ? 1 : 0),
    }),
    { sleepMinutes: 0, feedCount: 0, diaperCount: 0, pumpingOz: 0, daysWithData: 0 }
  );

  const avgSleepPerDay = totals.daysWithData > 0 ? totals.sleepMinutes / totals.daysWithData : 0;
  const avgFeedsPerDay = totals.daysWithData > 0 ? totals.feedCount / totals.daysWithData : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = activities.find((a) => a.date === todayStr);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#FFFFFF' : '#000000'} />
        }
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-black dark:text-white">Patterns</Text>
          {selectedBaby && (
            <Text className="text-gray-500 mt-1">{selectedBaby.name}'s activity</Text>
          )}
        </View>

        {/* Time Range Selector */}
        <View className="flex-row gap-2 mb-6">
          {(weeksOptions as readonly number[]).map((range) => {
            const label = range === 26 ? '6mo' : range === 52 ? '1yr' : `${range}w`;
            return (
              <Pressable
                key={range}
                onPress={() => {
                  Haptics.selectionAsync();
                  setTimeRange(range as TimeRange);
                }}
                className={`flex-1 py-2 rounded-full items-center ${
                  timeRange === range ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'
                }`}
              >
                <Text
                  className={`font-medium ${
                    timeRange === range ? 'text-white dark:text-black' : 'text-black dark:text-white'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Pattern Grid */}
        <View className="mb-6">
          <PatternGrid
            activities={activities}
            weeks={timeRange}
            onDayPress={(day) => {
              Haptics.selectionAsync();
              setSelectedDay(day);
            }}
          />
          {!hasUnlockedPremium && (
            <Pressable
              onPress={() => router.push('/premium')}
              className="mt-3 items-center"
            >
              <Text className="text-gray-400 text-sm">
                Upgrade for longer history
              </Text>
            </Pressable>
          )}
        </View>

        {/* Today's Activity Card — shown when data is sparse */}
        {todayActivity && todayActivity.intensity > 0 && totals.daysWithData <= 7 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-black dark:text-white mb-3">Today</Text>
            <View className="bg-gray-100 dark:bg-zinc-900 rounded-2xl p-4">
              <View className="flex-row items-center mb-4">
                <View
                  className="w-5 h-5 rounded-sm mr-2"
                  style={{ backgroundColor: getIntensityColor(todayActivity.intensity, isDark) }}
                />
                <Text className="text-black dark:text-white font-medium">
                  {todayActivity.intensity >= 3 ? 'Active' : todayActivity.intensity === 2 ? 'Moderate' : 'Light'} day
                </Text>
              </View>
              <View className="flex-row gap-3">
                {todayActivity.sleepMinutes > 0 && (
                  <View className="flex-1 bg-white dark:bg-zinc-800 rounded-xl p-3 items-center">
                    <Moon size={20} color={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} />
                    <Text className="text-black dark:text-white font-semibold mt-1">
                      {formatDuration(todayActivity.sleepMinutes)}
                    </Text>
                    <Text className="text-gray-500 text-xs">Sleep</Text>
                  </View>
                )}
                {todayActivity.feedCount > 0 && (
                  <View className="flex-1 bg-white dark:bg-zinc-800 rounded-xl p-3 items-center">
                    <Baby size={20} color={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} />
                    <Text className="text-black dark:text-white font-semibold mt-1">
                      {todayActivity.feedCount}
                    </Text>
                    <Text className="text-gray-500 text-xs">Feeds</Text>
                  </View>
                )}
                {todayActivity.diaperCount > 0 && (
                  <View className="flex-1 bg-white dark:bg-zinc-800 rounded-xl p-3 items-center">
                    <Droplets size={20} color={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} />
                    <Text className="text-black dark:text-white font-semibold mt-1">
                      {todayActivity.diaperCount}
                    </Text>
                    <Text className="text-gray-500 text-xs">Diapers</Text>
                  </View>
                )}
                {todayActivity.pumpingOz > 0 && (
                  <View className="flex-1 bg-white dark:bg-zinc-800 rounded-xl p-3 items-center">
                    <Milk size={20} color={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} />
                    <Text className="text-black dark:text-white font-semibold mt-1">
                      {todayActivity.pumpingOz.toFixed(1)}
                    </Text>
                    <Text className="text-gray-500 text-xs">oz pumped</Text>
                  </View>
                )}
              </View>
            </View>
            {totals.daysWithData <= 3 && (
              <Text className="text-gray-400 text-sm text-center mt-3">
                Keep tracking to see patterns emerge over time
              </Text>
            )}
          </View>
        )}

        {/* Stats Summary */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-black dark:text-white mb-3">Summary</Text>
          <View className="bg-gray-100 dark:bg-zinc-900 rounded-2xl p-4">
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600 dark:text-gray-400">Days tracked</Text>
              <Text className="font-semibold text-black dark:text-white">{totals.daysWithData}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600 dark:text-gray-400">Avg sleep/day</Text>
              <Text className="font-semibold text-black dark:text-white">
                {avgSleepPerDay > 0 ? formatDuration(Math.round(avgSleepPerDay)) : '--'}
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600 dark:text-gray-400">Avg feeds/day</Text>
              <Text className="font-semibold text-black dark:text-white">
                {avgFeedsPerDay > 0 ? avgFeedsPerDay.toFixed(1) : '--'}
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600 dark:text-gray-400">Total diapers</Text>
              <Text className="font-semibold text-black dark:text-white">{totals.diaperCount || '--'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">Total pumped</Text>
              <Text className="font-semibold text-black dark:text-white">
                {totals.pumpingOz > 0 ? `${totals.pumpingOz.toFixed(1)} oz` : '--'}
              </Text>
            </View>
          </View>
        </View>

        {/* Help text */}
        <Text className="text-gray-400 text-center text-sm">
          Tap any day to see details
        </Text>
      </ScrollView>

      {/* Day Detail Sheet */}
      <DayDetailSheet
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        activity={selectedDay}
      />
    </SafeAreaView>
  );
}
