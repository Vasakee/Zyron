/**
 * Check if the error is a unique constraint violation in MSSQL.
 * 2627: Unique constraint violation
 * 2601: Unique index violation
 */
export function isUniqueViolation(err: any): boolean {
  return err?.number === 2627 || err?.number === 2601;
}
