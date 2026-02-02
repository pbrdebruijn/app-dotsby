import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Baby, Droplets, Milk, ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { QuickLogButton } from '../../src/components/logging/QuickLogButton';
import { TodaySchedule } from '../../src/components/schedule/TodaySchedule';
import { PatternGrid } from '../../src/components/patterns/PatternGrid';
import { SleepLogSheet } from '../../src/components/logging/SleepLogSheet';
import { FeedingLogSheet } from '../../src/components/logging/FeedingLogSheet';
import { DiaperLogSheet } from '../../src/components/logging/DiaperLogSheet';
import { PumpingLogSheet } from '../../src/components/logging/PumpingLogSheet';
import { useAppStore } from '../../src/stores/appStore';
import { useBabyStore } from '../../src/stores/babyStore';
import { usePatternData } from '../../src/hooks/usePatternData';
import { useTodayStats } from '../../src/hooks/useTodayStats';
import { useIsDark } from '../../src/components/ThemeProvider';
import { formatRelativeTime } from '../../src/utils/dates';
import { formatVolume } from '../../src/utils/units';

type SheetType = 'sleep' | 'feeding' | 'diaper' | 'pumping' | null;

export default function HomeScreen() {
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [showBabyPicker, setShowBabyPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const selectedBabyId = useAppStore((s) => s.selectedBabyId);
  const setSelectedBaby = useAppStore((s) => s.setSelectedBaby);
  const useMetricUnits = useAppStore((s) => s.useMetricUnits);
  const babies = useBabyStore((s) => s.babies);
  const isDark = useIsDark();

  const selectedBaby = babies.find((b) => b.id === selectedBabyId);

  const { activities, refresh: refreshPatterns } = usePatternData(selectedBabyId, 2);
  const stats = useTodayStats(selectedBabyId);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshPatterns(), stats.refresh()]);
    setRefreshing(false);
  }, [refreshPatterns, stats.refresh]);

  const handleLogSaved = () => {
    stats.refresh();
    refreshPatterns();
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-black dark:text-white">Dotsby</Text>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setShowBabyPicker(!showBabyPicker);
            }}
            className="flex-row items-center bg-gray-100 dark:bg-zinc-800 px-4 py-2 rounded-full"
          >
            <Text className="text-black dark:text-white font-medium mr-1">
              {selectedBaby?.name || 'Select Baby'}
            </Text>
            <ChevronDown size={16} color={isDark ? '#FFFFFF' : '#000000'} />
          </Pressable>
        </View>

        {/* Baby Picker Dropdown */}
        {showBabyPicker && babies.length > 1 && (
          <View className="bg-gray-100 dark:bg-zinc-800 rounded-xl mb-4 overflow-hidden">
            {babies.map((baby) => (
              <Pressable
                key={baby.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedBaby(baby.id);
                  setShowBabyPicker(false);
                }}
                className={`p-4 border-b border-gray-200 dark:border-zinc-700 ${
                  baby.id === selectedBabyId ? 'bg-black dark:bg-white' : ''
                }`}
              >
                <Text
                  className={`font-medium ${
                    baby.id === selectedBabyId ? 'text-white dark:text-black' : 'text-black dark:text-white'
                  }`}
                >
                  {baby.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Quick Log Buttons */}
        <View className="flex-row gap-3 mb-3">
          <QuickLogButton
            title="Sleep"
            icon={Moon}
            onPress={() => setActiveSheet('sleep')}
            subtitle={stats.lastSleep ? formatRelativeTime(stats.lastSleep.endTime || stats.lastSleep.startTime) : undefined}
          />
          <QuickLogButton
            title="Feed"
            icon={Baby}
            onPress={() => setActiveSheet('feeding')}
            badge={stats.feedCount > 0 ? stats.feedCount : undefined}
            subtitle={stats.lastNursingSide ? `Last: ${stats.lastNursingSide}` : undefined}
          />
        </View>

        <View className="flex-row gap-3 mb-6">
          <QuickLogButton
            title="Diaper"
            icon={Droplets}
            onPress={() => setActiveSheet('diaper')}
            badge={stats.diaperCounts.wet + stats.diaperCounts.dirty > 0 ? stats.diaperCounts.wet + stats.diaperCounts.dirty : undefined}
          />
          <QuickLogButton
            title="Pump"
            icon={Milk}
            onPress={() => setActiveSheet('pumping')}
            subtitle={stats.pumpingOz > 0 ? `${formatVolume(stats.pumpingOz, useMetricUnits)} today` : undefined}
          />
        </View>

        {/* Today's Schedule */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-black dark:text-white mb-3">Today's Schedule</Text>
          <TodaySchedule babyId={selectedBabyId} />
        </View>

        {/* Mini Pattern Graph */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-black dark:text-white mb-3">This Week</Text>
          <PatternGrid activities={activities} weeks={2} showLegend={false} />
        </View>
      </ScrollView>

      {/* Log Sheets */}
      <SleepLogSheet
        isOpen={activeSheet === 'sleep'}
        onClose={() => setActiveSheet(null)}
        babyId={selectedBabyId}
        onSaved={handleLogSaved}
      />
      <FeedingLogSheet
        isOpen={activeSheet === 'feeding'}
        onClose={() => setActiveSheet(null)}
        babyId={selectedBabyId}
        lastNursingSide={stats.lastNursingSide}
        onSaved={handleLogSaved}
      />
      <DiaperLogSheet
        isOpen={activeSheet === 'diaper'}
        onClose={() => setActiveSheet(null)}
        babyId={selectedBabyId}
        onSaved={handleLogSaved}
      />
      <PumpingLogSheet
        isOpen={activeSheet === 'pumping'}
        onClose={() => setActiveSheet(null)}
        babyId={selectedBabyId}
        onSaved={handleLogSaved}
      />
    </SafeAreaView>
  );
}
