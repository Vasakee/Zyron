/**
 * Check if a payment card has expired
 * @param expMonth - The expiration month (1-12)
 * @param expYear - The expiration year (full year, e.g., 2025)
 * @returns true if the card has expired, false otherwise
 */
export function isCardExpired(expMonth: number, expYear: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

  // Card is expired if:
  // 1. The expiration year is before the current year
  // 2. The expiration year equals current year AND the expiration month is before current month
  if (expYear < currentYear) {
    return true;
  }

  if (expYear === currentYear && expMonth < currentMonth) {
    return true;
  }

  return false;
}

/**
 * Parse card metadata from PaymentMethod entity
 * @param metadata - The JSON string containing card metadata
 * @returns Parsed metadata object with card details
 */
export function parseCardMetadata(metadata: string): {
  name: string;
  brand: string;
  last_four: string;
  exp_month: number;
  exp_year: number;
} | null {
  try {
    return JSON.parse(metadata);
  } catch (error) {
    return null;
  }
}
