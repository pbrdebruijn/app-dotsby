import React from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Heart, Trash2 } from 'lucide-react-native';
import { formatDate } from '../../utils/dates';
import type { MilestonePhoto } from '../../types';

interface PhotoCardProps {
  photo: MilestonePhoto;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function PhotoCard({ photo, onToggleFavorite, onDelete }: PhotoCardProps) {
  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFavorite?.();
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete?.();
  };

  return (
    <View className="bg-white rounded-2xl overflow-hidden mb-4">
      {/* Image */}
      <Image
        source={{ uri: photo.imageUri }}
        style={{ width: SCREEN_WIDTH - 32, height: SCREEN_WIDTH - 32 }}
        contentFit="cover"
        transition={300}
      />

      {/* Info */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold text-black">
            {photo.milestoneName || (photo.monthNumber ? `${photo.monthNumber} Months` : 'Milestone')}
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleFavorite}
              className="p-2 rounded-full bg-gray-100"
            >
              <Heart
                size={20}
                color={photo.isFavorite ? '#EF4444' : '#9CA3AF'}
                fill={photo.isFavorite ? '#EF4444' : 'transparent'}
              />
            </Pressable>
            {onDelete && (
              <Pressable
                onPress={handleDelete}
                className="p-2 rounded-full bg-gray-100"
              >
                <Trash2 size={20} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
        </View>

        <Text className="text-gray-500">{formatDate(photo.takenAt)}</Text>

        {photo.caption && (
          <Text className="text-gray-700 mt-2">{photo.caption}</Text>
        )}
      </View>
    </View>
  );
}
