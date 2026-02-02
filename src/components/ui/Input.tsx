import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useIsDark } from '../ThemeProvider';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  const isDark = useIsDark();

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</Text>
      )}
      <TextInput
        className={`
          bg-gray-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-base text-black dark:text-white
          ${error ? 'border-2 border-red-500' : ''}
          ${className}
        `}
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        {...props}
      />
      {error && <Text className="text-sm text-red-500 mt-1">{error}</Text>}
    </View>
  );
}

interface NumberInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label?: string;
  value: number | null;
  onChangeValue: (value: number | null) => void;
  unit?: string;
  min?: number;
  max?: number;
  decimal?: boolean;
}

export function NumberInput({
  label,
  value,
  onChangeValue,
  unit,
  min,
  max,
  decimal = false,
  ...props
}: NumberInputProps) {
  const isDark = useIsDark();

  const handleChange = (text: string) => {
    if (text === '') {
      onChangeValue(null);
      return;
    }

    const parsed = decimal ? parseFloat(text) : parseInt(text, 10);
    if (isNaN(parsed)) return;

    if (min !== undefined && parsed < min) return;
    if (max !== undefined && parsed > max) return;

    onChangeValue(parsed);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</Text>
      )}
      <View className="flex-row items-center">
        <TextInput
          className="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-base text-black dark:text-white"
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          value={value?.toString() ?? ''}
          onChangeText={handleChange}
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          {...props}
        />
        {unit && <Text className="ml-2 text-gray-500">{unit}</Text>}
      </View>
    </View>
  );
}
