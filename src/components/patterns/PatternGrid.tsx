import React, { useMemo, useState } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
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
const LABEL_WIDTH = 18;
const MIN_DOT_GAP = 2;
const MAX_DOT_SIZE = 12;

export function PatternGrid({
  activities,
  weeks = 12,
  onDayPress,
  showLegend = true,
  showDayLabels = true,
}: PatternGridProps) {
  const isDark = useIsDark();
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  // Derive dot size from available width so the grid always fits
  const availableWidth = containerWidth - (showDayLabels ? LABEL_WIDTH + 8 : 0) - 32; // 32 = p-4 padding
  const cellSize = availableWidth > 0 ? availableWidth / weeks : MAX_DOT_SIZE + MIN_DOT_GAP;
  const dotGap = Math.max(MIN_DOT_GAP, Math.min(4, Math.floor(cellSize * 0.25)));
  const dotSize = Math.min(MAX_DOT_SIZE, Math.floor(cellSize - dotGap));
  const dotRadius = dotSize >= 8 ? 2 : 1;
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

  const todayStr = new Date().toISOString().split('T')[0];

  const handleDayPress = (activity: DayActivity | null) => {
    if (activity && activity.date && onDayPress) {
      Haptics.selectionAsync();
      onDayPress(activity);
    }
  };

  return (
    <View className="bg-white dark:bg-zinc-900 p-4 rounded-2xl" onLayout={onLayout}>
      {containerWidth > 0 && (
        <>
          <View className="flex-row">
            {/* Day labels */}
            {showDayLabels && (
              <View className="mr-2" style={{ width: LABEL_WIDTH }}>
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

                  const x = weekIndex * (dotSize + dotGap);
                  const y = dayIndex * (dotSize + dotGap);
                  const isToday = day.date === todayStr;

                  return (
                    <React.Fragment key={`${weekIndex}-${dayIndex}`}>
                      <Rect
                        x={x}
                        y={y}
                        width={dotSize}
                        height={dotSize}
                        rx={dotRadius}
                        fill={getIntensityColor(day.intensity, isDark)}
                        stroke={isToday ? (isDark ? '#FFFFFF' : '#000000') : 'none'}
                        strokeWidth={isToday ? 1.5 : 0}
                        strokeOpacity={isToday ? 0.4 : 0}
                        onPress={() => handleDayPress(day)}
                      />
                      {isToday && dotSize >= 6 && (
                        <Circle
                          cx={x + dotSize / 2}
                          cy={y + dotSize + 2}
                          r={1.5}
                          fill={isDark ? '#FFFFFF' : '#000000'}
                          opacity={0.5}
                        />
                      )}
                    </React.Fragment>
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
        </>
      )}
    </View>
  );
}
