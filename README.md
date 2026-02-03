# Dotsby

A local-first baby tracking app for tired parents. Track sleep, feedings, diapers, and pumping with pattern visualization and milestone photos.

Built with Expo SDK 54, React Native, and TypeScript. All data stays on-device using SQLite.

## Getting Started

```bash
npm install
npx expo start
```

Press `i` for iOS simulator or `a` for Android emulator.

## Features

- **Sleep tracking** — Timer-based nap and night sleep logging with wake window calculations
- **Feeding tracking** — Nursing timer with side tracking, bottle logging, and solids
- **Diaper tracking** — Wet, dirty, or both with optional color notes
- **Pumping tracking** — Timer with left/right output tracking
- **Pattern visualization** — GitHub-style contribution grid showing activity intensity over 4-12 weeks
- **Milestone photos** — Monthly, developmental, and custom milestone photo gallery
- **Smart schedules** — Age-based wake window reminders and nap suggestions
- **Dark mode** — Full light/dark/system theme support
- **Metric & Imperial** — Toggle between oz/ml throughout the app

## Tech Stack

- **Framework**: Expo SDK 54 + Expo Router v6 (file-based routing)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **Database**: expo-sqlite (local SQLite)
- **State**: Zustand with AsyncStorage persistence
- **Icons**: lucide-react-native
- **Dates**: date-fns

## Project Structure

```
app/                    # Expo Router screens
  (tabs)/               # Tab navigation (Home, Patterns, Photos, Settings)
  onboarding/           # First-launch onboarding flow
  premium.tsx           # Dotsby+ comparison screen
src/
  components/           # UI components (ui/, logging/, patterns/, photos/, schedule/)
  db/                   # SQLite database, schema, and query functions
  hooks/                # Custom hooks (usePatternData, useSleepSchedule, etc.)
  services/             # Business logic (sleep targets, pattern calculator, notifications)
  stores/               # Zustand stores (app settings, baby data, timers)
  types/                # TypeScript interfaces and type definitions
  utils/                # Helpers (dates, units, ID generation)
```
