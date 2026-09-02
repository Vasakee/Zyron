import { AllowedCountries, AllowedCountriesAbbrev, Currency } from 'src/enum';

export function getCurrencyFromCountry(country: string): Currency {
  if (
    country === AllowedCountries.CA ||
    country === AllowedCountriesAbbrev.CA
  ) {
    return Currency.CAD;
  }

  return Currency.USD;
}

export interface AmountWithActual {
  amount: number; // amount in cents
  actualAmount: number; // amount in actual currency units
  currency: Currency;
}

/**
 * Validates that an amount is a valid number for financial calculations
 * @param amount - The amount to validate
 * @returns true if valid, false otherwise
 */
function isValidAmount(amount: number): boolean {
  return (
    typeof amount === 'number' &&
    !isNaN(amount) &&
    isFinite(amount) &&
    amount >= 0
  );
}

/**
 * Converts an amount from cents to a standardized format with both cents and actual currency values
 * @param amountInCents - The amount in cents (e.g., from amountTotal, unitAmount stored as bigint)
 * @param currency - The currency type
 * @returns Object containing amount in cents, actual amount, and currency
 * @throws Error if amount is invalid (negative, NaN, or Infinity)
 */
export function fromCents(
  amountInCents: number,
  currency: Currency,
): AmountWithActual {
  if (!isValidAmount(amountInCents)) {
    throw new Error(
      `Invalid amount: ${amountInCents}. Amount must be a positive finite number.`,
    );
  }

  return {
    amount: amountInCents,
    actualAmount: amountInCents / 100,
    currency,
  };
}

/**
 * Converts an actual amount (in currency units) to a standardized format with both cents and actual currency values
 * @param actualAmount - The amount in actual currency units (e.g., 10.50 for $10.50)
 * @param currency - The currency type
 * @returns Object containing amount in cents, actual amount, and currency
 * @throws Error if amount is invalid (negative, NaN, or Infinity)
 */
export function toCents(
  actualAmount: number,
  currency: Currency,
): AmountWithActual {
  if (!isValidAmount(actualAmount)) {
    throw new Error(
      `Invalid amount: ${actualAmount}. Amount must be a positive finite number.`,
    );
  }

  return {
    amount: Math.round(actualAmount * 100),
    actualAmount,
    currency,
  };
}

// Legacy aliases for backward compatibility
export const normalizeAmount = fromCents;
export const normalizeActualAmount = toCents;
