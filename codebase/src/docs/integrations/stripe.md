# Integration: Stripe

## Source of truth
- Controllers: `src/payment/controllers/payment.controller.ts`
- Stripe services: `src/payment/services/stripe/*`
- Entities: `src/payment/entity/*`

## Usage
- Webhook endpoint: `POST /api/v1/payment/webhook`
- Payment method operations: `src/payment/services/*` and Stripe helpers

## Required env vars
- `STRIPE_API_KEY`
- `STRIPE_WEBHOOK_HASH`
- Price IDs: `STRIPE_USD_*`, `STRIPE_CAD_*` (see `src/config/keys.ts`)

## Notes
- Webhook signature is validated in payment webhook service.
