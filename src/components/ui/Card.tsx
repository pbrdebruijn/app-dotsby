import React from 'react';
import { View, Pressable } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

export function Card({ children, className = '', onPress }: CardProps) {
  const baseStyles = 'bg-white rounded-2xl p-4';

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${baseStyles} ${className} active:opacity-80`}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={`${baseStyles} ${className}`}>{children}</View>;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between mb-3 ${className}`}>
      {children}
    </View>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <View className={className}>
      {typeof children === 'string' ? (
        <View>
          <Text className="text-lg font-semibold text-black">{children}</Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

import { Text } from 'react-native';
