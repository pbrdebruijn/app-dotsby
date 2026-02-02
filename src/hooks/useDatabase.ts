import { useEffect, useState } from 'react';
import { getDatabase } from '../db/database';
import { getAllBabies } from '../db/queries/babies';
import { useBabyStore } from '../stores/babyStore';
import { useAppStore } from '../stores/appStore';

export function useInitializeApp() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const setBabies = useBabyStore((s) => s.setBabies);
  const setSelectedBaby = useAppStore((s) => s.setSelectedBaby);
  const selectedBabyId = useAppStore((s) => s.selectedBabyId);

  useEffect(() => {
    async function initialize() {
      try {
        // Initialize database
        await getDatabase();

        // Load babies
        const babies = await getAllBabies();
        setBabies(babies);

        // Auto-select first baby if none selected
        if (!selectedBabyId && babies.length > 0) {
          setSelectedBaby(babies[0].id);
        }

        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    }

    initialize();
  }, [setBabies, setSelectedBaby, selectedBabyId]);

  return { isReady, error };
}

export function useRefreshBabies() {
  const setBabies = useBabyStore((s) => s.setBabies);
  const setLoading = useBabyStore((s) => s.setLoading);

  return async () => {
    setLoading(true);
    try {
      const babies = await getAllBabies();
      setBabies(babies);
    } finally {
      setLoading(false);
    }
  };
}
