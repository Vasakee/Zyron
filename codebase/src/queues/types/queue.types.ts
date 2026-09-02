import Stripe from 'stripe';

export enum QueueNames {
  TEST = 'test',
  STRIPE = 'stripe',
  HEALTH = 'health',
  BILLING = 'billing',
  BILLING_ACCESS = 'billing-access',
  KIT = 'kit',
  MAIL = 'mail',
}

export enum JobTypes {
  TEST_REPORT = 'test-report',
  UPSERT_CHECKOUT_SESSIONS = 'upsert-checkout-sessions',
  ENRICH_TRANSACTIONS_FROM_SESSIONS = 'enrich-transactions-from-sessions',
  HEALTH_INFO_SYNC = 'health-info-sync',
  RECONCILE_PROCESSING = 'reconcile-processing',
  PROCESS_PAYMENT_METHOD = 'process-payment-method',
  PROCESS_INVOICE_PAYMENT = 'process-invoice-payment',
  PROCESS_BILLING_ACCESS_FILE = 'process-billing-access-file',
  FIX_ORDER_PAYMENT_URLS = 'fix-order-payment-urls',
  SYNC_STRIPE_PRICES = 'sync-stripe-prices',
  AUTO_REGISTER_PRACTITIONER_ORDER_KITS = 'auto-register-practitioner-order-kits',
  HEALTH_INFORMATION_DISPATCH = 'health-information-dispatch',
}

export interface UpsertCheckoutSessionsJobData {
  createdFrom?: number;
  createdTo?: number;
  batchSize?: number;
}

export interface EnrichTransactionsJobData {
  batchSize?: number;
}

export type JobData =
  | TestReportJobData
  | UpsertCheckoutSessionsJobData
  | EnrichTransactionsJobData
  | HealthInfoSyncJobData
  | ProcessPaymentMethodJobData
  | ProcessInvoicePaymentJobData
  | BillingAccessJobData
  | SyncStripePricesJobData
  | AutoRegisterPractitionerOrderKitsJobData
  | HealthInformationDispatchJobData;

export interface TestReportJobData {
  testId: string;
  name: string;
}

export interface HealthInfoSyncJobData {
  batchSize?: number;
  concurrency?: number;
}

export interface ProcessPaymentMethodJobData {
  sessionId: string;
  paymentMethodId: string;
  referenceId: string;
  userId: string;
  stripeCustomerId: string;
}

export interface BillingAccessJobData {
  emails: string[];
  enable?: boolean;
  requestedBy?: string | null;
}

export interface ProcessInvoicePaymentJobData {
  invoice: Stripe.Invoice;
}

export interface FixOrderPaymentUrlsJobData {
  batchSize?: number;
}

export interface SyncStripePricesJobData {
  priceIds?: string[];
}

export interface AutoRegisterPractitionerOrderKitsJobData {
  orderId: string;
  kitId: string;
}

export interface HealthInformationDispatchJobData {
  logId: string;
}
