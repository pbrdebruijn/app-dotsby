import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Moon, Baby, BarChart3 } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { useIsDark } from '../../src/components/ThemeProvider';

export default function WelcomeScreen() {
  const router = useRouter();
  const isDark = useIsDark();

  const features = [
    {
      icon: Moon,
      title: 'Track Sleep',
      description: 'Log naps and night sleep with smart wake window reminders',
    },
    {
      icon: Baby,
      title: 'Log Feedings',
      description: 'Nursing timer with side tracking, bottles, and solids',
    },
    {
      icon: BarChart3,
      title: 'See Patterns',
      description: 'Visualize your baby\'s routines at a glance',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 px-6 pt-12">
        {/* Logo */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-black dark:bg-white rounded-3xl items-center justify-center mb-4">
            {/* Dot grid pattern */}
            <View className="flex-row gap-1.5">
              <View className="gap-1.5">
                <View className={`w-3 h-3 rounded-full ${isDark ? 'bg-black/30' : 'bg-white/30'}`} />
                <View className={`w-3 h-3 rounded-full ${isDark ? 'bg-black/60' : 'bg-white/60'}`} />
                <View className={`w-3 h-3 rounded-full ${isDark ? 'bg-black' : 'bg-white'}`} />
              </View>
              <View className="gap-1.5">
                <View className={`w-3 h-3 rounded-full ${isDark ? 'bg-black/60' : 'bg-white/60'}`} />
                <View className={`w-3 h-3 rounded-full ${isDark ? 'bg-black' : 'bg-white'}`} />
                <View className={`w-3 h-3 rounded-full ${isDark ? 'bg-black/60' : 'bg-white/60'}`} />
              </View>
              <View className="gap-1.5">
                <View className={`w-3 h-3 rounded-full ${isDark ? 'bg-black' : 'bg-white'}`} />
                <View className={`w-3 h-3 rounded-full ${isDark ? 'bg-black/60' : 'bg-white/60'}`} />
                <View className={`w-3 h-3 rounded-full ${isDark ? 'bg-black/30' : 'bg-white/30'}`} />
              </View>
            </View>
          </View>
          <Text className="text-3xl font-bold text-black dark:text-white">Welcome to Dotsby</Text>
          <Text className="text-gray-500 mt-2 text-center">
            Simple tracking for tired parents
          </Text>
        </View>

        {/* Features */}
        <View className="flex-1 justify-center">
          {features.map(({ icon: Icon, title, description }, index) => (
            <View key={index} className="flex-row items-start mb-6">
              <View className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-xl items-center justify-center mr-4">
                <Icon size={24} color={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-black dark:text-white">{title}</Text>
                <Text className="text-gray-500 mt-1">{description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View className="pb-8">
          <Button
            title="Get Started"
            onPress={() => router.push('/onboarding/add-baby')}
            size="lg"
            fullWidth
          />
          <Text className="text-gray-400 text-center text-sm mt-4">
            100% private. All data stays on your device.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
