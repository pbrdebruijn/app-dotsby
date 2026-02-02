import { create } from 'zustand';
import type { Baby } from '../types';

interface BabyState {
  babies: Baby[];
  isLoading: boolean;

  // Actions
  setBabies: (babies: Baby[]) => void;
  addBaby: (baby: Baby) => void;
  updateBaby: (id: string, updates: Partial<Baby>) => void;
  removeBaby: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useBabyStore = create<BabyState>((set) => ({
  babies: [],
  isLoading: true,

  setBabies: (babies) => set({ babies, isLoading: false }),

  addBaby: (baby) =>
    set((state) => ({
      babies: [baby, ...state.babies],
    })),

  updateBaby: (id, updates) =>
    set((state) => ({
      babies: state.babies.map((baby) =>
        baby.id === id ? { ...baby, ...updates } : baby
      ),
    })),

  removeBaby: (id) =>
    set((state) => ({
      babies: state.babies.filter((baby) => baby.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
