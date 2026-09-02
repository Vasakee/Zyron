# Domain: Orders

Scope: order creation, waitlist flows, shipping updates, and external orders.

## Source of truth
- Internal controller: `src/order/order.controller.ts`
- External controller: `src/order-external/order-external.controller.ts`
- Services: `src/order/service/*`, `src/order-external/services/*`
- Entities: `src/order/entity/order.entity.ts`, `src/order/entity/order-kit.entity.ts`, `src/order/entity/shipping.entity.ts`, `src/order/entity/shipping-package.entity.ts`, `src/order/entity/shotgun-waitlist.entity.ts`
- DTOs: `src/order/dto/create-order.dto.ts`, `src/order-external/dto/save-order-external.dto.ts`

## Endpoint details (internal)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/orders` | `x-access-token` | `OrderDto` | Create order; guarded by monthly billing access. |
| POST | `/api/v1/orders/save` | `x-access-token` | `SaveOrderDto` | Save order without payment flow. |
| GET | `/api/v1/orders` | `x-access-token` | `PageOptionsDto`, `OrdersQueryDto` | List orders. |
| GET | `/api/v1/orders/customer-orders` | `x-access-token` | `PageOptionsDto`, `OrdersQueryDto` | Website orders. |
| GET | `/api/v1/orders/waitlist-orders` | `x-access-token` | `PageOptionsDto`, `OrdersQueryDto` | Waitlist orders. |
| GET | `/api/v1/orders/practitioner-orders` | `x-access-token` | `PageOptionsDto`, `OrdersQueryDto` | Practitioner orders. |
| GET | `/api/v1/orders/practitioner-waitlist-orders` | `x-access-token` | `PageOptionsDto`, `OrdersQueryDto` | Practitioner waitlist orders. |
| GET | `/api/v1/orders/order-kits/:orderId` | `x-access-token` | `PageOptionsDto`, `OrdersKitQueryDto` | Order kit list. |
| GET | `/api/v1/orders/paidOrder` | `x-access-token` | none | Paid order discrepancies report. |
| GET | `/api/v1/orders/pending-order/:id` | `x-access-token` | none | Generate payment link. |
| PUT | `/api/v1/orders/:id` | `x-access-token` | `UpdateOrderDto` | Update order. |
| PATCH | `/api/v1/orders/:id/cancel` | admin | none | Cancel order. |
| PUT | `/api/v1/orders/shipping/:id` | `x-access-token` | `UpdateShippingDto` | Update shipping info. |
| POST | `/api/v1/orders/waitlist` | none | `ShotgunWaitlistDto` | Join waitlist. |
| POST | `/api/v1/orders/complete-waitlist-payment` | none | `PaymentLinkTestDto` | Generate second payment link. |
| POST | `/api/v1/orders/consent-acceptance` | none | `ConsentAcceptanceDto` | Save consent + payment method. |
| GET | `/api/v1/orders/consent-decision/:sessionId` | none | path param | Consent decision + checkout session. |
| GET | `/api/v1/orders/send-reminders` | none | none | Trigger reminder emails. |
| DELETE | `/api/v1/orders/:id` | `x-access-token` | none | Delete order. |

## Endpoint details (external)

See `src/docs/api/public-api.md` for external contracts.

## Schemas (DTOs)

OrderDto:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "country": "US",
  "addressLineOne": "123 Main St",
  "addressLineTwo": "Apt 4",
  "paymentAction": "charge",
  "paymentMethodId": "pm_123",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "quantity": 1,
  "orderType": "pay_as_you_go",
  "currency": "usd",
  "kitType": "gut-scan"
}
```

SaveOrderDto:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "country": "US",
  "addressLineOne": "123 Main St",
  "addressLineTwo": "Apt 4",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "practitionerId": "uuid",
  "quantity": 1,
  "clientType": "customer",
  "kitType": "gut-scan",
  "currency": "usd"
}
```

OrdersQueryDto:
```json
{
  "searchQuery": "Jane",
  "status": "paid",
  "orderType": "pay_as_you_go"
}
```

OrdersKitQueryDto:
```json
{
  "searchQuery": "KIT",
  "status": "registered",
  "registrationStatus": "yes"
}
```

UpdateOrderDto:
```json
{
  "trackingNumber": "1Z999",
  "trackingUrl": "https://carrier.example.com/1Z999",
  "quantity": 1,
  "kitIds": ["KIT-123"],
  "shippingDate": "2024-01-15T10:30:00Z",
  "extraPackages": [
    {
      "trackingNumber": "1Z999-2",
      "trackingUrl": "https://carrier.example.com/1Z999-2"
    }
  ]
}
```

UpdateShippingDto:
```json
{
  "trackingNumber": "1Z999",
  "trackingUrl": "https://carrier.example.com/1Z999",
  "shippingDate": "2024-01-15T10:30:00Z",
  "quantity": 1,
  "kitIds": ["KIT-123"]
}
```

ShotgunWaitlistDto:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "country": "US",
  "currency": "usd",
  "quantity": 1
}
```

PaymentLinkTestDto:
```json
{
  "orderId": "order-id"
}
```

ConsentAcceptanceDto:
```json
{
  "session_id": "cs_test_123"
}
```

## Examples

Create order:
```http
POST /api/v1/orders
x-access-token: <jwt>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "country": "US",
  "addressLineOne": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "quantity": 1,
  "orderType": "pay_as_you_go",
  "currency": "usd",
  "kitType": "gut-scan"
}
```

Consent acceptance:
```http
POST /api/v1/orders/consent-acceptance
Content-Type: application/json

{
  "session_id": "cs_test_123"
}
```

## Error cases
- 401 for protected endpoints without `x-access-token`.
- 403 for admin-only cancel endpoint without proper role.
- 400 validation errors for DTOs and invalid status transitions.

## Related docs
- Payments: `src/docs/domains/payments.md`
- Kits: `src/docs/domains/kits.md`
- Public API contracts: `src/docs/api/public-api.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
