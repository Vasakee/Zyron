import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as path from 'path';
import { promises as fs } from 'fs';
import Stripe from 'stripe';
import { DateTime } from 'luxon';
import { SYSTEM_TIME_ZONE } from 'src/config';
import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';
import { KitType } from 'src/enum';
import { ConfigService } from '@nestjs/config';

export interface InvoiceLineItem {
  testType?: string | null;
  client?: string | null;
  orderType?: string | null;
  qty: number;
  unitPrice: string;
  amount: string;
  dateRange?: string | null;
  createdAt?: string | null;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate?: string;
  issueDate: string;
  status?: 'paid' | 'pending' | 'failed';
  statusText?: string;
  billedToName?: string;
  billedToEmail?: string;
  billToName?: string;
  billToEmail?: string;
  clientName?: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items?: Array<{
    description: string;
    details?: string;
    quantity: number;
    unitPrice: string;
    amount: string;
  }>;
  lineItems: InvoiceLineItem[];
  subtotal: string;
  discount?: string;
  discountCode?: string | null;
  promotionCode?: string;
  tax?: string;
  total: string;
  amountPaid?: string;
  amountDue?: string;
  dueDate?: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    date?: string;
    transactionId?: string;
  };
  notes?: string;
  currentYear?: string;
  [k: string]: any;
}

