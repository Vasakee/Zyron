import Stripe from 'stripe';

export interface Session extends Stripe.Checkout.Session {
  shipping: {
    address: Stripe.Address;
    carrier: string | null;
    name: string;
    phone: string | null;
    tracking_number: string | null;
  };
}


export interface SessionListOptions {
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
  createdFrom?: number;
  createdTo?: number;
}