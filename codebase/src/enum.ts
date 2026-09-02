export enum AccountRoles {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super-admin',
  PRACTITIONER = 'practitioner',
  USER = 'user',
  CLIENT = 'client',
}

export enum PractitionerStatus {
  INREVIEW = 'in-review',
  ACCEPTED = 'accepted',
  DECLINED = 'rejected',
}
export enum TypesOfKits {
  CLIENTS = 'client',
  PRACTITIONER = 'practitioner',
  FAMILY = 'family',
}
export enum KitStatus {
  REGISTERED = 'registered',
  AWAITNG_SAMPLE = 'awaiting-sample',
  AWAITNG_RESULT = 'awaiting-result',
  RESULT_READY = 'result-ready',
  ISSUED = 'Issued',
  LAB_PROCESSING = 'lab-processing',
  SAMPLE_RECIEVED = 'sample-received',
}

export enum Strategy {
  NORMAL = 'normal',
  GOOGLE = 'google',
}

export enum IdentifierType {
  TOKEN = 'token',
  ID = 'id',
}

export enum LockStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
}

export enum OrderRegistrationStatus {
  YES = 'yes',
  NO = 'no',
}

export enum DeliveryStatus {
  YES = 'yes',
  NO = 'no',
}

export enum PractitionerAccountStatus {
  Approved = 'approved',
  UnderReview = 'under-review',
  Rejected = 'rejected',
}

export enum InquiryStatus {
  PENDING = 'pending',
  OPEN = 'open',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum InquiryPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum ResourceTypes {
  VIDEO = 'video',
  DOCUMENT = 'document',
  PPT = 'ppt',
  PDF = 'pdf',
}

export enum PractitionerAccessStatus {
  GRANTED = 'granted',
  DECLINED = 'declined',
}

export enum PasswordUpdateStatus {
  Pending = 'pending',
  Completed = 'completed',
}

export enum TransactionStatus {
  Pending = 'pending',
  Successful = 'successful',
  Failed = 'failed',
}

export enum SessionStatus {
  Succeeded = 'succeeded',
  Failed = 'failed',
  Pending = 'pending',
  Canceled = 'canceled',
  Processing = 'processing',
}

export enum PaymentGateway {
  Stripe = 'stripe',
}

export enum PaymentType {
  Subscription = 'subscription',
  Pay = 'pay',
}

export enum OrderPaymentType {
  PLATFORM_ORDER = 'PLATFORM_ORDER',
  WEBSITE_ORDER = 'WEBSITE_ORDER',
  KIT_REPLACEMENT_ORDER = 'KIT_REPLACEMENT_ORDER',
}

export enum ReplacementKitTargetType {
  PRACTITIONER = 'PRACTITIONER',
  CLIENT = 'CLIENT',
}

export enum ReplacementKitStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum ReplacementKitType {
  GutScan = 'gut-scan',
  DeepGut = 'deep-gut',
  DeepGutPlus = 'deep-gut-plus',
}

export enum AdminPermissions {
  DASHBOARD = 'dashboard',
  PRACTITIONER_INFO = 'practitioner-info',
  CREATE_A_CLIENT = 'create-a-client',
  CUSTOMER_INQUIRY = 'customer-inquiry',
  USER_CENTER = 'user-center',
  ORDERS = 'orders',
  INVOICES = 'invoices',
  VIEW_REPORTS = 'view-reports',
  VAARI = 'vaari',
}

export enum ShippingStatus {
  Pending = 'pending',
  Paid = 'paid',
  Shipped = 'shipped',
}

export enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Shipped = 'shipped',
  PaymentPending = 'payment-pending',
  PendingInvoice = 'pending-invoice',
  PartialPayment = 'partial-payment',
  PaymentFailed = 'payment-failed',
  Cancelled = 'cancelled',
}

export enum Source {
  Platform = 'platform',
  Website = 'website',
  Waitlist = 'waitlist',
  Elyxium = 'elyxium',
}

export enum PaymentMethodType {
  Card = 'card',
}

export enum PaymentAction {
  PaymentMethod = 'payment-method',
  PaymentLink = 'payment-link',
}

export enum AllowedCountries {
  US = 'United States',
  CA = 'Canada',
}

export enum AllowedCountriesAbbrev {
  US = 'US',
  CA = 'CA',
}

export enum AccountStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum MailQueueTypes {
  SendMail = 'send-mail',
  SendMailWithTemplate = 'sand-mail-via-template',
  SendInitialSupportMail = 'send-initial-support-mail',
  SendSupportMail = 'send-support-mail',
}

export enum SupoortMailStatus {
  PENDING = 'pending',
  SENT = 'sent',
}

export enum SenderType {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export enum ClientType {
  PRACTITIONER = 'practitioner',
  CUSTOMER = 'customer',
}

export enum TransferStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  AWAITNG_TRANSFER = 'awaiting-transfer',
  COMPLETED = 'completed',
}

export enum WaitlistStatus {
  Pending = 'pending',
  Paid = 'paid',
}

export enum KitType {
  GutScan = 'gut-scan',
  DeepGut = 'deep-gut',
  DeepGutPlus = 'deep-gut-plus',
}

export enum HealthInfoStatus {
  YES = 'yes',
  NO = 'no',
}

export enum PaymentStatementInterval {
  Monthly = 'monthly',
  Yearly = 'yearly',
}

export enum PaymentStatementQueryStatus {
  Paid = 'paid',
  Unpaid = 'unpaid',
}

export enum PaymentStatementStatus {
  Open = 'open',
  Finalized = 'finalized',
  Paid = 'paid',
  Processing = 'processing',
  PaymentFailed = 'payment_failed',
}

export enum CacheKeys {
  QuestionnaireResponse = 'questionnaire-response',
  VaariAnalysis = 'vaari-analysis',
}

export enum CustomerProfileStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  REPROCESSED = 'reprocessed',
  DELETED = 'deleted',
}

export enum InvoicingMode {
  EOM = 'eom',
  Immediate = 'immediate',
}

export enum Currency {
  USD = 'usd',
  CAD = 'cad',
}

export enum CheckoutMode {
  Payment = 'payment',
  Subscription = 'subscription',
}

export enum OrderType {
  PayAsYouGo = 'pay_as_you_go',
  MonthlyBilling = 'monthly-billing',
  KitOnSite = 'kit_on_site',
}

export enum ProfileCreatorRole {
  ADMIN = 'admin',
  PRACTITIONER = 'practitioner',
}

export enum StripeInvoiceStatus {
  OPEN = 'open',
  DRAFT = 'draft',
  PAID = 'paid',
  UNCOLLECTIBLE = 'uncollectible',
  VOID = 'void',
}

export enum DispatchStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum ValidKitStatus {
  Registered = 'Registered',
  Issued = 'Issued',
}

export enum DeliveryMode {
  DROPSHIP = 'dropship',
  ON_SITE = 'on_site',
}
export enum RegistrationSource {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}
