# Dotsby Style Guide

Reference for replicating the Dotsby visual language in other apps.

---

## Design Philosophy

Monochrome, minimal, and tactile. The entire UI is built on black, white, and grays — no brand colors, no gradients. Active/selected states invert foreground and background. Every interactive element has haptic feedback.

---

## Color Palette

### Core Colors

| Token | Light | Dark |
|-------|-------|------|
| Background | `#FFFFFF` | `#000000` |
| Foreground / text | `#000000` | `#FFFFFF` |
| Secondary text | `#666666` | `#666666` |
| Muted surface | `#F5F5F5` (`gray-100`) | `#27272A` (`zinc-800`) |
| Card surface | `#FFFFFF` | `#18181B` (`zinc-900`) |
| Border / divider | `#E5E5E5` | `#333333` |
| Placeholder text | `#9CA3AF` | `#6B7280` |

### Tab Bar

| Token | Light | Dark |
|-------|-------|------|
| Active tint | `#000000` | `#FFFFFF` |
| Inactive tint | `#999999` | `#666666` |
| Background | `#FFFFFF` | `#000000` |
| Top border | `#E5E5E5` | `#333333` |

### Status Colors

| Use | Color |
|-----|-------|
| Error / destructive | `#EF4444` (red-500) |
| Error border | 2px `#EF4444` |

There is no success/warning/info color. The app stays monochrome.

### Intensity Scale (Contribution Grid)

Five-step grayscale ramp from "no data" to "very active":

**Light mode:**
`#EEEEF0` > `#C0C0C4` > `#808088` > `#44444C` > `#000000`

**Dark mode:**
`#1C1C1E` > `#3A3A3C` > `#6C6C70` > `#AEAEB2` > `#FFFFFF`

---

## Typography

### Font Families

System fonts only — no custom fonts are loaded.

| Role | iOS | Android |
|------|-----|---------|
| Sans (default) | System UI (San Francisco) | Roboto |
| Serif | `ui-serif` | `serif` |
| Rounded | `ui-rounded` | System default |
| Mono | `ui-monospace` | `monospace` |

### Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-[10px]` | 10px | Badges |
| `text-[11px]` | 11px | Tab bar labels |
| `text-xs` | 12px | Captions, timestamps |
| `text-sm` | 14px | Labels, secondary info |
| `text-base` | 16px | Body text, input values |
| `text-lg` | 18px | Section headers, sheet titles |
| `text-2xl` | 24px | Screen titles |
| `text-6xl` | 48px | Timer display |

### Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-light` | 300 | Timer digits |
| `font-medium` | 500 | Tab labels, compact timers, list items |
| `font-semibold` | 600 | Button text, card titles, sheet titles |
| `font-bold` | 700 | App name header |

### Special

- **Tabular numerals** on all timer displays: `style={{ fontVariant: ['tabular-nums'] }}`
- **Tight tracking** on large text: `tracking-tight`

---

## Spacing

All spacing follows the Tailwind 4px grid.

### Common Values

| Use | Value |
|-----|-------|
| Screen padding | `p-4` (16px) |
| Card internal padding | `p-4` (16px) |
| Sheet content padding | 16px (via `contentContainerStyle`) |
| Row gap (standard) | `gap-3` (12px) or `gap-4` (16px) |
| Input bottom margin | `mb-4` (16px) |
| Section header margin bottom | `mb-3` (12px) |

---

## Border Radius

| Class | Radius | Usage |
|-------|--------|-------|
| `rounded-full` | 9999px | Buttons, badges, timer button, compact timer pill |
| `rounded-2xl` | 16px | Cards |
| `rounded-xl` | 12px | Input fields |

No small-radius containers. The app uses either full-round or large-radius.

---

## Shadows & Elevation

None. Depth is conveyed through background color contrast and 1px borders, never shadows.

---

## Components

### Button

Pill-shaped, always `rounded-full`. Four variants:

| Variant | Light | Dark |
|---------|-------|------|
| `primary` | Black bg, white text | White bg, black text |
| `secondary` | `gray-100` bg, black text | `zinc-800` bg, white text |
| `outline` | Transparent, 2px black border | Transparent, 2px white border |
| `ghost` | Transparent, black text | Transparent, white text |

