import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTimerStore, getElapsedSeconds } from '../../stores/timerStore';
import { useElapsedTime } from '../../hooks/useTimer';
import { useIsDark } from '../ThemeProvider';
import { formatTimerDisplay } from '../../utils/dates';

interface NursingTimerProps {
  babyId: string;
  lastSide: 'left' | 'right' | null;
  onComplete: (side: 'left' | 'right', durationSeconds: number) => void;
}

export function NursingTimer({ babyId, lastSide, onComplete }: NursingTimerProps) {
  const { activeNursingTimer, startNursingTimer, switchNursingSide, stopNursingTimer } =
    useTimerStore();
  const isDark = useIsDark();

  const isRunning = activeNursingTimer?.babyId === babyId;
  const currentSide = activeNursingTimer?.side;
  const suggestedSide = lastSide === 'left' ? 'right' : 'left';

  const elapsed = useElapsedTime(activeNursingTimer?.startTime || null, isRunning);

  const handleSidePress = (side: 'left' | 'right') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isRunning) {
      startNursingTimer(babyId, side);
    } else if (currentSide !== side) {
      switchNursingSide();
    }
  };

  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const timer = stopNursingTimer();
    if (timer) {
      const duration = getElapsedSeconds(timer.startTime);
      onComplete(timer.side, duration);
    }
  };

  return (
    <View className="items-center p-6">
      {/* Timer display */}
      <Text
        className="text-5xl font-light tracking-tight text-black dark:text-white mb-8"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {formatTimerDisplay(elapsed)}
      </Text>

      {/* Side buttons */}
      <View className="flex-row gap-4 w-full">
        <Pressable
          onPress={() => handleSidePress('left')}
          className={`
            flex-1 py-6 rounded-2xl items-center
            ${currentSide === 'left' ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'}
            active:scale-95
          `}
        >
          <Text
            className={`text-lg font-semibold ${
              currentSide === 'left' ? 'text-white dark:text-black' : 'text-black dark:text-white'
            }`}
          >
            Left
          </Text>
          {!isRunning && suggestedSide === 'left' && (
            <Text className="text-xs text-gray-500 mt-1">Start here</Text>
          )}
          {currentSide === 'left' && (
            <Text className="text-xs text-gray-300 dark:text-gray-600 mt-1">Active</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => handleSidePress('right')}
          className={`
            flex-1 py-6 rounded-2xl items-center
            ${currentSide === 'right' ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'}
            active:scale-95
          `}
        >
          <Text
            className={`text-lg font-semibold ${
              currentSide === 'right' ? 'text-white dark:text-black' : 'text-black dark:text-white'
            }`}
          >
            Right
          </Text>
          {!isRunning && suggestedSide === 'right' && (
            <Text className="text-xs text-gray-500 mt-1">Start here</Text>
          )}
          {currentSide === 'right' && (
            <Text className="text-xs text-gray-300 dark:text-gray-600 mt-1">Active</Text>
          )}
        </Pressable>
      </View>

      {/* Stop button */}
      {isRunning && (
        <Pressable
          onPress={handleStop}
          className="mt-6 py-4 px-8 bg-black dark:bg-white rounded-full active:scale-95"
        >
          <Text className="text-white dark:text-black font-semibold">Save & Stop</Text>
        </Pressable>
      )}

      {/* Last feed indicator */}
      {lastSide && !isRunning && (
        <Text className="mt-4 text-gray-400 text-sm">Last feed: {lastSide} side</Text>
      )}
    </View>
  );
}
