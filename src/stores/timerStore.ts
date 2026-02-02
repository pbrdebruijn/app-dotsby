import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TimerData {
  babyId: string;
  startTime: string; // ISO string for persistence
}

interface NursingTimerData extends TimerData {
  side: 'left' | 'right';
}

interface TimerState {
  // Active timers
  activeSleepTimer: TimerData | null;
  activeNursingTimer: NursingTimerData | null;
  activePumpingTimer: TimerData | null;

  // Actions
  startSleepTimer: (babyId: string) => void;
  stopSleepTimer: () => TimerData | null;

  startNursingTimer: (babyId: string, side: 'left' | 'right') => void;
  switchNursingSide: () => void;
  stopNursingTimer: () => NursingTimerData | null;

  startPumpingTimer: (babyId: string) => void;
  stopPumpingTimer: () => TimerData | null;

  clearAllTimers: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      activeSleepTimer: null,
      activeNursingTimer: null,
      activePumpingTimer: null,

      startSleepTimer: (babyId) =>
        set({
          activeSleepTimer: { babyId, startTime: new Date().toISOString() },
        }),

      stopSleepTimer: () => {
        const timer = get().activeSleepTimer;
        set({ activeSleepTimer: null });
        return timer;
      },

      startNursingTimer: (babyId, side) =>
        set({
          activeNursingTimer: { babyId, side, startTime: new Date().toISOString() },
        }),

      switchNursingSide: () => {
        const current = get().activeNursingTimer;
        if (current) {
          set({
            activeNursingTimer: {
              ...current,
              side: current.side === 'left' ? 'right' : 'left',
            },
          });
        }
      },

      stopNursingTimer: () => {
        const timer = get().activeNursingTimer;
        set({ activeNursingTimer: null });
        return timer;
      },

      startPumpingTimer: (babyId) =>
        set({
          activePumpingTimer: { babyId, startTime: new Date().toISOString() },
        }),

      stopPumpingTimer: () => {
        const timer = get().activePumpingTimer;
        set({ activePumpingTimer: null });
        return timer;
      },

      clearAllTimers: () =>
        set({
          activeSleepTimer: null,
          activeNursingTimer: null,
          activePumpingTimer: null,
        }),
    }),
    {
      name: 'dotsby-timer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper to get elapsed seconds from a timer
export function getElapsedSeconds(startTime: string): number {
  return Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
}
