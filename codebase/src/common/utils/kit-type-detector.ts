import { BadRequestErrorException } from 'src/common';
import { KitType } from 'src/enum';

/**
 * Detect kit type from kit number prefix.
 * Rules:
 *  - starts with '00' => DeepGut
 *  - starts with 'VT' => GutScan
 *  - starts with 'DP' => DeepGutPlus
 * Returns the KitType enum value.
 */
export function detectKitTypeFromNumber(kitNumber: string): KitType {
  if (!kitNumber || typeof kitNumber !== 'string') {
    throw new BadRequestErrorException('Invalid Kit ID');
  }

  const normalized = kitNumber.trim().toUpperCase();

  if (normalized.startsWith('00')) return KitType.DeepGut;
  if (normalized.startsWith('VT')) return KitType.GutScan;
  if (normalized.startsWith('DP')) return KitType.DeepGutPlus;

  throw new BadRequestErrorException('Invalid Kit ID');
}
