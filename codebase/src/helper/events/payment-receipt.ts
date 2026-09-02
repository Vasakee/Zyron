export type PaymentReceiptEvent = {
  // Payment details
  currency: string;
  receiptId: string;
  paymentMethodBrand?: string;
  paymentMethodLast4?: string;
  
  // Billing details
  billedToName?: string;
  billedToEmail?: string;
  clientName?: string;
  date: string | Date;
  time?: string | Date;
  
  // Order details
  testType: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount?: number;
  promotionCode?: string;
  total: number;
  amountPaid: number;
};


