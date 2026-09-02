# Domain: Mail

Scope: inbound email webhooks and contact/support messaging.

## Source of truth
- Controller: `src/mail/mail.controller.ts`
- Services: `src/mail/services/*`

## Endpoint details (internal)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/mail/inbound` | none | webhook payload | Inbound email webhook (Mailgun/Postmark). |

## Endpoint details (external)

None documented.

## Schemas (DTOs)

None documented.

## Examples

Inbound webhook:
```http
POST /api/v1/mail/inbound
Content-Type: application/json

{ ...provider payload... }
```

## Error cases
- 400 for invalid payloads from provider.

## Related docs
- Contact messages: `src/docs/domains/contact-messages.md`
- Mailgun/Postmark integration: `src/docs/integrations/mailgun-postmark.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
