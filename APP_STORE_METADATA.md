# Dotsby — iOS App Store Metadata

Everything needed to fill out App Store Connect for submission.

---

## App Information

| Field | Value |
|---|---|
| **App Name** | Dotsby |
| **Subtitle** (30 chars max) | Simple baby tracking |
| **Bundle ID** | com.dotsby.app |
| **SKU** | com.dotsby.app |
| **Primary Language** | English (U.S.) |
| **Content Rights** | Does not contain third-party content |

---

## Categories

| Field | Value |
|---|---|
| **Primary Category** | Health & Fitness |
| **Secondary Category** | Lifestyle |

---

## Age Rating Questionnaire

Answer **"None"** or **"No"** to all questions:

- Cartoon or Fantasy Violence: None
- Realistic Violence: None
- Prolonged Graphic or Sadistic Realistic Violence: None
- Profanity or Crude Humor: None
- Mature/Suggestive Themes: None
- Horror/Fear Themes: None
- Medical/Treatment Information: None
- Simulated Gambling: None
- Unrestricted Web Access: No
- Gambling with Real Currency: No

**Expected Rating:** 4+

---

## App Privacy (Privacy Nutrition Labels)

Since Dotsby is fully local-first with no server communication:

| Question | Answer |
|---|---|
| Do you or your third-party partners collect data? | **Yes** (RevenueCat for purchases only) |

### Data Collected

| Data Type | Purpose | Linked to Identity? | Tracking? |
|---|---|---|---|
| Purchases | App Functionality | No | No |

All baby data (logs, photos, settings) stays on-device in SQLite. No analytics, no telemetry, no accounts, no cloud sync.

If you remove RevenueCat and handle purchases purely through StoreKit, you can select **"Data Not Collected"** instead.

---

## Pricing & Availability

| Field | Value |
|---|---|
| **Price** | Free |
| **In-App Purchases** | Dotsby+ ($9.99, non-consumable / lifetime) |
| **Availability** | All territories |
| **Pre-Order** | Optional — your call |

---

## In-App Purchase Metadata (for Dotsby+)

| Field | Value |
|---|---|
| **Reference Name** | Dotsby+ Lifetime |
| **Product ID** | (your RevenueCat product ID) |
| **Type** | Non-Consumable |
| **Price** | $9.99 |
| **Display Name** | Dotsby+ |
| **Description** | Unlock unlimited babies, forever pattern history, unlimited photos, CSV export, and family sharing. One-time purchase — no subscription. |

---

## Version Information

### Description (4000 chars max)

```
Dotsby is a simple, private baby tracker built for tired parents. Log sleep, feedings, diapers, and pumping in seconds — then see your baby's patterns emerge over time.

ALL YOUR DATA STAYS ON YOUR DEVICE.
No accounts. No cloud. No tracking. Just you and your baby's data, stored securely on your phone.

TRACK EVERYTHING THAT MATTERS

• Sleep — Log naps and nighttime sleep with a built-in timer. Track sleep quality and see how your baby's schedule evolves.

• Feedings — Time nursing sessions with automatic side tracking. Log bottles with volume and type (breast milk or formula). Record solids and flag reactions.

• Diapers — Quick-log wet, dirty, or combo diapers with optional color and consistency notes.

• Pumping — Track output by side with a session timer. See your daily and weekly totals.

SEE THE PATTERNS

Dotsby's signature feature is a visual pattern grid — inspired by GitHub's contribution graph — that shows your baby's daily activity intensity at a glance. Tap any day to see the full breakdown. Spot trends, share with your pediatrician, or just appreciate how much you do every day.

SMART SLEEP SCHEDULE

Wake window predictions based on your baby's age, updated automatically as they grow. Get a gentle reminder 15 minutes before nap time so you're never caught off guard.

MILESTONE PHOTOS

Capture monthly birthday photos and developmental milestones in a dedicated gallery. Never miss a monthly photo with automatic reminders on your baby's month-day.

DESIGNED FOR 3 AM

Monochrome design with full dark mode. Large tap targets. Minimal steps. Haptic feedback so you know your log was saved. Everything about Dotsby is built for one-handed use while holding a baby.

DOTSBY+ (OPTIONAL ONE-TIME PURCHASE)

The free version covers everything most parents need. Upgrade once to unlock:
• Unlimited baby profiles
• Pattern history up to one year
• Unlimited milestone photos
• CSV data export
• Family sharing for up to 6 people

No subscriptions. No recurring charges. Pay once, keep it forever.

Dotsby is made with love for tired parents.
```

### Promotional Text (170 chars max, can be updated without a new version)

```
Track sleep, feedings, diapers & pumping — then watch your baby's patterns emerge. 100% private. No accounts, no cloud. Built for tired parents.
```

### Keywords (100 chars max, comma-separated)

```
baby tracker,sleep log,feeding,nursing,diaper,pumping,newborn,wake window,nap,infant,breastfeeding
```

### What's New (for v1.0)

```
Hello, world! Dotsby's first release.

• Track sleep, feedings, diapers, and pumping
• Visual pattern grid to spot your baby's routines
• Smart wake window predictions by age
• Milestone photo gallery with monthly reminders
• Full dark mode and metric/imperial support
• 100% private — all data stays on your device
```

