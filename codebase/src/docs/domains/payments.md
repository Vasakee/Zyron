# Domain: Payments

Scope: payment method management, charges, and Stripe webhook handling.

## Source of truth
- Controller: `src/payment/controllers/payment.controller.ts`
- Services: `src/payment/services/*`, `src/payment/services/stripe/*`
- Entities: `src/payment/entity/transaction.entity.ts`, `src/payment/entity/payment-method.entity.ts`, `src/payment/entity/stripe-checkout-session.entity.ts`, `src/payment/entity/payment-statement.entity.ts`, `src/payment/entity/payment-statement-item.entity.ts`, `src/payment/entity/cancelled-transaction.entity.ts`

## Endpoint details (internal)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/payment/webhook` | Stripe | raw payload | Stripe webhook handler. |
| POST | `/api/v1/payment/charge-payment-method` | `x-access-token` | `PaymentDto` | Charge saved method. |
| GET | `/api/v1/payment/payment-methods` | `x-access-token` | none | List payment methods. |
| DELETE | `/api/v1/payment/payment-methods/:id` | `x-access-token` | none | Delete payment method. |
| POST | `/api/v1/payment/payment-methods/:id/set-default` | `x-access-token` | none | Set default method. |
| POST | `/api/v1/payment/setup-intent` | `x-access-token` | none | Create setup intent. |
| POST | `/api/v1/payment/payment-methods/confirm` | `x-access-token` | `ConfirmPaymentMethodDto` | Confirm and save method. |

## Endpoint details (external)

None documented.

## Schemas (DTOs)

PaymentDto:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "paymentMethodId": "pm_123",
  "country": "US",
  "kitType": "gut-scan",
  "quantity": 1
}
```

ConfirmPaymentMethodDto:
```json
{
  "setupIntentId": "seti_1234567890abcdef",
  "setAsDefault": true
}
```

## Examples

Create setup intent:
```http
POST /api/v1/payment/setup-intent
x-access-token: <jwt>
```

Stripe webhook:
```http
POST /api/v1/payment/webhook
stripe-signature: <sig>
Content-Type: application/json

{ ...stripe payload... }
```

## Error cases
- 401 for missing/invalid `x-access-token`.
- 400 for missing Stripe customer ID or invalid setup intent.

## Related docs
- Billing: `src/docs/domains/billing.md`
- Stripe integration: `src/docs/integrations/stripe.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
