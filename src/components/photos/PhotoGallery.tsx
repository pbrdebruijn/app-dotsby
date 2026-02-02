import React from 'react';
import { View, Text, FlatList, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Heart } from 'lucide-react-native';
import type { MilestonePhoto } from '../../types';

interface PhotoGalleryProps {
  photos: MilestonePhoto[];
  onPhotoPress?: (photo: MilestonePhoto) => void;
  numColumns?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 4;

export function PhotoGallery({ photos, onPhotoPress, numColumns = 3 }: PhotoGalleryProps) {
  const itemSize = (SCREEN_WIDTH - GAP * (numColumns + 1)) / numColumns;

  const handlePress = (photo: MilestonePhoto) => {
    Haptics.selectionAsync();
    onPhotoPress?.(photo);
  };

  const renderItem = ({ item }: { item: MilestonePhoto }) => (
    <Pressable
      onPress={() => handlePress(item)}
      className="relative active:opacity-80"
      style={{ width: itemSize, height: itemSize, margin: GAP / 2 }}
    >
      <Image
        source={{ uri: item.imageUri }}
        style={{ width: '100%', height: '100%', borderRadius: 4 }}
        contentFit="cover"
        transition={200}
      />
      {item.isFavorite && (
        <View className="absolute top-2 right-2">
          <Heart size={16} color="#FFFFFF" fill="#EF4444" />
        </View>
      )}
      {item.monthNumber && (
        <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
          <Text className="text-white text-xs text-center font-medium">
            {item.monthNumber} month{item.monthNumber !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </Pressable>
  );

  if (photos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-gray-400 text-center">No photos yet</Text>
        <Text className="text-gray-400 text-center text-sm mt-1">
          Capture your baby's milestones
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={{ padding: GAP / 2 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
