import React from 'react';
import { View, Text } from 'react-native';
import { Moon, Baby, Droplets, Milk, Camera } from 'lucide-react-native';
import { Sheet } from '../ui/Sheet';
import { useIsDark } from '../ThemeProvider';
import { formatDuration, formatDate } from '../../utils/dates';
import { getIntensityLabel, getIntensityColor } from '../../services/patternCalculator';
import type { DayActivity } from '../../types';

interface DayDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activity: DayActivity | null;
}

export function DayDetailSheet({ isOpen, onClose, activity }: DayDetailSheetProps) {
  const isDark = useIsDark();

  if (!activity) return null;

  const items = [
    {
      icon: Moon,
      label: 'Sleep',
      value: activity.sleepMinutes > 0 ? formatDuration(activity.sleepMinutes) : 'No data',
      hasData: activity.sleepMinutes > 0,
    },
    {
      icon: Baby,
      label: 'Feedings',
      value: activity.feedCount > 0 ? `${activity.feedCount} times` : 'No data',
      hasData: activity.feedCount > 0,
    },
    {
      icon: Droplets,
      label: 'Diapers',
      value: activity.diaperCount > 0 ? `${activity.diaperCount} changes` : 'No data',
      hasData: activity.diaperCount > 0,
    },
    {
      icon: Milk,
      label: 'Pumping',
      value: activity.pumpingOz > 0 ? `${activity.pumpingOz.toFixed(1)} oz` : 'No data',
      hasData: activity.pumpingOz > 0,
    },
    {
      icon: Camera,
      label: 'Photos',
      value: activity.photoCount > 0 ? `${activity.photoCount} photos` : 'No data',
      hasData: activity.photoCount > 0,
    },
  ];

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={formatDate(activity.date)}>
      <View className="py-4">
        {/* Intensity Badge */}
        <View className="flex-row items-center justify-center mb-6">
          <View
            className="w-4 h-4 rounded-sm mr-2"
            style={{ backgroundColor: getIntensityColor(activity.intensity, isDark) }}
          />
          <Text className="text-gray-600 dark:text-gray-400">{getIntensityLabel(activity.intensity)} day</Text>
        </View>

        {/* Stats Grid */}
        <View className="gap-3">
          {items.map(({ icon: Icon, label, value, hasData }) => (
            <View
              key={label}
              className={`flex-row items-center p-4 rounded-xl ${
                hasData ? 'bg-gray-100 dark:bg-zinc-800' : 'bg-gray-50 dark:bg-zinc-900'
              }`}
            >
              <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  hasData ? 'bg-white dark:bg-zinc-700' : 'bg-gray-100 dark:bg-zinc-800'
                }`}
              >
                <Icon size={20} color={hasData ? (isDark ? '#FFFFFF' : '#000000') : '#9CA3AF'} strokeWidth={1.5} />
              </View>
              <View className="flex-1">
                <Text className={hasData ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'}>{label}</Text>
                <Text className={`text-lg font-semibold ${hasData ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                  {value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Sheet>
  );
}