Three sizes:

| Size | Padding |
|------|---------|
| `sm` | `px-4 py-2` |
| `md` | `px-6 py-3` |
| `lg` | `px-8 py-4` |

States:
- Press: `active:opacity-80`
- Disabled: `opacity-50`
- Loading: centered `ActivityIndicator` replaces content

Text is always `font-semibold`, size matches button size (`text-sm` / `text-base` / `text-lg`).

Icon + text layout: `flex-row items-center gap-2`.

### Card

```
bg-white dark:bg-zinc-900 rounded-2xl p-4
```

- Pressable variant adds `active:opacity-80`
- `CardHeader`: `flex-row items-center justify-between mb-3`
- `CardTitle`: `text-lg font-semibold text-black dark:text-white`

### Input

```
bg-gray-100 dark:bg-zinc-800 rounded-xl px-4 py-3
text-base text-black dark:text-white
```

- Label above: `text-sm font-medium text-gray-700 dark:text-gray-300 mb-1`
- Error state: `border-2 border-red-500`
- Error message below: `text-sm text-red-500 mt-1`
- Number variant supports units displayed to the right (`ml-2 text-gray-500`)

### Sheet (Modal)

Full-height modal using `presentationStyle="pageSheet"` with `animationType="slide"`.

Header layout:
```
flex-row items-center justify-between px-4 py-4
border-b border-gray-100 dark:border-zinc-800
```

Close button (right side):
```
w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800
items-center justify-center
```
Icon: `X` at 20px.

Left side: empty `w-10` spacer to keep title centered.

Content: `ScrollView` with `contentContainerStyle={{ padding: 16 }}`.

Wraps everything in `KeyboardAvoidingView` with `behavior="padding"` on iOS.

### Timer

**Full size:**
- Display: `text-6xl font-light tracking-tight` with `fontVariant: ['tabular-nums']`
- Button: `w-20 h-20 rounded-full border-2 border-black dark:border-white`
  - Stopped: white/black bg with Play icon
  - Running: black/white bg (inverted) with Square icon
  - Press: `active:scale-95`
- Icon size: 28px
- Helper text below: `text-gray-500`

**Compact:**
- Pill layout: `flex-row items-center gap-2 px-4 py-2 rounded-full`
  - Running: `bg-black dark:bg-white` with inverted text
  - Stopped: `bg-gray-100 dark:bg-zinc-800`
- Icon size: 16px
- Text: `font-medium` with `fontVariant: ['tabular-nums']`

### Selection Toggles

Radio/checkbox pattern using background inversion:

- Selected: `bg-black dark:bg-white` with `text-white dark:text-black`
- Unselected: `bg-gray-100 dark:bg-zinc-800` with `text-black dark:text-white`

### List Items

```
p-4
border-b border-gray-200 dark:border-zinc-800  (not on last item)
```

- Icon on left: 20px
- Label: `font-medium flex-1`
- Right: chevron icon or toggle

---

## Dark Mode

Class-based via NativeWind v4 (`darkMode: 'class'` in Tailwind config).

### Rules

1. Every `bg-*` class gets a `dark:bg-*` counterpart.
2. Every `text-*` class gets a `dark:text-*` counterpart.
3. Every `border-*` class gets a `dark:border-*` counterpart.
4. Icon colors that can't use Tailwind classes are set dynamically:
   ```tsx
   const isDark = useIsDark();
   <Icon color={isDark ? '#FFFFFF' : '#000000'} />
   ```
5. StatusBar: `style={isDark ? 'light' : 'dark'}`
6. Stack background: `contentStyle: { backgroundColor: isDark ? '#000000' : '#FFFFFF' }`

### Common Pairs

| Element | Light | Dark |
|---------|-------|------|
| Screen bg | `bg-white` | `dark:bg-black` |
| Card bg | `bg-white` | `dark:bg-zinc-900` |
| Input / muted bg | `bg-gray-100` | `dark:bg-zinc-800` |
| Primary text | `text-black` | `dark:text-white` |
| Secondary text | `text-gray-700` | `dark:text-gray-300` |
| Divider | `border-gray-100` | `dark:border-zinc-800` |

