# Domain: Reporting

Scope: reporting endpoints, exports, and payment statement summaries.

## Source of truth
- Controller: `src/reporting/reporting.controller.ts`
- Services: `src/reporting/service/*`

## Endpoint details (internal)

All reporting endpoints require admin role unless noted.

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/reporting/orders` | admin | `PageOptionsDto` | Order report. |
| GET | `/api/v1/reporting/orders/summary` | admin | none | Order summary. |
| GET | `/api/v1/reporting/transactions` | admin | `PageOptionsDto` | Transaction report. |
| GET | `/api/v1/reporting/transactions/reconciliation` | admin | none | Transaction reconciliation. |
| GET | `/api/v1/reporting/transactions/summary` | admin | none | Transaction summary. |
| GET | `/api/v1/reporting/statements` | admin | `PageOptionsDto` | Statement report. |
| GET | `/api/v1/reporting/statements/rollup/practitioner` | admin | none | Rollup by practitioner. |
| GET | `/api/v1/reporting/statements/rollup/month` | admin | none | Rollup by month. |
| GET | `/api/v1/reporting/statements/rollup/currency` | admin | none | Rollup by currency. |
| GET | `/api/v1/reporting/payment-statements` | admin | `PageOptionsDto`, `PaymentStatementQueryDto` | Payment statements. |
| GET | `/api/v1/reporting/payment-statements/summary` | admin | `PaymentStatementQueryDto` | Statement summary. |
| GET | `/api/v1/reporting/payment-statements/status-summary` | admin | `PaymentStatementQueryDto` | Status summary. |
| GET | `/api/v1/reporting/payment-statements/statistics` | `x-access-token` | `PaymentStatementQueryDto` | Statistics (no role guard). |
| GET | `/api/v1/reporting/admin/monthly-statements` | admin | `PageOptionsDto`, `MonthlyStatementQueryDto` | Admin monthly statements. |
| GET | `/api/v1/reporting/practitioner/monthly-statements` | `x-access-token` | `PageOptionsDto`, `MonthlyStatementQueryDto` | Practitioner monthly statements. |

## Endpoint details (external)

None documented.

## Schemas (DTOs)

ReportingQueryDto:
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "practitionerId": "uuid",
  "currency": "usd",
  "orderType": "pay_as_you_go"
}
```

PaymentStatementQueryDto:
```json
{
  "userId": "uuid",
  "status": "paid",
  "paidAtStart": "2024-01-01",
  "paidAtEnd": "2024-01-31",
  "createdAtStart": "2024-01-01",
  "createdAtEnd": "2024-01-31",
  "interval": "monthly",
  "limit": 100
}
```

MonthlyStatementQueryDto:
```json
{
  "year": 2024,
  "month": 1,
  "status": "paid"
}
```

Example response (order report):
```json
{
  "message": "Order report fetched successfully",
  "code": 200,
  "status": "success",
  "data": {
    "items": [
      {
        "id": "order-id",
        "referenceId": "ref-123",
        "practitionerId": "prac-id",
        "practitionerName": "Dr Smith",
        "orderType": "pay_as_you_go",
        "status": "paid",
        "currency": "usd",
        "amountSubtotal": 100,
        "amountDiscount": 0,
        "amountTax": 0,
        "amountTotal": 100,
        "quantity": 1,
        "createdAt": "2024-01-10T12:00:00Z",
        "completedAt": "2024-01-10T12:00:00Z"
      }
    ]
  }
}
```

## Examples

Order report:
```http
GET /api/v1/reporting/orders?page=1&limit=50
x-access-token: <jwt>
```

## Error cases
- 403 for non-admin access to admin-only endpoints.
- 400 for invalid query params.

## Related docs
- Billing: `src/docs/domains/billing.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
