import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Input, NumberInput } from '../ui/Input';
import { useIsDark } from '../ThemeProvider';
import { insertPhoto, getAllPhotos } from '../../db/queries/photos';
import { getAgeInMonths } from '../../utils/dates';
import { canAddPhoto } from '../../utils/premium';
import { useAppStore } from '../../stores/appStore';
import type { MilestoneType } from '../../types';

interface AddPhotoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string | null;
  babyBirthDate?: string;
  onSaved?: () => void;
}

export function AddPhotoSheet({
  isOpen,
  onClose,
  babyId,
  babyBirthDate,
  onSaved,
}: AddPhotoSheetProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [milestoneType, setMilestoneType] = useState<MilestoneType>('monthly');
  const [monthNumber, setMonthNumber] = useState<number | null>(null);
  const [milestoneName, setMilestoneName] = useState('');
  const [caption, setCaption] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isDark = useIsDark();

  // Calculate current month age
  const currentMonthAge = babyBirthDate ? getAgeInMonths(babyBirthDate) : null;

  const resetForm = () => {
    setImageUri(null);
    setMilestoneType('monthly');
    setMonthNumber(null);
    setMilestoneName('');
    setCaption('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickImage = async (useCamera: boolean) => {
    const permissionResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        `Please grant ${useCamera ? 'camera' : 'photo library'} access to continue.`
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
          aspect: [1, 1],
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
          aspect: [1, 1],
        });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setImageUri(result.assets[0].uri);

      // Auto-set month number if monthly type
      if (milestoneType === 'monthly' && currentMonthAge !== null) {
        setMonthNumber(currentMonthAge);
      }
    }
  };

  const hasUnlockedPremium = useAppStore((s) => s.hasUnlockedPremium);

  const handleSave = async () => {
    if (!babyId || !imageUri) return;

    setIsSaving(true);
    try {
      const existing = await getAllPhotos(babyId);
      if (!canAddPhoto(existing.length, hasUnlockedPremium)) {
        Alert.alert('Photo Limit', 'Photo limit reached. Upgrade to Dotsby Pro for unlimited photos.');
        return;
      }

      await insertPhoto({
        babyId,
        imageUri,
        takenAt: new Date().toISOString(),
        milestoneType,
        monthNumber: milestoneType === 'monthly' ? monthNumber : null,
        milestoneName: milestoneType !== 'monthly' ? milestoneName : null,
        caption: caption || null,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSaved?.();
      handleClose();
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={handleClose} title="Add Photo">
      <View className="py-4">
        {/* Image Preview / Picker */}
        {imageUri ? (
          <View className="items-center mb-6">
            <Image
              source={{ uri: imageUri }}
              style={{ width: 200, height: 200, borderRadius: 12 }}
              contentFit="cover"
            />
            <Pressable
              onPress={() => setImageUri(null)}
              className="mt-2"
            >
              <Text className="text-gray-500">Change photo</Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-row gap-4 mb-6">
            <Pressable
              onPress={() => pickImage(true)}
              className="flex-1 items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-2xl p-6 active:bg-gray-200 dark:active:bg-zinc-700"
            >
              <Camera size={32} color={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} />
              <Text className="mt-2 font-medium text-black dark:text-white">Camera</Text>
            </Pressable>
            <Pressable
              onPress={() => pickImage(false)}
              className="flex-1 items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-2xl p-6 active:bg-gray-200 dark:active:bg-zinc-700"
            >
              <ImageIcon size={32} color={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} />
              <Text className="mt-2 font-medium text-black dark:text-white">Library</Text>
            </Pressable>
          </View>
        )}

        {/* Milestone Type */}
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</Text>
        <View className="flex-row gap-2 mb-4">
          {(['monthly', 'developmental', 'custom'] as MilestoneType[]).map((type) => (
            <Pressable
              key={type}
              onPress={() => {
                Haptics.selectionAsync();
                setMilestoneType(type);
              }}
              className={`flex-1 py-2 rounded-full items-center ${
                milestoneType === type ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-zinc-800'
              }`}
            >
              <Text
                className={`text-sm ${
                  milestoneType === type ? 'text-white dark:text-black' : 'text-black dark:text-white'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Month Number (for monthly type) */}
        {milestoneType === 'monthly' && (
          <NumberInput
            label="Month"
            value={monthNumber}
            onChangeValue={setMonthNumber}
            placeholder={currentMonthAge?.toString() || '0'}
            min={0}
            max={36}
          />
        )}

        {/* Milestone Name (for developmental/custom) */}
        {milestoneType !== 'monthly' && (
          <Input
            label="Milestone"
            value={milestoneName}
            onChangeText={setMilestoneName}
            placeholder="First smile, Rolling over, etc."
          />
        )}

        {/* Caption */}
        <Input
          label="Caption (optional)"
          value={caption}
          onChangeText={setCaption}
          placeholder="Add a note..."
          multiline
          numberOfLines={3}
        />

        {/* Save Button */}
        <Button
          title="Save Photo"
          onPress={handleSave}
          disabled={!imageUri}
          loading={isSaving}
          fullWidth
        />
      </View>
    </Sheet>
  );
}