@Injectable()
export class PdfGeneratorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PdfGeneratorService.name);

  private browser: puppeteer.Browser | null = null;
  private templateCache = new Map<string, handlebars.TemplateDelegate>();
  private readonly templateRoot: string;
  private readonly puppeteerLaunchOptions: puppeteer.LaunchOptions;

  constructor(
    @InjectRepository(PaymentStatementItem)
    private readonly paymentStatementItemRepository: Repository<PaymentStatementItem>,
    private readonly configService: ConfigService,
  ) {
    this.templateRoot =
      this.configService.get<string>('TEMPLATE_ROOT') ||
      path.resolve(process.cwd(), 'src', 'templates', 'emails');

    const defaultArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
    this.puppeteerLaunchOptions = {
      headless: this.configService.get<boolean>('PUPPETEER_HEADLESS', true),
      args: this.configService.get<string[]>('PUPPETEER_ARGS', defaultArgs),
      ...(this.configService.get<string>('PUPPETEER_EXECUTABLE_PATH')
        ? {
          executablePath: this.configService.get<string>(
            'PUPPETEER_EXECUTABLE_PATH',
          ),
        }
        : {}),
    };
  }

  async onModuleInit(): Promise<void> {
    this.registerHandlebarsHelpers();

    // Skip template precompilation and Puppeteer launch to avoid blocking server startup
    // Both will happen on-demand when first PDF is generated
    this.logger.log(
      'PdfGeneratorService initialized - template and browser will load on-demand',
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (err) {
        this.logger.error(
          'Error closing Puppeteer browser on shutdown',
          err as Error,
        );
      } finally {
        this.browser = null;
      }
    }
  }

  private registerHandlebarsHelpers() {
    if ((handlebars as any).__pdf_helpers_registered) return;
    handlebars.registerHelper('toJson', function (context: any) {
      const safe = JSON.stringify(context).replace(/</g, '\\u003c');
      return new handlebars.SafeString(safe);
    });
    (handlebars as any).__pdf_helpers_registered = true;
  }

  private async precompileTemplate(templateName: string): Promise<void> {
    const templatePath = path.resolve(this.templateRoot, templateName);
    try {
      const html = await fs.readFile(templatePath, { encoding: 'utf8' });
      const compiled = handlebars.compile(html);
      this.templateCache.set(templateName, compiled);
    } catch (err) {
      this.logger.debug(
        `Template ${templateName} not precompiled: ${(err as Error).message}`,
      );
    }
  }

  private async readAndCompileTemplate(
    templateName: string,
  ): Promise<handlebars.TemplateDelegate> {
    const cached = this.templateCache.get(templateName);
    if (cached) return cached;

    const templatePath = path.resolve(this.templateRoot, templateName);
    const html = await fs.readFile(templatePath, { encoding: 'utf8' });
    const compiled = handlebars.compile(html);
    this.templateCache.set(templateName, compiled);
    return compiled;
  }

  private async ensureBrowser(): Promise<puppeteer.Browser> {
    if (this.browser && this.browser.isConnected()) return this.browser;

    this.browser = await puppeteer.launch(this.puppeteerLaunchOptions);
    return this.browser;
  }

  private formatCurrencyFromCents(
    amountInCents: number,
    currency: 'USD' | 'CAD' = 'USD',
  ): string {
    const dollars = amountInCents / 100;

    // Determine locale based on currency
    const locale = currency === 'CAD' ? 'en-CA' : 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(dollars);
  }

  private formatInvoicePeriodFromSeconds(timestampInSeconds: number): string {
    return DateTime.fromSeconds(timestampInSeconds)
      .setZone(SYSTEM_TIME_ZONE || 'America/New_York')
      .toFormat('LLL yyyy');
  }

  private formatDateFromSeconds(timestampInSeconds: number): string {
    return DateTime.fromSeconds(timestampInSeconds)
      .setZone(SYSTEM_TIME_ZONE || 'America/New_York')
      .toFormat('MMMM d, yyyy');
  }

  private async renderTemplate(
    templateName: string,
    data: any,
  ): Promise<string> {
    const template = await this.readAndCompileTemplate(templateName);
    return template(data);
  }

  async generateInvoicePdf(
    invoiceData: InvoiceData,
    opts?: { waitForSelector?: string },
  ): Promise<Buffer> {
    let page: puppeteer.Page | null = null;
    try {
      const browser = await this.ensureBrowser();
      page = await browser.newPage();

      const html = await this.renderTemplate('custom_invoice.html', {
        data: invoiceData,
      });

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Wait for the pages container to be present first
      await page.waitForSelector('#pages-container', { timeout: 3000 });

      // Add some debug logging
      const debugInfo = await page.evaluate(() => {
        const container = document.getElementById('pages-container');
        const invoiceScript = document.getElementById('invoice-data');
        return {
          containerExists: !!container,
          scriptExists: !!invoiceScript,
          scriptContent: invoiceScript
            ? invoiceScript.textContent?.substring(0, 200)
            : null,
          hasError: document.body.textContent?.includes('error') || false,
        };
      });

      this.logger.debug('Template debug info:', debugInfo);

      // Try to wait for content, but don't fail if timeout
      try {
        await page.waitForFunction(
          () => {
            const container = document.getElementById('pages-container');
            return (
              container &&
              (container.children.length > 0 ||
                container.dataset.pdfReady === '1')
            );
          },
          { timeout: 8000 },
        );
      } catch (timeoutError) {
        this.logger.warn(
          'Template rendering timeout, proceeding with PDF generation',
        );
        // Just wait a bit more for any async rendering
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate PDF', error as Error);
      throw error;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (err) {
          this.logger.debug(
            'Error closing page after PDF generation',
            err as Error,
          );
        }
      }
    }
  }

  async generateCustomInvoicePdf(
    stripeInvoice: Stripe.Invoice,
  ): Promise<Buffer> {
    // Transform Stripe invoice data to our custom format
    const invoiceData = await this.transformStripeInvoiceData(stripeInvoice);
    return this.generateInvoicePdf(invoiceData);
  }

  private async transformStripeInvoiceData(
    stripeInvoice: Stripe.Invoice,
  ): Promise<InvoiceData> {
    const rawLines = stripeInvoice.lines?.data || [];

    const mapped = await Promise.all(
      rawLines.map(async (line): Promise<InvoiceLineItem | null> => {
        const paymentStatementItemId = line.metadata?.payment_statement_item_id;
        if (!paymentStatementItemId) return null;

        const paymentStatementItem =
          await this.paymentStatementItemRepository.findOne({
            where: { id: paymentStatementItemId },
            relations: ['order'],
          });

        if (!paymentStatementItem) return null;

        let testType: string | null = null;
        switch (paymentStatementItem.order?.kitType) {
          case KitType.DeepGut:
            testType = 'DeepGut';
            break;
          case KitType.DeepGutPlus:
            testType = 'DeepGut Plus';
            break;
          case KitType.GutScan:
            testType = 'GutScan';
            break;
          default:
            testType = null;
        }

        const unitAmount = (line.price?.unit_amount ?? 0) as number;
        const lineAmount = (line.amount ?? 0) as number;
        const currencyRaw = line.price?.currency;
        const currency = (currencyRaw ? currencyRaw.toUpperCase() : 'USD') as
          | 'USD'
          | 'CAD';
        return {
          testType,
          client: paymentStatementItem.clientName ?? null,
          orderType: paymentStatementItem.order?.orderType ?? null,
          qty: (line.quantity ?? 1) as number,
          unitPrice: this.formatCurrencyFromCents(unitAmount, currency),
          amount: this.formatCurrencyFromCents(lineAmount, currency),
          dateRange: stripeInvoice.created
            ? this.formatInvoicePeriodFromSeconds(Number(stripeInvoice.created))
            : null,
          createdAt:
            line.metadata?.createdAt ||
            (stripeInvoice.created
              ? DateTime.fromSeconds(Number(stripeInvoice.created))
                .setZone(SYSTEM_TIME_ZONE || 'America/New_York')
                .toFormat('yyyy-LL-dd hh:mm a ZZZZ')
              : null),
        };
      }),
    );

    const lineItems = mapped.filter(Boolean) as InvoiceLineItem[];

    const customer: any =
      typeof stripeInvoice.customer === 'object'
        ? stripeInvoice.customer
        : null;
    const billToName =
      stripeInvoice.customer_name ||
      `${customer?.metadata?.firstName || ''} ${customer?.metadata?.lastName || ''
        }`.trim() ||
      'Customer';

    const billToEmail = stripeInvoice.customer_email || customer?.email || '';

    const currency = stripeInvoice.currency.toUpperCase() as 'USD' | 'CAD';
    const subtotalCents = Number(stripeInvoice.subtotal ?? 0);
    const totalCents = Number(stripeInvoice.total ?? 0);
    const amountPaidCents = Number(stripeInvoice.amount_paid ?? 0);
    const discountAmount = Number(
      stripeInvoice.total_discount_amounts?.[0]?.amount ?? 0,
    );

    return {
      invoiceNumber: stripeInvoice.number || stripeInvoice.id,
      issueDate: stripeInvoice.created
        ? this.formatDateFromSeconds(Number(stripeInvoice.created))
        : '',
      dueDate: stripeInvoice.due_date
        ? this.formatDateFromSeconds(Number(stripeInvoice.due_date))
        : undefined,
      billToName,
      billToEmail,
      lineItems,
      subtotal: this.formatCurrencyFromCents(subtotalCents, currency),
      discount:
        discountAmount > 0
          ? `-${this.formatCurrencyFromCents(discountAmount, currency)}`
          : this.formatCurrencyFromCents(0, currency),
      discountCode:
        stripeInvoice.discount?.promotion_code &&
          typeof stripeInvoice.discount.promotion_code === 'object'
          ? stripeInvoice.discount.promotion_code.code
          : null,
      total: this.formatCurrencyFromCents(totalCents, currency),
      amountPaid: this.formatCurrencyFromCents(
        amountPaidCents ?? totalCents,
        currency,
      ),
      currentYear: DateTime.local()
        .setZone(SYSTEM_TIME_ZONE || 'America/New_York')
        .toFormat('yyyy'),
    };
  }
}
