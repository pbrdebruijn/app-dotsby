import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Timer } from '../ui/Timer';
import { NumberInput } from '../ui/Input';
import { useTimerStore } from '../../stores/timerStore';
import { useAppStore } from '../../stores/appStore';
import { insertPumpingLog } from '../../db/queries/pumping';
import { getVolumeUnit, toStorageValue } from '../../utils/units';

interface PumpingLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string | null;
  onSaved?: () => void;
}

export function PumpingLogSheet({ isOpen, onClose, babyId, onSaved }: PumpingLogSheetProps) {
  const [outputValue, setOutputValue] = useState<number | null>(null);
  const [leftValue, setLeftValue] = useState<number | null>(null);
  const [rightValue, setRightValue] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showOutputInput, setShowOutputInput] = useState(false);

  const { activePumpingTimer, startPumpingTimer, stopPumpingTimer } = useTimerStore();
  const useMetricUnits = useAppStore((s) => s.useMetricUnits);

  const isTimerRunning = activePumpingTimer?.babyId === babyId;
  const unit = getVolumeUnit(useMetricUnits);
  const maxTotal = useMetricUnits ? 600 : 20; // 600ml or 20oz
  const maxSide = useMetricUnits ? 300 : 10; // 300ml or 10oz

  const handleStart = () => {
    if (!babyId) return;
    startPumpingTimer(babyId);
  };

  const handleStop = () => {
    stopPumpingTimer();
    setShowOutputInput(true);
  };

  const handleSave = async () => {
    if (!babyId) return;

    const totalDisplay = outputValue ?? (leftValue ?? 0) + (rightValue ?? 0);
    if (totalDisplay <= 0) return;

    // Convert to storage value (oz)
    const totalOz = toStorageValue(totalDisplay, useMetricUnits);
    const leftOz = leftValue ? toStorageValue(leftValue, useMetricUnits) : null;
    const rightOz = rightValue ? toStorageValue(rightValue, useMetricUnits) : null;

    setIsSaving(true);
    try {
      await insertPumpingLog({
        babyId,
        startTime: activePumpingTimer?.startTime || new Date().toISOString(),
        endTime: new Date().toISOString(),
        outputOz: totalOz,
        outputLeftOz: leftOz,
        outputRightOz: rightOz,
      });

      // Reset state
      setOutputValue(null);
      setLeftValue(null);
      setRightValue(null);
      setShowOutputInput(false);
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error saving pumping log:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickLog = async () => {
    if (!babyId) return;

    const totalDisplay = outputValue ?? (leftValue ?? 0) + (rightValue ?? 0);
    if (totalDisplay <= 0) return;

    // Convert to storage value (oz)
    const totalOz = toStorageValue(totalDisplay, useMetricUnits);
    const leftOz = leftValue ? toStorageValue(leftValue, useMetricUnits) : null;
    const rightOz = rightValue ? toStorageValue(rightValue, useMetricUnits) : null;

    setIsSaving(true);
    try {
      await insertPumpingLog({
        babyId,
        startTime: new Date().toISOString(),
        outputOz: totalOz,
        outputLeftOz: leftOz,
        outputRightOz: rightOz,
      });

      setOutputValue(null);
      setLeftValue(null);
      setRightValue(null);
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error quick logging pumping:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Show output input after timer stops or for quick log
  if (showOutputInput) {
    return (
      <Sheet isOpen={isOpen} onClose={onClose} title="Pumping Output">
        <View className="py-4">
          <NumberInput
            label="Total Output"
            value={outputValue}
            onChangeValue={setOutputValue}
            unit={unit}
            min={0}
            max={maxTotal}
            decimal
            placeholder="0"
          />

          <Text className="text-center text-gray-400 mb-4">or</Text>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <NumberInput
                label="Left"
                value={leftValue}
                onChangeValue={setLeftValue}
                unit={unit}
                min={0}
                max={maxSide}
                decimal
                placeholder="0"
              />
            </View>
            <View className="flex-1">
              <NumberInput
                label="Right"
                value={rightValue}
                onChangeValue={setRightValue}
                unit={unit}
                min={0}
                max={maxSide}
                decimal
                placeholder="0"
              />
            </View>
          </View>

          <Button
            title="Save Pumping Session"
            onPress={handleSave}
            disabled={!outputValue && !leftValue && !rightValue}
            loading={isSaving}
            fullWidth
          />
        </View>
      </Sheet>
    );
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Pumping">
      <View className="items-center py-4">
        {/* Timer */}
        <Timer
          isRunning={isTimerRunning}
          startTime={activePumpingTimer?.startTime || null}
          onStart={handleStart}
          onStop={handleStop}
          label={isTimerRunning ? 'Pumping...' : 'Start pumping timer'}
        />

        {/* Quick Log Option */}
        {!isTimerRunning && (
          <View className="mt-8 w-full">
            <Text className="text-center text-gray-500 mb-4">or log without timer</Text>

            <NumberInput
              label="Total Output"
              value={outputValue}
              onChangeValue={setOutputValue}
              unit={unit}
              min={0}
              max={maxTotal}
              decimal
              placeholder="0"
            />

            <Button
              title="Quick Log"
              onPress={handleQuickLog}
              variant="outline"
              disabled={!outputValue}
              loading={isSaving}
              fullWidth
            />
          </View>
        )}
      </View>
    </Sheet>
  );
}
