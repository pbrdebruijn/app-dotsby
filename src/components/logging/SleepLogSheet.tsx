import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Timer } from '../ui/Timer';
import { useTimerStore, getElapsedSeconds } from '../../stores/timerStore';
import { insertSleepLog, endSleepLog, getActiveSleepLog } from '../../db/queries/sleep';
import { useIsDark } from '../ThemeProvider';

interface SleepLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string | null;
  onSaved?: () => void;
}

type SleepType = 'nap' | 'night';

export function SleepLogSheet({ isOpen, onClose, babyId, onSaved }: SleepLogSheetProps) {
  const [sleepType, setSleepType] = useState<SleepType>('nap');
  const [isSaving, setIsSaving] = useState(false);
  const [activeDbSleep, setActiveDbSleep] = useState<{ id: string; startTime: string } | null>(null);
  const isDark = useIsDark();

  const { activeSleepTimer, startSleepTimer, stopSleepTimer } = useTimerStore();

  const isTimerRunning = activeSleepTimer?.babyId === babyId;

  // Check for active sleep in database on open
  useEffect(() => {
    if (isOpen && babyId) {
      getActiveSleepLog(babyId).then((log) => {
        if (log) {
          setActiveDbSleep({ id: log.id, startTime: log.startTime });
        }
      });
    }
  }, [isOpen, babyId]);

  const handleStart = async () => {
    if (!babyId) return;

    try {
      // Create a new sleep log in database
      const log = await insertSleepLog({
        babyId,
        startTime: new Date().toISOString(),
        sleepType,
      });

      setActiveDbSleep({ id: log.id, startTime: log.startTime });

      // Start the timer in store
      startSleepTimer(babyId);
    } catch (error) {
      console.error('Error starting sleep:', error);
    }
  };

  const handleStop = async () => {
    if (!activeDbSleep) return;

    setIsSaving(true);
    try {
      // End the sleep log in database
      await endSleepLog(activeDbSleep.id, new Date().toISOString());

      // Stop the timer
      stopSleepTimer();

      setActiveDbSleep(null);
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error stopping sleep:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickLog = async () => {
    if (!babyId) return;

    setIsSaving(true);
    try {
      const now = new Date();
      const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);

      await insertSleepLog({
        babyId,
        startTime: thirtyMinsAgo.toISOString(),
        endTime: now.toISOString(),
        sleepType,
      });

      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error quick logging sleep:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Sleep">
      <View className="items-center py-4">
        {/* Sleep Type Selector */}
        {!isTimerRunning && !activeDbSleep && (
          <View className="flex-row gap-2 mb-8">
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setSleepType('nap');
              }}
              className={`px-6 py-3 rounded-full ${
                sleepType === 'nap' ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'
              }`}
            >
              <Text className={sleepType === 'nap' ? 'text-white dark:text-black font-medium' : 'text-black dark:text-white'}>
                Nap
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setSleepType('night');
              }}
              className={`px-6 py-3 rounded-full ${
                sleepType === 'night' ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'
              }`}
            >
              <Text className={sleepType === 'night' ? 'text-white dark:text-black font-medium' : 'text-black dark:text-white'}>
                Night Sleep
              </Text>
            </Pressable>
          </View>
        )}

        {/* Timer */}
        <Timer
          isRunning={isTimerRunning || !!activeDbSleep}
          startTime={activeDbSleep?.startTime || activeSleepTimer?.startTime || null}
          onStart={handleStart}
          onStop={handleStop}
          label={isTimerRunning ? 'Sleeping...' : 'Start sleep timer'}
        />

        {/* Quick Log Option */}
        {!isTimerRunning && !activeDbSleep && (
          <View className="mt-8 w-full">
            <Text className="text-center text-gray-500 mb-4">or</Text>
            <Button
              title="Quick log 30 min nap"
              onPress={handleQuickLog}
              variant="outline"
              loading={isSaving}
              fullWidth
            />
          </View>
        )}
      </View>
    </Sheet>
  );
}
