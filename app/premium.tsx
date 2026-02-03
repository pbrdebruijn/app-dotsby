import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  X,
  Check,
  Baby,
  Clock,
  Camera,
  FileDown,
  Heart,
} from 'lucide-react-native';
import { useIsDark } from '../src/components/ThemeProvider';
import { useAppStore } from '../src/stores/appStore';
import {
  getOfferings,
  purchasePremium,
  restorePurchases,
} from '../src/services/purchases';

interface FeatureRowProps {
  icon: React.ElementType;
  title: string;
  freeValue: string | boolean;
  premiumValue: string | boolean;
  isDark: boolean;
}

function FeatureRow({ icon: Icon, title, freeValue, premiumValue, isDark }: FeatureRowProps) {
  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check size={20} color="#22C55E" strokeWidth={2.5} />
      ) : (
        <X size={20} color="#EF4444" strokeWidth={2} />
      );
    }
    return (
      <Text className="text-sm text-black dark:text-white font-medium text-center">
        {value}
      </Text>
    );
  };

  return (
    <View className="flex-row items-center py-4 border-b border-gray-100 dark:border-zinc-800">
      <View className="flex-row items-center flex-1">
        <Icon size={20} color={isDark ? '#999999' : '#666666'} strokeWidth={1.5} />
        <Text className="text-black dark:text-white ml-3">{title}</Text>
      </View>
      <View className="w-20 items-center">{renderValue(freeValue)}</View>
      <View className="w-20 items-center">{renderValue(premiumValue)}</View>
    </View>
  );
}

export default function PremiumScreen() {
  const router = useRouter();
  const isDark = useIsDark();
  const unlockPremium = useAppStore((s) => s.unlockPremium);
  const hasUnlockedPremium = useAppStore((s) => s.hasUnlockedPremium);

  const [price, setPrice] = useState('$9.99');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    getOfferings().then((offering) => {
      const localizedPrice = offering?.lifetime?.product.priceString;
      if (localizedPrice) {
        setPrice(localizedPrice);
      }
    });
  }, []);

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPurchasing(true);

    try {
      const { success, cancelled } = await purchasePremium();

      if (success) {
        unlockPremium();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (!cancelled) {
        Alert.alert(
          'Purchase Failed',
          'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRestoring(true);

    try {
      const isPremium = await restorePurchases();

      if (isPremium) {
        unlockPremium();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Restored', 'Your Dotsby Pro purchase has been restored.', [
          { text: 'OK' },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found.', [
          { text: 'OK' },
        ]);
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const features = [
    {
      icon: Baby,
      title: 'Baby Profiles',
      free: '1',
      premium: 'Unlimited',
    },
    {
      icon: Clock,
      title: 'Pattern History',
      free: '12 weeks',
      premium: 'Forever',
    },
    {
      icon: Camera,
      title: 'Photo Storage',
      free: '24 photos',
      premium: 'Unlimited',
    },
    {
      icon: FileDown,
      title: 'Export to CSV',
      free: false,
      premium: true,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Close Button */}
        <Pressable
          onPress={() => router.back()}
          className="self-end w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 mb-4"
        >
          <X size={20} color={isDark ? '#FFFFFF' : '#000000'} />
        </Pressable>

        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-black dark:bg-white rounded-2xl items-center justify-center mb-4">
            <Heart size={32} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={1.5} />
          </View>
          <View className="flex-row items-center">
            <Text className="text-3xl font-bold text-black dark:text-white">Dotsby</Text>
            {hasUnlockedPremium && (
              <View className="bg-black dark:bg-white ml-2 px-2.5 py-1 rounded-full">
                <Text className="text-xs font-bold text-white dark:text-black">PRO</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-500 mt-2 text-center">
            {hasUnlockedPremium
              ? 'You have access to all Pro features'
              : 'Everything you need for your growing family'}
          </Text>
        </View>

        {/* Comparison Table */}
        <View className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-4 mb-6">
          {/* Table Header */}
          <View className="flex-row items-center pb-4 border-b-2 border-gray-200 dark:border-zinc-700">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-500">Features</Text>
            </View>
            <View className="w-20 items-center">
              <Text className="text-sm font-bold text-black dark:text-white">Free</Text>
            </View>
            <View className="w-20 items-center">
              <View className="bg-black dark:bg-white px-2 py-1 rounded-full">
                <Text className="text-xs font-bold text-white dark:text-black">PRO</Text>
              </View>
            </View>
          </View>

          {/* Feature Rows */}
          {features.map((feature) => (
            <FeatureRow
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              freeValue={feature.free}
              premiumValue={feature.premium}
              isDark={isDark}
            />
          ))}
        </View>

        {/* Free Features Callout */}
        <View className="bg-gray-100 dark:bg-zinc-800 rounded-2xl p-4 mb-6">
          <Text className="text-sm font-semibold text-black dark:text-white mb-2">
            What&apos;s included free:
          </Text>
          <Text className="text-gray-500 text-sm leading-5">
            • All tracking features (sleep, feeding, diapers, pumping){'\n'}
            • Full sleep schedule calculator{'\n'}
            • Wake window reminders{'\n'}
            • Local notifications{'\n'}
            • Basic home screen widget{'\n'}
            • Complete privacy - all data stays on device
          </Text>
        </View>

        {/* Pricing */}
        <View className="items-center mb-6">
          <Text className="text-5xl font-bold text-black dark:text-white">{price}</Text>
          <Text className="text-gray-500 mt-1">One-time purchase • No subscription</Text>
        </View>

        {/* Purchase Button */}
        {hasUnlockedPremium ? (
          <View className="bg-green-500 py-4 rounded-full items-center mb-4">
            <View className="flex-row items-center">
              <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text className="text-white font-semibold ml-2">You have Dotsby Pro</Text>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={handlePurchase}
            disabled={isPurchasing || isRestoring}
            className="bg-black dark:bg-white py-4 rounded-full items-center mb-4 active:opacity-80"
            style={isPurchasing || isRestoring ? { opacity: 0.5 } : undefined}
          >
            {isPurchasing ? (
              <ActivityIndicator color={isDark ? '#000000' : '#FFFFFF'} />
            ) : (
              <Text className="text-white dark:text-black font-semibold text-lg">
                Unlock Dotsby Pro
              </Text>
            )}
          </Pressable>
        )}

        {/* Restore Purchases */}
        {!hasUnlockedPremium && (
          <Pressable
            onPress={handleRestore}
            disabled={isPurchasing || isRestoring}
            className="items-center py-2"
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="#9CA3AF" />
            ) : (
              <Text className="text-gray-500 text-sm">Restore Purchases</Text>
            )}
          </Pressable>
        )}

        {/* Fine Print */}
        <Text className="text-gray-400 text-xs text-center mt-6 leading-4">
          Payment will be charged to your Apple ID account at purchase confirmation.{' '}
          Purchase includes Family Sharing for up to 6 family members.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
