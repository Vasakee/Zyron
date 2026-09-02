export function slugifyText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '');
}

export function slugToTitle(input: string): string {
  return input
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function capitalizeString(str: string | null | undefined): string {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export * from './response';
export * from './authentication';
export * from './file-processing.utils';
export * from './payment-validation';
export * from './currency-helper';
