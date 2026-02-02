import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Calendar } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useIsDark } from '../../src/components/ThemeProvider';
import { insertBaby } from '../../src/db/queries/babies';
import { useAppStore } from '../../src/stores/appStore';
import { useBabyStore } from '../../src/stores/babyStore';
import { formatDate } from '../../src/utils/dates';

export default function AddBabyScreen() {
  const router = useRouter();
  const isDark = useIsDark();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const setSelectedBaby = useAppStore((s) => s.setSelectedBaby);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const addBaby = useBabyStore((s) => s.addBaby);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const baby = await insertBaby({
        name: name.trim(),
        birthDate: birthDate.toISOString(),
      });

      addBaby(baby);
      setSelectedBaby(baby.id);
      setOnboardingComplete();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Error adding baby:', err);
      setError('Failed to add baby. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center py-4">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <ChevronLeft size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </Pressable>
        </View>

        {/* Title */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white">Add your baby</Text>
          <Text className="text-gray-500 mt-2">
            We'll use this to calculate age-appropriate schedules
          </Text>
        </View>

        {/* Form */}
        <View className="flex-1">
          <Input
            label="Baby's name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError('');
            }}
            placeholder="Enter name"
            autoCapitalize="words"
            autoCorrect={false}
            error={error}
          />

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Birth date</Text>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setShowDatePicker(true);
              }}
              className="flex-row items-center bg-gray-100 dark:bg-zinc-800 rounded-xl px-4 py-3"
            >
              <Calendar size={20} color={isDark ? '#999999' : '#666666'} strokeWidth={1.5} />
              <Text className="flex-1 text-black dark:text-white text-base ml-3">
                {formatDate(birthDate)}
              </Text>
            </Pressable>
          </View>

          {/* Date Picker */}
          {(showDatePicker || Platform.OS === 'ios') && (
            <View className={Platform.OS === 'ios' ? 'mb-4' : ''}>
              {Platform.OS === 'ios' && (
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select date
                </Text>
              )}
              <DateTimePicker
                value={birthDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 5))}
                themeVariant={isDark ? 'dark' : 'light'}
              />
            </View>
          )}
        </View>

        {/* Save Button */}
        <View className="pb-8">
          <Button
            title="Continue"
            onPress={handleSave}
            loading={isLoading}
            disabled={!name.trim()}
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
