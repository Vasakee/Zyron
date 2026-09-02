import * as csv from 'csvtojson';
import * as XLSX from 'xlsx';

export class FileProcessingUtils {
  private static readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

  /**
   * Normalize and validate an email address
   * @param email - The email string to normalize
   * @returns Normalized email or null if invalid
   */
  static normalizeEmail(email?: string | null): string | null {
    if (!email) {
      return null;
    }
    const trimmed = email.trim().toLowerCase();
    return this.emailRegex.test(trimmed) ? trimmed : null;
  }

  /**
   * Extract emails from CSV content
   * @param content - CSV content as string
   * @returns Array of normalized email addresses
   */
  static async extractEmailsFromCsv(content: string): Promise<string[]> {
    const rows = await csv({
      output: 'csv',
      trim: true,
    }).fromString(content);

    const emails: string[] = [];
    for (const row of rows) {
      if (!Array.isArray(row) || !row.length) {
        continue;
      }
      const email = this.normalizeEmail(row[0]);
      if (email) {
        emails.push(email);
      }
    }
    return emails;
  }

  /**
   * Extract emails from Excel/XLSX content
   * @param buffer - File buffer
   * @returns Array of normalized email addresses
   */
  static extractEmailsFromSpreadsheet(buffer: Buffer): string[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const [firstSheet] = workbook.SheetNames;

    if (!firstSheet) {
      return [];
    }

    const sheet = workbook.Sheets[firstSheet];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: '',
    });

    const emails: string[] = [];
    for (const row of rows) {
      if (!Array.isArray(row) || !row.length) {
        continue;
      }
      const email = this.normalizeEmail(String(row[0]));
      if (email) {
        emails.push(email);
      }
    }
    return emails;
  }

  /**
   * Extract emails from file based on extension
   * @param file - Multer file object
   * @returns Array of normalized email addresses
   */
  static async extractEmailsFromFile(file: Express.Multer.File): Promise<string[]> {
    const extension = (file.originalname?.split('.').pop() || '').toLowerCase();

    if (extension === 'csv') {
      return this.extractEmailsFromCsv(file.buffer.toString('utf-8'));
    }

    if (extension === 'xlsx' || extension === 'xls') {
      return this.extractEmailsFromSpreadsheet(file.buffer);
    }

    throw new Error('Only CSV or XLSX files are supported');
  }

  /**
   * Chunk an array into smaller arrays of specified size
   * @param items - Array to chunk
   * @param size - Size of each chunk
   * @returns Array of chunks
   */
  static chunk<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      result.push(items.slice(i, i + size));
    }
    return result;
  }
}