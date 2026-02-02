import React from 'react';
import { View, Text } from 'react-native';
import { Clock, AlertCircle } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { formatTime, formatDuration } from '../../utils/dates';

interface WakeWindowCardProps {
  minutesAwake: number;
  minutesRemaining: number;
  nextNapTime: Date | null;
  isOverdue: boolean;
  progress: number;
}

export function WakeWindowCard({
  minutesAwake,
  minutesRemaining,
  nextNapTime,
  isOverdue,
  progress,
}: WakeWindowCardProps) {
  return (
    <Card className={isOverdue ? 'bg-red-50 border border-red-200' : 'bg-gray-100'}>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          {isOverdue ? (
            <AlertCircle size={20} color="#EF4444" strokeWidth={1.5} />
          ) : (
            <Clock size={20} color="#666666" strokeWidth={1.5} />
          )}
          <Text className={`font-semibold ml-2 ${isOverdue ? 'text-red-600' : 'text-black'}`}>
            {isOverdue ? 'Past Nap Time' : 'Wake Window'}
          </Text>
        </View>
        <Text className={isOverdue ? 'text-red-500' : 'text-gray-600'}>
          {formatDuration(minutesAwake)} awake
        </Text>
      </View>

      {/* Progress bar */}
      <View className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
        <View
          className={`h-full rounded-full ${isOverdue ? 'bg-red-500' : 'bg-black'}`}
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </View>

      {/* Status text */}
      {isOverdue ? (
        <Text className="text-red-500 text-center">
          Baby may be overtired. Consider putting down for a nap soon.
        </Text>
      ) : nextNapTime ? (
        <View className="flex-row justify-between">
          <Text className="text-gray-500">
            {formatDuration(minutesRemaining)} until nap
          </Text>
          <Text className="text-gray-500">~{formatTime(nextNapTime)}</Text>
        </View>
      ) : null}
    </Card>
  );
}
