import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Heart, Grid3X3 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { PhotoGallery } from '../../src/components/photos/PhotoGallery';
import { AddPhotoSheet } from '../../src/components/photos/AddPhotoSheet';
import { useAppStore } from '../../src/stores/appStore';
import { useBabyStore } from '../../src/stores/babyStore';
import { useIsDark } from '../../src/components/ThemeProvider';
import { getAllPhotos, getFavoritePhotos } from '../../src/db/queries/photos';
import { canAddPhoto } from '../../src/utils/premium';
import type { MilestonePhoto } from '../../src/types';

type FilterType = 'all' | 'favorites';

export default function PhotosScreen() {
  const [photos, setPhotos] = useState<MilestonePhoto[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const selectedBabyId = useAppStore((s) => s.selectedBabyId);
  const hasUnlockedPremium = useAppStore((s) => s.hasUnlockedPremium);
  const babies = useBabyStore((s) => s.babies);
  const selectedBaby = babies.find((b) => b.id === selectedBabyId);
  const isDark = useIsDark();

  const loadPhotos = useCallback(async () => {
    if (!selectedBabyId) {
      setPhotos([]);
      setIsLoading(false);
      return;
    }

    try {
      const data = filter === 'favorites'
        ? await getFavoritePhotos(selectedBabyId)
        : await getAllPhotos(selectedBabyId);
      setPhotos(data);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBabyId, filter]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  }, [loadPhotos]);

  const handlePhotoPress = (photo: MilestonePhoto) => {
    // Could open a detail view
    console.log('Photo pressed:', photo.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-black dark:text-white">Photos</Text>
            {selectedBaby && (
              <Text className="text-gray-500 mt-1">{selectedBaby.name}'s milestones</Text>
            )}
          </View>
          <Pressable
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (!selectedBabyId) return;
              const allPhotos = await getAllPhotos(selectedBabyId);
              if (!canAddPhoto(allPhotos.length, hasUnlockedPremium)) {
                Alert.alert(
                  'Photo Limit',
                  'Free accounts are limited to 24 photos. Upgrade to Dotsby Pro for unlimited photo storage.',
                  [
                    { text: 'Not Now', style: 'cancel' },
                    { text: 'Upgrade', onPress: () => router.push('/premium') },
                  ],
                );
                return;
              }
              setShowAddSheet(true);
            }}
            className="w-12 h-12 bg-black dark:bg-white rounded-full items-center justify-center"
          >
            <Plus size={24} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setFilter('all');
            }}
            className={`flex-row items-center px-4 py-2 rounded-full ${
              filter === 'all' ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'
            }`}
          >
            <Grid3X3
              size={16}
              color={filter === 'all' ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#FFFFFF' : '#000000')}
              strokeWidth={1.5}
            />
            <Text
              className={`ml-2 font-medium ${
                filter === 'all' ? 'text-white dark:text-black' : 'text-black dark:text-white'
              }`}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setFilter('favorites');
            }}
            className={`flex-row items-center px-4 py-2 rounded-full ${
              filter === 'favorites' ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'
            }`}
          >
            <Heart
              size={16}
              color={filter === 'favorites' ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#FFFFFF' : '#000000')}
              strokeWidth={1.5}
            />
            <Text
              className={`ml-2 font-medium ${
                filter === 'favorites' ? 'text-white dark:text-black' : 'text-black dark:text-white'
              }`}
            >
              Favorites
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Photo Gallery */}
      <PhotoGallery
        photos={photos}
        onPhotoPress={handlePhotoPress}
      />

      {/* Add Photo Sheet */}
      <AddPhotoSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        babyId={selectedBabyId}
        babyBirthDate={selectedBaby?.birthDate}
        onSaved={loadPhotos}
      />
    </SafeAreaView>
  );
}
