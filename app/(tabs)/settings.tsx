import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Baby,
  Moon,
  Sun,
  Smartphone,
  ChevronRight,
  Heart,
  FileDown,
  Trash2,
  Plus,
  Scale,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../../src/stores/appStore';
import { useBabyStore } from '../../src/stores/babyStore';
import { useIsDark } from '../../src/components/ThemeProvider';
import { deleteBaby } from '../../src/db/queries/babies';
import { useRefreshBabies } from '../../src/hooks/useDatabase';
import { getAgeInMonths } from '../../src/utils/dates';

export default function SettingsScreen() {
  const router = useRouter();
  const isDark = useIsDark();
  const appearanceMode = useAppStore((s) => s.appearanceMode);
  const setAppearanceMode = useAppStore((s) => s.setAppearanceMode);
  const useMetricUnits = useAppStore((s) => s.useMetricUnits);
  const setUseMetricUnits = useAppStore((s) => s.setUseMetricUnits);
  const hasUnlockedPremium = useAppStore((s) => s.hasUnlockedPremium);
  const selectedBabyId = useAppStore((s) => s.selectedBabyId);
  const setSelectedBaby = useAppStore((s) => s.setSelectedBaby);
  const babies = useBabyStore((s) => s.babies);
  const refreshBabies = useRefreshBabies();

  const iconColor = isDark ? '#999999' : '#666666';
  const checkBg = isDark ? 'bg-white' : 'bg-black';
  const checkDot = isDark ? 'bg-black' : 'bg-white';

  const handleDeleteBaby = (babyId: string, babyName: string) => {
    Alert.alert(
      'Delete Baby Profile',
      `Are you sure you want to delete ${babyName}'s profile? This will remove all associated data and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBaby(babyId);
              await refreshBabies();

              if (selectedBabyId === babyId) {
                const remainingBabies = babies.filter((b) => b.id !== babyId);
                if (remainingBabies.length > 0) {
                  setSelectedBaby(remainingBabies[0].id);
                } else {
                  setSelectedBaby(null);
                  router.replace('/onboarding');
                }
              }

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting baby:', error);
              Alert.alert('Error', 'Failed to delete baby profile.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <Text className="text-2xl font-bold text-black dark:text-white mb-6">Settings</Text>

        {/* Baby Profiles Section */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Baby Profiles
          </Text>
          <View className="bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden">
            {babies.map((baby, index) => (
              <View
                key={baby.id}
                className={`flex-row items-center p-4 ${
                  index < babies.length - 1 ? 'border-b border-gray-200 dark:border-zinc-800' : ''
                }`}
              >
                <View className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full items-center justify-center mr-3">
                  <Baby size={24} color={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-black dark:text-white font-semibold">{baby.name}</Text>
                  <Text className="text-gray-500 text-sm">
                    {getAgeInMonths(baby.birthDate)} months old
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDeleteBaby(baby.id, baby.name)}
                  className="p-2"
                >
                  <Trash2 size={20} color="#EF4444" strokeWidth={1.5} />
                </Pressable>
              </View>
            ))}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/onboarding/add-baby');
              }}
              className="flex-row items-center p-4"
            >
              <View className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full items-center justify-center mr-3">
                <Plus size={24} color={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} />
              </View>
              <Text className="text-black dark:text-white font-medium">Add another baby</Text>
            </Pressable>
          </View>
        </View>

        {/* Appearance Section */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Appearance
          </Text>
          <View className="bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden">
            {([
              { mode: 'light', label: 'Light', icon: Sun },
              { mode: 'dark', label: 'Dark', icon: Moon },
              { mode: 'system', label: 'System', icon: Smartphone },
            ] as const).map(({ mode, label, icon: Icon }, index) => (
              <Pressable
                key={mode}
                onPress={() => {
                  Haptics.selectionAsync();
                  setAppearanceMode(mode);
                }}
                className={`flex-row items-center p-4 ${
                  index < 2 ? 'border-b border-gray-200 dark:border-zinc-800' : ''
                }`}
              >
                <Icon size={20} color={iconColor} strokeWidth={1.5} />
                <Text className="flex-1 text-black dark:text-white ml-3">{label}</Text>
                {appearanceMode === mode && (
                  <View className={`w-6 h-6 ${checkBg} rounded-full items-center justify-center`}>
                    <View className={`w-2 h-2 ${checkDot} rounded-full`} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Units Section */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Units
          </Text>
          <View className="bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden">
            {([
              { metric: false, label: 'Imperial', sublabel: 'oz, fl oz' },
              { metric: true, label: 'Metric', sublabel: 'ml, g' },
            ] as const).map(({ metric, label, sublabel }, index) => (
              <Pressable
                key={label}
                onPress={() => {
                  Haptics.selectionAsync();
                  setUseMetricUnits(metric);
                }}
                className={`flex-row items-center p-4 ${
                  index < 1 ? 'border-b border-gray-200 dark:border-zinc-800' : ''
                }`}
              >
                <Scale size={20} color={iconColor} strokeWidth={1.5} />
                <View className="flex-1 ml-3">
                  <Text className="text-black dark:text-white">{label}</Text>
                  <Text className="text-gray-500 text-sm">{sublabel}</Text>
                </View>
                {useMetricUnits === metric && (
                  <View className={`w-6 h-6 ${checkBg} rounded-full items-center justify-center`}>
                    <View className={`w-2 h-2 ${checkDot} rounded-full`} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Premium Section */}
        {!hasUnlockedPremium && (
          <View className="mb-6">
            <View className="bg-black dark:bg-white rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Heart size={20} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={1.5} />
                <Text className="text-white dark:text-black font-semibold ml-2">
                  Upgrade to Dotsby+
                </Text>
              </View>
              <Text className="text-gray-300 dark:text-gray-600 text-sm mb-3">
                Unlimited babies, unlimited history, data export, and more.
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/premium');
                }}
                className="bg-white dark:bg-black py-3 rounded-full items-center"
              >
                <Text className="text-black dark:text-white font-semibold">Unlock for $9.99</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Data Section */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Data
          </Text>
          <View className="bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Export Data', 'Data export feature coming soon.');
              }}
              className="flex-row items-center p-4"
            >
              <FileDown size={20} color={iconColor} strokeWidth={1.5} />
              <Text className="flex-1 text-black dark:text-white ml-3">Export Data</Text>
              <ChevronRight size={20} color="#999999" strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>

        {/* App Info */}
        <View className="items-center mt-4 mb-8">
          <Text className="text-gray-400 text-sm">Dotsby v1.0.0</Text>
          <Text className="text-gray-400 text-sm mt-1">Made with love for tired parents</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
