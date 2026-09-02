# Integration: Mailgun + Postmark

## Source of truth
- Inbound mail controller: `src/mail/mail.controller.ts`
- Mail services: `src/mail/services/*`
- Support/contact entities: `src/support/entity/*`, `src/contact-message/entity/*`

## Usage
- Inbound webhook: `POST /api/v1/mail/inbound`
- Support and contact workflows use provider templates and tokens.

## Required env vars
- `POSTMARK_API_TOKEN`
- `POSTMARK_SUPPORT_EMAIL`
- `POSTMARK_VERIFIED_EMAIL`
- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- Template IDs: `MAILGUN_*`, `POSTMARK_TEMPLATE_*`
