import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  hasCompletedOnboarding: boolean;
  selectedBabyId: string | null;
  appearanceMode: 'light' | 'dark' | 'system';
  useMetricUnits: boolean;
  hasUnlockedPremium: boolean;

  // Actions
  setOnboardingComplete: () => void;
  setSelectedBaby: (id: string | null) => void;
  setAppearanceMode: (mode: 'light' | 'dark' | 'system') => void;
  setUseMetricUnits: (useMetric: boolean) => void;
  unlockPremium: () => void;
  reset: () => void;
}

const initialState = {
  hasCompletedOnboarding: false,
  selectedBabyId: null,
  appearanceMode: 'system' as const,
  useMetricUnits: false,
  hasUnlockedPremium: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      setSelectedBaby: (id) => set({ selectedBabyId: id }),
      setAppearanceMode: (mode) => set({ appearanceMode: mode }),
      setUseMetricUnits: (useMetric) => set({ useMetricUnits: useMetric }),
      unlockPremium: () => set({ hasUnlockedPremium: true }),
      reset: () => set(initialState),
    }),
    {
      name: 'dotsby-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
