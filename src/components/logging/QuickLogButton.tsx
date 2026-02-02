import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LucideIcon } from 'lucide-react-native';
import { useIsDark } from '../ThemeProvider';

interface QuickLogButtonProps {
  title: string;
  icon: LucideIcon;
  onPress: () => void;
  subtitle?: string;
  isActive?: boolean;
  badge?: string | number;
}

export function QuickLogButton({
  title,
  icon: Icon,
  onPress,
  subtitle,
  isActive = false,
  badge,
}: QuickLogButtonProps) {
  const isDark = useIsDark();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const iconColor = isActive
    ? (isDark ? '#000000' : '#FFFFFF')
    : (isDark ? '#FFFFFF' : '#000000');

  return (
    <Pressable
      onPress={handlePress}
      className={`
        flex-1 items-center justify-center p-4 rounded-2xl min-h-[100px]
        ${isActive ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'}
        active:scale-95
      `}
    >
      <View className="relative">
        <Icon
          size={28}
          color={iconColor}
          strokeWidth={1.5}
        />
        {badge !== undefined && (
          <View className="absolute -top-2 -right-2 bg-black dark:bg-white rounded-full px-1.5 py-0.5 min-w-[18px] items-center">
            <Text className="text-white dark:text-black text-xs font-bold">{badge}</Text>
          </View>
        )}
      </View>
      <Text className={`mt-2 font-medium ${isActive ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}>
        {title}
      </Text>
      {subtitle && (
        <Text className={`text-xs mt-1 ${isActive ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500'}`}>
          {subtitle}
        </Text>
      )}
    </Pressable>
  );
}
