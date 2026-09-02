/**
 * UUID v4 validation regex
 */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4
 * @param value - The string to validate
 * @returns true if the value is a valid UUID, false otherwise
 */
export function isUUID(value: string): boolean {
  if (!value) return false;
  return UUID_REGEX.test(value);
}
