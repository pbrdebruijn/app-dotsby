// Conversion constants
const OZ_TO_ML = 29.5735;
const ML_TO_OZ = 1 / OZ_TO_ML;

/**
 * Convert ounces to milliliters
 */
export function ozToMl(oz: number): number {
  return oz * OZ_TO_ML;
}

/**
 * Convert milliliters to ounces
 */
export function mlToOz(ml: number): number {
  return ml * ML_TO_OZ;
}

/**
 * Format a volume value with the appropriate unit
 * @param oz - The value in ounces (stored value)
 * @param useMetric - Whether to display in metric units
 * @param decimals - Number of decimal places
 */
export function formatVolume(oz: number, useMetric: boolean, decimals: number = 1): string {
  if (useMetric) {
    const ml = ozToMl(oz);
    return `${ml.toFixed(decimals)} ml`;
  }
  return `${oz.toFixed(decimals)} oz`;
}

/**
 * Get the unit label
 */
export function getVolumeUnit(useMetric: boolean): string {
  return useMetric ? 'ml' : 'oz';
}

/**
 * Convert display value to storage value (oz)
 * @param value - The display value
 * @param useMetric - Whether the display value is in metric
 */
export function toStorageValue(value: number, useMetric: boolean): number {
  if (useMetric) {
    return mlToOz(value);
  }
  return value;
}

/**
 * Convert storage value (oz) to display value
 * @param oz - The stored value in ounces
 * @param useMetric - Whether to display in metric
 */
export function toDisplayValue(oz: number, useMetric: boolean): number {
  if (useMetric) {
    return ozToMl(oz);
  }
  return oz;
}
