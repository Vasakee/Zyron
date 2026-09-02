export type ChargeType = {
  id: string;
  object: string;
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  application: string | null;
  application_fee: string | null;
  application_fee_amount: string | null;
  balance_transaction: string;
  billing_details: BillingDetailsType;
  calculated_statement_descriptor: string;
  captured: boolean;
  created: number;
  currency: string;
  customer: string | null;
  description: string | null;
  destination: string | null;
  dispute: string | null;
  disputed: boolean;
  failure_balance_transaction: string | null;
  failure_code: string | null;
  failure_message: string | null;
  fraud_details: FraudDetailsType;
  invoice: string | null;
  livemode: boolean;
  metadata: MetadataType;
  on_behalf_of: string | null;
  order: string | null;
  outcome: OutcomeType;
  paid: boolean;
  payment_intent: string;
  payment_method: string;
  payment_method_details: PaymentMethodDetailsType;
  radar_options: RadarOptionsType;
  receipt_email: string;
  receipt_number: string | null;
  receipt_url: string;
  refunded: boolean;
  refunds: RefundsType;
  review: string | null;
  shipping: string | null;
  source: string | null;
  source_transfer: string | null;
  statement_descriptor: string | null;
  statement_descriptor_suffix: string | null;
  status: string;
  transfer_data: string | null;
  transfer_group: string | null;
};

export type BillingDetailsType = {
  address: AddressType;
  email: string;
  name: string;
  phone: string;
};

export type AddressType = {
  city: string;
  country: string;
  line1: string;
  line2: string;
  postal_code: string;
  state: string;
};

export type FraudDetailsType = {
  [key: string]: any;
};

export type MetadataType = {
  [key: string]: any;
};

export type OutcomeType = {
  network_status: string;
  reason: string;
  risk_level: string;
  risk_score: number;
  seller_message: string;
  type: string;
};

export type PaymentMethodDetailsType = {
  card: CardType;
  type: string;
};

export type CardType = {
  brand: string;
  checks: ChecksType;
  country: string;
  exp_month: number;
  exp_year: number;
  fingerprint: string;
  funding: string;
  last4: string;
  network: string;
  three_d_secure: ThreeDSecureType;
  wallet: WalletType;
};

export type ChecksType = {
  address_line1_check: string | null;
  address_postal_code_check: string | null;
  cvc_check: string | null;
};

export type ThreeDSecureType = {
  authenticated: boolean;
  succeeded: boolean;
  version: string;
};

export type WalletType = {
  [key: string]: any;
};

export type RadarOptionsType = {
  [key: string]: any;
};

export type RefundsType = {
  object: string;
  data: RefundType[];
  has_more: boolean;
  total_count: number;
  url: string;
};

export type RefundType = {
  id: string;
  object: string;
  amount: number;
  balance_transaction: string;
  charge: string;
  created: number;
  currency: string;
  metadata: MetadataType;
  reason: string | null;
  receipt_number: string | null;
  source_transfer_reversal: string | null;
  status: string;
  transfer_reversal: string | null;
};
