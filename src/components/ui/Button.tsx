import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useIsDark } from '../ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const isDark = useIsDark();

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const baseStyles = 'flex-row items-center justify-center rounded-full';

  const variantStyles = {
    primary: 'bg-black dark:bg-white',
    secondary: 'bg-gray-100 dark:bg-zinc-800',
    outline: 'bg-transparent border-2 border-black dark:border-white',
    ghost: 'bg-transparent',
  };

  const sizeStyles = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textVariantStyles = {
    primary: 'text-white dark:text-black',
    secondary: 'text-black dark:text-white',
    outline: 'text-black dark:text-white',
    ghost: 'text-black dark:text-white',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledStyle = disabled ? 'opacity-50' : '';
  const widthStyle = fullWidth ? 'w-full' : '';

  const getLoadingColor = () => {
    if (variant === 'primary') return isDark ? '#000000' : '#FFFFFF';
    return isDark ? '#FFFFFF' : '#000000';
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyle} ${widthStyle} active:opacity-80`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getLoadingColor()}
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text
            className={`font-semibold ${textVariantStyles[variant]} ${textSizeStyles[size]}`}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
