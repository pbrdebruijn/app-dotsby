import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { NumberInput } from '../ui/Input';
import { NursingTimer } from './NursingTimer';
import { insertFeedingLog } from '../../db/queries/feeding';
import { useAppStore } from '../../stores/appStore';
import { useIsDark } from '../ThemeProvider';
import { getVolumeUnit, toStorageValue } from '../../utils/units';
import type { FeedType, ContentType } from '../../types';

interface FeedingLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string | null;
  lastNursingSide?: 'left' | 'right' | null;
  onSaved?: () => void;
}

type FeedingMode = 'nursing' | 'bottle' | 'solids';

export function FeedingLogSheet({
  isOpen,
  onClose,
  babyId,
  lastNursingSide,
  onSaved,
}: FeedingLogSheetProps) {
  const [mode, setMode] = useState<FeedingMode>('nursing');
  const [isSaving, setIsSaving] = useState(false);
  const useMetricUnits = useAppStore((s) => s.useMetricUnits);
  const isDark = useIsDark();

  // Bottle state
  const [bottleAmount, setBottleAmount] = useState<number | null>(null);
  const unit = getVolumeUnit(useMetricUnits);
  const maxAmount = useMetricUnits ? 600 : 20;
  const [bottleContent, setBottleContent] = useState<ContentType>('breast_milk');

  // Solids state
  const [foodName, setFoodName] = useState('');

  const handleNursingComplete = async (side: 'left' | 'right', durationSeconds: number) => {
    if (!babyId) return;

    setIsSaving(true);
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - durationSeconds * 1000);

      await insertFeedingLog({
        babyId,
        feedType: side === 'left' ? 'breast_left' : 'breast_right',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error saving nursing log:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBottleSave = async () => {
    if (!babyId || !bottleAmount) return;

    setIsSaving(true);
    try {
      // Convert to storage value (oz)
      const amountOz = toStorageValue(bottleAmount, useMetricUnits);

      await insertFeedingLog({
        babyId,
        feedType: 'bottle',
        startTime: new Date().toISOString(),
        amountOz,
        contentType: bottleContent,
      });

      setBottleAmount(null);
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error saving bottle log:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSolidsSave = async () => {
    if (!babyId) return;

    setIsSaving(true);
    try {
      await insertFeedingLog({
        babyId,
        feedType: 'solids',
        startTime: new Date().toISOString(),
        contentType: 'food',
        foodName: foodName || undefined,
      });

      setFoodName('');
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error saving solids log:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Feeding">
      {/* Mode Selector */}
      <View className="flex-row gap-2 mb-6">
        {(['nursing', 'bottle', 'solids'] as FeedingMode[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => {
              Haptics.selectionAsync();
              setMode(m);
            }}
            className={`flex-1 py-3 rounded-full items-center ${
              mode === m ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'
            }`}
          >
            <Text className={mode === m ? 'text-white dark:text-black font-medium' : 'text-black dark:text-white'}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Nursing Mode */}
      {mode === 'nursing' && babyId && (
        <NursingTimer
          babyId={babyId}
          lastSide={lastNursingSide ?? null}
          onComplete={handleNursingComplete}
        />
      )}

      {/* Bottle Mode */}
      {mode === 'bottle' && (
        <View className="py-4">
          <NumberInput
            label="Amount"
            value={bottleAmount}
            onChangeValue={setBottleAmount}
            unit={unit}
            min={0}
            max={maxAmount}
            decimal
            placeholder="0"
          />

          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</Text>
          <View className="flex-row gap-2 mb-6">
            {(['breast_milk', 'formula'] as ContentType[]).map((content) => (
              <Pressable
                key={content}
                onPress={() => {
                  Haptics.selectionAsync();
                  setBottleContent(content);
                }}
                className={`flex-1 py-3 rounded-full items-center ${
                  bottleContent === content ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'
                }`}
              >
                <Text className={bottleContent === content ? 'text-white dark:text-black' : 'text-black dark:text-white'}>
                  {content === 'breast_milk' ? 'Breast Milk' : 'Formula'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Button
            title="Save Bottle Feeding"
            onPress={handleBottleSave}
            disabled={!bottleAmount}
            loading={isSaving}
            fullWidth
          />
        </View>
      )}

      {/* Solids Mode */}
      {mode === 'solids' && (
        <View className="py-4">
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Food (optional)</Text>
            <View className="bg-gray-100 dark:bg-zinc-800 rounded-xl px-4 py-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Avocado', 'Banana', 'Sweet Potato', 'Oatmeal', 'Yogurt'].map((food) => (
                  <Pressable
                    key={food}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setFoodName(food);
                    }}
                    className={`mr-2 px-3 py-1.5 rounded-full ${
                      foodName === food ? 'bg-black dark:bg-white' : 'bg-white dark:bg-zinc-700'
                    }`}
                  >
                    <Text className={foodName === food ? 'text-white dark:text-black' : 'text-black dark:text-white'}>
                      {food}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          <Button
            title="Save Solids"
            onPress={handleSolidsSave}
            loading={isSaving}
            fullWidth
          />
        </View>
      )}
    </Sheet>
  );
}
