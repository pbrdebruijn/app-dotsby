# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npx expo start          # Start dev server (press i for iOS, a for Android)
npx expo start --ios    # Start directly on iOS simulator
npx expo start --android
npx expo lint           # Run ESLint
npx expo export         # Build for production
```

No test framework is configured yet.

## Architecture

**Dotsby** is a local-first baby tracking iOS/Android app built with Expo SDK 54, Expo Router v6, and TypeScript.

### Routing (`app/`)

File-based routing via Expo Router. The root `app/index.tsx` redirects to `/onboarding` (if first launch) or `/(tabs)` (main app). Tab screens: Home, Patterns, Photos, Settings. Modal screens: `premium.tsx`.

### Data Layer

**Database**: expo-sqlite with a single `dotsby.db` file. Schema defined in `src/db/schema.ts` with PRAGMA user_version for migrations. The query layer in `src/db/queries/` abstracts all SQL — components never write raw SQL.

**Naming convention**: Database columns use `snake_case`, TypeScript interfaces use `camelCase`. Row types (e.g., `SleepLogRow`) map 1:1 to DB columns; app types (e.g., `SleepLog`) use camelCase. Query functions handle the conversion.

**All volume values are stored in ounces** internally. Conversion to metric (ml) happens at the display layer via `src/utils/units.ts`.

### State Management (`src/stores/`)

Three Zustand stores:
- **appStore** — Persisted (AsyncStorage). Holds onboarding state, selected baby, appearance mode, metric/imperial preference, premium status.
- **babyStore** — Not persisted. Populated from SQLite on app init. Holds the babies array.
- **timerStore** — Persisted (AsyncStorage). Tracks active sleep/nursing/pumping timers so they survive app restarts.

### Styling

NativeWind v4 (Tailwind CSS for React Native) with class-based dark mode (`dark:` prefix). The `ThemeProvider` component syncs the NativeWind color scheme with the user's appearance preference. Use the `useIsDark()` hook for dynamic icon/SVG colors that can't use Tailwind classes.

Design language is monochrome: black/white with gray tones. Active/selected states invert (black bg + white text in light mode, white bg + black text in dark mode).

### Services (`src/services/`)

- **sleepTargets** — Age-based sleep recommendations (wake windows, nap counts, total hours).
- **patternCalculator** — Converts daily activity data into 0-4 intensity scores for the contribution grid. Has separate color palettes for light/dark mode.
- **notifications** — Local notification scheduling for nap reminders, feeding reminders, monthly photo prompts.

### Key Conventions

- UUIDs generated via `expo-crypto` (`src/utils/ids.ts`), not the `uuid` package (which doesn't work in React Native).
- All interactive elements use `expo-haptics` for tactile feedback.
- Bottom sheets use the custom `Sheet` component (Modal with pageSheet presentation), not a third-party library.
- Components accept an `isDark` boolean or call `useIsDark()` internally for icon colors passed as props to lucide-react-native icons.
