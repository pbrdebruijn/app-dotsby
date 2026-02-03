import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PurchasesOffering,
} from 'react-native-purchases';

// Replace these with your actual RevenueCat API keys
const REVENUECAT_IOS_API_KEY = 'test_wKArgeetWRrAXaEJIAfkpMOZcTz';
const REVENUECAT_ANDROID_API_KEY = 'test_wKArgeetWRrAXaEJIAfkpMOZcTz';

const ENTITLEMENT_ID = 'premium';

export async function initializePurchases(): Promise<void> {
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  const apiKey =
    Platform.OS === 'ios' ? REVENUECAT_IOS_API_KEY : REVENUECAT_ANDROID_API_KEY;

  Purchases.configure({ apiKey });
}

export async function checkPremiumEntitlement(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

export async function purchasePremium(): Promise<{
  success: boolean;
  cancelled: boolean;
}> {
  try {
    const offerings = await Purchases.getOfferings();
    const premiumPackage = offerings.current?.lifetime;

    if (!premiumPackage) {
      return { success: false, cancelled: false };
    }

    const { customerInfo } = await Purchases.purchasePackage(premiumPackage);
    const isPremium =
      customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    return { success: isPremium, cancelled: false };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, cancelled: true };
    }
    return { success: false, cancelled: false };
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}