### Support URL

Set up a simple landing page or GitHub Pages site, e.g.:
`https://dotsby.app/support` or `https://dotsby.app`

### Marketing URL (optional)

`https://dotsby.app`

### Privacy Policy URL (required)

`https://dotsby.app/privacy`

Even though no data leaves the device, Apple requires a privacy policy. A short policy stating that all data is stored locally, no personal data is collected or transmitted, and purchase data is handled by Apple is sufficient.

---

## App Review Information

### Notes for Reviewer

```
Dotsby is a local-first baby tracker. All data is stored on-device using SQLite. There are no user accounts, no login, and no server communication (other than Apple's StoreKit for the optional Dotsby+ in-app purchase).

To test the app:
1. Launch the app — you'll see the onboarding screen.
2. Enter any baby name and birth date, then tap "Continue."
3. You'll land on the Home tab where you can log sleep, feedings, diapers, and pumping.
4. Visit the Patterns tab to see the activity grid.
5. Visit the Photos tab to add milestone photos.
6. Visit Settings to toggle theme and units.

The Dotsby+ in-app purchase unlocks unlimited babies, extended pattern history, unlimited photos, and CSV export. It is a one-time non-consumable purchase.
```

### Demo Account

Not applicable — no accounts or login required.

### Contact Information

Fill in your name, phone number, and email for the review team.

---

## App Store Screenshots

You'll need screenshots for these device sizes (at minimum):

| Device | Resolution | Required? |
|---|---|---|
| iPhone 6.9" (iPhone 16 Pro Max) | 1320 x 2868 | Yes |
| iPhone 6.7" (iPhone 15 Plus/Pro Max) | 1290 x 2796 | Yes |
| iPhone 6.5" (iPhone 11 Pro Max) | 1242 x 2688 | Recommended |
| iPhone 5.5" (iPhone 8 Plus) | 1242 x 2208 | Only if supporting |
| iPad Pro 13" | 2064 x 2752 | Only if iPad app |

### Suggested Screenshot Sequence (up to 10)

1. **Home screen** — Show the quick-log buttons and today's schedule with wake window indicator.
   Caption: *"Track everything in seconds"*

2. **Sleep logging** — The sleep timer running or a completed sleep log.
   Caption: *"Built-in timers for sleep and nursing"*

3. **Feeding logging** — Nursing with side indicator or bottle with volume.
   Caption: *"Nursing timer with side tracking"*

4. **Pattern grid** — The contribution graph with several weeks of data, light mode.
   Caption: *"See your baby's patterns at a glance"*

5. **Pattern grid detail** — Tapped day showing the daily breakdown.
   Caption: *"Tap any day for the full picture"*

6. **Dark mode home** — Same home screen in dark mode.
   Caption: *"Designed for 3 AM"*

7. **Photos tab** — Milestone gallery with a few monthly photos.
   Caption: *"Never miss a monthly milestone"*

8. **Settings / Theme** — Show the clean settings screen with theme and unit toggles.
   Caption: *"Your app, your way"*

9. **Onboarding / Privacy** — The welcome screen showing the privacy message.
   Caption: *"100% private. All data stays on your device."*

10. **Dotsby+ screen** — The premium feature comparison.
    Caption: *"One price. No subscriptions. Ever."*

---

## App Preview Video (optional but recommended)

30-second video showing:
1. Opening the app (1s)
2. Quick-logging a feeding with the nursing timer (5s)
3. Logging a diaper change (3s)
4. Scrolling the home screen schedule (3s)
5. Switching to the Patterns tab and exploring the grid (8s)
6. Tapping a day for detail (3s)
7. Switching to dark mode (3s)
8. End card with tagline: "Dotsby — Simple tracking for tired parents" (4s)

---

## App Store Connect — Checkboxes & Selections Summary

| Setting | Selection |
|---|---|
| **Made for Kids?** | No (select "No" — this avoids Kids category restrictions. The app is for parents, not children.) |
| **Content Rights** | This app does not contain, show, or access third-party content |
| **Export Compliance (HTTPS/encryption)** | No (ITSAppUsesNonExemptEncryption is already `false` in app.json) |
| **Advertising Identifier (IDFA)** | No (unless RevenueCat uses it — check their docs, but typically No for non-ad SDKs) |
| **Government ID Required** | No |
| **License Agreement** | Use Apple's standard EULA (unless you have a custom one) |

---

## Recommended App Store Optimization (ASO) Tips

1. **Subtitle is prime real estate** — "Simple baby tracking" is clear and keyword-rich. Alternatives: "Baby tracker for new parents" or "Private baby tracker."

2. **Keyword strategy** — Focus on terms people actually search. Avoid repeating words from the app name (Apple already indexes them). The keyword set above covers the major search terms.

3. **Screenshots sell the app** — The pattern grid is your most unique visual. Make it screenshot #1 or #2. Dark mode screenshots stand out in the App Store.

4. **Promotional text** — This can be updated anytime without a review. Use it to highlight seasonal relevance or new features.

5. **Ratings prompt** — Consider adding an in-app rating prompt (SKStoreReviewController / expo-store-review) after a user has logged ~20 activities. Happy, engaged parents leave good reviews.