### ThemeProvider

Reads `appearanceMode` ('light' | 'dark' | 'system') from Zustand store, syncs it to NativeWind's `setColorScheme`. The `useIsDark()` hook resolves the current state for imperative color logic.

---

## Haptic Feedback

Every interactive element triggers haptics via `expo-haptics`.

| Action | Feedback |
|--------|----------|
| Button press | `ImpactFeedbackStyle.Light` |
| Sheet open / close | `ImpactFeedbackStyle.Light` |
| Tab switch | `ImpactFeedbackStyle.Light` |
| Timer start / stop | `ImpactFeedbackStyle.Medium` |
| Toggle / radio selection | `selectionAsync()` |
| Success confirmation | `NotificationFeedbackType.Success` |

---

## Animation & Interaction

No animation library (no Reanimated). All motion comes from:

| Pattern | Implementation |
|---------|---------------|
| Press shrink | `active:scale-95` (timer buttons) |
| Press fade | `active:opacity-80` (cards, buttons) |
| Screen transitions | `animation: 'slide_from_right'` (Stack) |
| Modal entrance | `animationType: "slide"` + `pageSheet` |
| Image fade-in | `transition={300}` (expo-image) |

---

## Icons

**Library:** `lucide-react-native`

| Context | Size | Stroke Width |
|---------|------|--------------|
| Tab bar | System default (via `size` prop) | 1.5 |
| Header actions | 20px | 1.5 |
| Action buttons | 24px | 1.5 |
| Timer play/stop | 28px | default |
| Inline with text | 16-20px | 1.5 |

Stroke width `1.5` is used universally for a lighter, refined line weight.

Icon colors always match the surrounding text color or are set via `isDark` ternary.

---

## Screen Layout

```tsx
<SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
  <ScrollView
    contentContainerStyle={{ padding: 16 }}
    showsVerticalScrollIndicator={false}
  >
    {/* Screen content */}
  </ScrollView>
</SafeAreaView>
```

- Always wrap in `SafeAreaView` with `edges={['top']}` for notch safety.
- Tab bar handles bottom safe area automatically.
- Headers are hidden (`headerShown: false`) — custom headers rendered inline.
- Scroll indicators hidden (`showsVerticalScrollIndicator={false}`).

---

## Navigation

### Tab Bar

```tsx
tabBarStyle: {
  backgroundColor: isDark ? '#000000' : '#FFFFFF',
  borderTopColor: isDark ? '#333333' : '#E5E5E5',
  borderTopWidth: 1,
  paddingTop: 8,
  paddingBottom: insets.bottom + 8,
  height: 60 + insets.bottom,
}
tabBarLabelStyle: {
  fontSize: 11,
  fontWeight: '500',
}
```

Each tab button wraps in a custom `HapticTabButton` that fires light haptics on press.

### Stack

```tsx
screenOptions={{
  headerShown: false,
  contentStyle: { backgroundColor: isDark ? '#000000' : '#FFFFFF' },
  animation: 'slide_from_right',
}}
```

---

## Quick Reference

### The Inversion Pattern

This is the core visual mechanic. Any active/selected/running state swaps foreground and background:

```
Light mode, inactive:  gray bg + black text
Light mode, active:    black bg + white text

Dark mode, inactive:   zinc-800 bg + white text
Dark mode, active:     white bg + black text
```

This applies to: primary buttons, selection toggles, compact timers, quick log buttons, and badges.

### Checklist for New Components

1. Uses `bg-white dark:bg-black` or appropriate surface pair
2. Text has `dark:` counterpart
3. Borders have `dark:` counterpart
4. Interactive elements have haptic feedback
5. Pressable elements have `active:opacity-80` or `active:scale-95`
6. Icons use `strokeWidth={1.5}` and dynamic `isDark` color
7. No shadows, no gradients, no brand colors
8. Rounded corners: `rounded-full` for pills, `rounded-2xl` for cards, `rounded-xl` for inputs
