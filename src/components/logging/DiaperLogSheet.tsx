import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Droplets, Circle } from 'lucide-react-native';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { useIsDark } from '../ThemeProvider';
import { insertDiaperLog } from '../../db/queries/diapers';
import type { DiaperType } from '../../types';

interface DiaperLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string | null;
  onSaved?: () => void;
}

const COLORS = [
  { id: 'yellow', label: 'Yellow', color: '#FCD34D' },
  { id: 'green', label: 'Green', color: '#86EFAC' },
  { id: 'brown', label: 'Brown', color: '#A3A3A3' },
  { id: 'black', label: 'Dark', color: '#525252' },
];

export function DiaperLogSheet({ isOpen, onClose, babyId, onSaved }: DiaperLogSheetProps) {
  const [diaperType, setDiaperType] = useState<DiaperType>('wet');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isDark = useIsDark();

  const handleSave = async () => {
    if (!babyId) return;

    setIsSaving(true);
    try {
      await insertDiaperLog({
        babyId,
        loggedAt: new Date().toISOString(),
        diaperType,
        color: selectedColor,
      });

      // Reset state
      setDiaperType('wet');
      setSelectedColor(null);
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error saving diaper log:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const showColorPicker = diaperType === 'dirty' || diaperType === 'both';

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Diaper Change">
      <View className="py-4">
        {/* Diaper Type */}
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Type</Text>
        <View className="flex-row gap-2 mb-6">
          {([
            { type: 'wet' as DiaperType, label: 'Wet', icon: Droplets },
            { type: 'dirty' as DiaperType, label: 'Dirty', icon: Circle },
            { type: 'both' as DiaperType, label: 'Both', icon: null },
          ]).map(({ type, label, icon: Icon }) => (
            <Pressable
              key={type}
              onPress={() => {
                Haptics.selectionAsync();
                setDiaperType(type);
                if (type === 'wet') setSelectedColor(null);
              }}
              className={`flex-1 py-4 rounded-2xl items-center ${
                diaperType === type ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'
              }`}
            >
              {Icon && (
                <Icon
                  size={24}
                  color={diaperType === type ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#FFFFFF' : '#000000')}
                  strokeWidth={1.5}
                />
              )}
              {!Icon && (
                <View className="flex-row">
                  <Droplets
                    size={18}
                    color={diaperType === type ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#FFFFFF' : '#000000')}
                    strokeWidth={1.5}
                  />
                  <Circle
                    size={18}
                    color={diaperType === type ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#FFFFFF' : '#000000')}
                    strokeWidth={1.5}
                  />
                </View>
              )}
              <Text
                className={`mt-2 font-medium ${
                  diaperType === type ? 'text-white dark:text-black' : 'text-black dark:text-white'
                }`}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Color Picker */}
        {showColorPicker && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Color (optional)</Text>
            <View className="flex-row gap-3">
              {COLORS.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedColor(selectedColor === c.id ? null : c.id);
                  }}
                  className={`flex-1 items-center p-3 rounded-xl ${
                    selectedColor === c.id ? 'bg-gray-200 dark:bg-zinc-700' : 'bg-gray-50 dark:bg-zinc-800'
                  }`}
                >
                  <View
                    className="w-8 h-8 rounded-full mb-2"
                    style={{ backgroundColor: c.color }}
                  />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">{c.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Save Button */}
        <Button
          title="Save Diaper Change"
          onPress={handleSave}
          loading={isSaving}
          fullWidth
        />
      </View>
    </Sheet>
  );
}
