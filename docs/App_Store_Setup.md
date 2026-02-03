# App Store & In-App Purchase Setup Guide

This guide covers everything needed to configure in-app purchases for Dotsby using RevenueCat.

## 1. Apple Developer Account

1. Enroll at [developer.apple.com](https://developer.apple.com/programs/) ($99/year)
2. Accept all agreements in **App Store Connect > Agreements, Tax, and Banking**
3. Complete the **Paid Applications** agreement (required for IAP)

## 2. App Store Connect — App Creation

1. Go to [App Store Connect](https://appstoreconnect.apple.com/) > My Apps > (+)
2. Create a new app:
   - **Platform**: iOS
   - **Name**: Dotsby
   - **Bundle ID**: `com.dotsby.app`
   - **SKU**: `dotsby`
   - **Primary Language**: English (US)

## 3. In-App Purchase Product

1. In your app, go to **Monetization > In-App Purchases** > (+)
2. Create a **Non-Consumable** product:
   - **Reference Name**: Dotsby+ Premium
   - **Product ID**: `com.dotsby.premium`
   - **Price**: $9.99 (Tier 10)
   - **Display Name**: Dotsby+
   - **Description**: Unlock unlimited baby profiles, full pattern history, unlimited photo storage, CSV export, and more.
3. Add a **Review Screenshot** (screenshot of the premium purchase screen)
4. Set **Family Sharing** to enabled
5. Submit for review (status must be "Ready to Submit" or "Approved")

## 4. RevenueCat Setup

### Create Project

1. Sign up at [app.revenuecat.com](https://app.revenuecat.com/)
2. Create a new project: **Dotsby**
3. Add an **Apple App Store** app:
   - **App name**: Dotsby
   - **Bundle ID**: `com.dotsby.app`
   - **App Store Connect App-Specific Shared Secret**: Generate in App Store Connect under your app > General > App Information > App-Specific Shared Secret

### Configure Products

1. Go to **Products** and add:
   - **Identifier**: `com.dotsby.premium`
   - **App**: Dotsby (Apple App Store)

### Configure Entitlements

1. Go to **Entitlements** and create:
   - **Identifier**: `premium`
   - Attach product `com.dotsby.premium`

### Configure Offerings

1. Go to **Offerings** and create:
   - **Identifier**: `default`
   - Add a **Lifetime** package with product `com.dotsby.premium`

### Get API Key

1. Go to **API Keys** in your project settings
2. Copy the **Apple** public API key
3. Replace `YOUR_REVENUECAT_IOS_API_KEY` in `src/services/purchases.ts`

## 5. Sandbox Testing

### Prerequisites

- A **development build** (not Expo Go — native modules required)
- Build with: `eas build --profile development --platform ios`

### Create Sandbox Tester

1. In App Store Connect, go to **Users and Access > Sandbox > Testers**
2. Create a sandbox Apple ID (use a unique email, can be fake)
3. On your test device: **Settings > App Store > Sandbox Account** — sign in with the sandbox tester

### Test Purchase Flow

1. Install the development build on a simulator or device
2. Navigate to the premium screen
3. Tap "Unlock Dotsby+" — the StoreKit purchase sheet should appear
4. Complete with sandbox credentials
5. Verify `hasUnlockedPremium` becomes `true`
6. Kill and relaunch the app — verify entitlement persists
7. Test "Restore Purchases" on a fresh install with the same sandbox account

### StoreKit Configuration File (Optional)

For faster local testing without a network, create a StoreKit Configuration file in Xcode:
1. Open the `.xcworkspace` in `ios/`
2. File > New > File > StoreKit Configuration File
3. Add a non-consumable product matching `com.dotsby.premium`
4. Edit the scheme to use this configuration for testing

## 6. Production Submission Checklist

- [ ] IAP product status is "Ready to Submit" in App Store Connect
- [ ] RevenueCat API key replaced in `src/services/purchases.ts` (not the sandbox key)
- [ ] App binary includes the IAP capability (handled by `react-native-purchases` config plugin)
- [ ] Premium screen screenshot included in IAP review information
- [ ] App review notes mention the IAP and how to test it
- [ ] Privacy policy URL set in App Store Connect (required for IAP)
- [ ] `ITSAppUsesNonExemptEncryption` is `false` in `app.json` (already set)
- [ ] Family Sharing enabled on the IAP product
- [ ] Tested full purchase + restore flow in sandbox

## 7. Google Play Setup (Future)

When adding Android support:

1. **Google Play Console**: Create app, set up a **one-time product** with ID `com.dotsby.premium`
2. **RevenueCat**: Add a Google Play Store app, upload the Play service credentials JSON
3. **API Key**: Copy the Google public API key, replace `YOUR_REVENUECAT_ANDROID_API_KEY` in `src/services/purchases.ts`
4. **Testing**: Use Google Play license testers for sandbox purchases

The `react-native-purchases` SDK and the service code already handle both platforms — only API keys and store configuration are needed.
