import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Play, Square } from 'lucide-react-native';
import { useElapsedTime } from '../../hooks/useTimer';
import { useIsDark } from '../ThemeProvider';
import { formatTimerDisplay } from '../../utils/dates';

interface TimerProps {
  isRunning: boolean;
  startTime: string | null;
  onStart: () => void;
  onStop: () => void;
  label?: string;
}

export function Timer({ isRunning, startTime, onStart, onStop, label }: TimerProps) {
  const elapsed = useElapsedTime(startTime, isRunning);
  const isDark = useIsDark();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isRunning) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <View className="items-center">
      {/* Time display */}
      <Text className="text-6xl font-light tracking-tight text-black dark:text-white" style={{ fontVariant: ['tabular-nums'] }}>
        {formatTimerDisplay(elapsed)}
      </Text>

      {/* Start/Stop button */}
      <Pressable
        onPress={handlePress}
        className={`
          mt-6 w-20 h-20 rounded-full items-center justify-center
          border-2 border-black dark:border-white
          ${isRunning ? 'bg-black dark:bg-white' : 'bg-white dark:bg-black'}
          active:scale-95
        `}
      >
        {isRunning ? (
          <Square size={28} color={isDark ? '#000000' : '#FFFFFF'} fill={isDark ? '#000000' : '#FFFFFF'} />
        ) : (
          <Play size={28} color={isDark ? '#FFFFFF' : '#000000'} fill={isDark ? '#FFFFFF' : '#000000'} />
        )}
      </Pressable>

      <Text className="mt-3 text-gray-500">
        {label || (isRunning ? 'Tap to stop' : 'Tap to start')}
      </Text>
    </View>
  );
}

interface CompactTimerProps {
  isRunning: boolean;
  startTime: string | null;
  onPress: () => void;
}

export function CompactTimer({ isRunning, startTime, onPress }: CompactTimerProps) {
  const elapsed = useElapsedTime(startTime, isRunning);
  const isDark = useIsDark();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className={`
        flex-row items-center gap-2 px-4 py-2 rounded-full
        ${isRunning ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'}
      `}
    >
      {isRunning ? (
        <Square size={16} color={isDark ? '#000000' : '#FFFFFF'} fill={isDark ? '#000000' : '#FFFFFF'} />
      ) : (
        <Play size={16} color={isDark ? '#FFFFFF' : '#000000'} fill={isDark ? '#FFFFFF' : '#000000'} />
      )}
      <Text
        className={`font-medium ${isRunning ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {formatTimerDisplay(elapsed)}
      </Text>
    </Pressable>
  );
}
