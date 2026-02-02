import { Redirect } from 'expo-router';
import { useAppStore } from '../src/stores/appStore';
import { useBabyStore } from '../src/stores/babyStore';

export default function Index() {
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const babies = useBabyStore((s) => s.babies);

  // If no onboarding completed or no babies, go to onboarding
  if (!hasCompletedOnboarding || babies.length === 0) {
    return <Redirect href="/onboarding" />;
  }

  // Otherwise go to main tabs
  return <Redirect href="/(tabs)" />;
}
