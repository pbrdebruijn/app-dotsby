import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { getIntensityColor } from '../../services/patternCalculator';
import { useIsDark } from '../ThemeProvider';
import type { DayActivity } from '../../types';

interface PatternGridProps {
  activities: DayActivity[];
  weeks?: number;
  onDayPress?: (activity: DayActivity) => void;
  showLegend?: boolean;
  showDayLabels?: boolean;
}

const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function PatternGrid({
  activities,
  weeks = 12,
  onDayPress,
  showLegend = true,
  showDayLabels = true,
}: PatternGridProps) {
  const isDark = useIsDark();
  // Keep grid height constant across all week ranges
  const TARGET_HEIGHT = 112;
  const dotGap = 4;
  const dotSize = Math.floor((TARGET_HEIGHT - dotGap * 6) / 7);
  const dotRadius = weeks <= 2 ? 4 : 2;
  const gridWidth = weeks * (dotSize + dotGap);
  const gridHeight = 7 * (dotSize + dotGap);

  // Organize activities into weeks (columns) with days (rows)
  const grid = useMemo(() => {
    const result: (DayActivity | null)[][] = [];

    // Get the most recent activity dates
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7 + 1);

    // Create a map of date -> activity
    const activityMap = new Map(
      activities.map((a) => [a.date, a])
    );

    // Build grid: each week is a column, each day is a row (0=Monday, 6=Sunday)
    let currentDate = new Date(startDate);

    // Adjust to start on Monday
    const dayOfWeek = currentDate.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentDate.setDate(currentDate.getDate() - daysFromMonday);

    for (let week = 0; week < weeks; week++) {
      const weekData: (DayActivity | null)[] = [];

      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];

        if (currentDate > endDate) {
          weekData.push(null);
        } else {
          weekData.push(
            activityMap.get(dateStr) || {
              date: dateStr,
              intensity: 0,
              sleepMinutes: 0,
              feedCount: 0,
              diaperCount: 0,
              pumpingOz: 0,
              photoCount: 0,
            }
          );
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      result.push(weekData);
    }

    return result;
  }, [activities, weeks]);

  const handleDayPress = (activity: DayActivity | null) => {
    if (activity && activity.date && onDayPress) {
      Haptics.selectionAsync();
      onDayPress(activity);
    }
  };

  return (
    <View className="bg-white dark:bg-zinc-900 p-4 rounded-2xl">
      <View className="flex-row">
        {/* Day labels */}
        {showDayLabels && (
          <View className="mr-2" style={{ width: 16 }}>
            {DAYS_OF_WEEK.map((day, i) => (
              <Text
                key={i}
                className="text-xs text-gray-400"
                style={{
                  height: dotSize + dotGap,
                  lineHeight: dotSize + dotGap,
                }}
              >
                {i % 2 === 0 ? day : ''}
              </Text>
            ))}
          </View>
        )}

        {/* SVG Grid */}
        <Svg width={gridWidth} height={gridHeight}>
          {grid.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              if (!day) return null;

              return (
                <Rect
                  key={`${weekIndex}-${dayIndex}`}
                  x={weekIndex * (dotSize + dotGap)}
                  y={dayIndex * (dotSize + dotGap)}
                  width={dotSize}
                  height={dotSize}
                  rx={dotRadius}
                  fill={getIntensityColor(day.intensity, isDark)}
                  onPress={() => handleDayPress(day)}
                />
              );
            })
          )}
        </Svg>
      </View>

      {/* Legend */}
      {showLegend && (
        <View className="flex-row items-center justify-end mt-3 gap-1">
          <Text className="text-xs text-gray-400 mr-1">Less</Text>
          {[0, 1, 2, 3, 4].map((intensity) => (
            <View
              key={intensity}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getIntensityColor(intensity, isDark) }}
            />
          ))}
          <Text className="text-xs text-gray-400 ml-1">More</Text>
        </View>
      )}
    </View>
  );
}
