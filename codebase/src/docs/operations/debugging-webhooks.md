# Debugging Webhooks

## Overview

Webhooks enter the system through payment and mail endpoints. Use this guide to verify signatures, trace payloads, and safely replay events.

## Where to Look

- App logs for webhook handlers.
- Stripe Dashboard → Webhooks → Delivery attempts.
- Mailgun/Postmark dashboards for inbound deliveries.

## Playbooks

### Stripe Webhook Verification (Signature Mismatch)

Endpoint: `POST /api/v1/payment/webhook`

Steps:
1. Confirm `STRIPE_WEBHOOK_HASH` matches the secret in Stripe Dashboard.
2. Check app logs from `StripePaymentWebhook` for verification errors.
3. Verify the payload format matches what Stripe sent (handler uses `JSON.stringify(data)`).
4. Re-send the event from Stripe Dashboard and compare timestamps.

Notes:
- The webhook handler uses `STRIPE_WEBHOOK_HASH` to construct the Stripe event.
- The controller passes the `stripe-signature` header into the service.

### Mailgun/Postmark Inbound (Threading)

Endpoint: `POST /api/v1/mail/inbound`

Steps:
1. Ensure the inbound payload contains `References` and `stripped-text` fields.
2. Confirm `References` contains the original messageId used when creating the support record.
3. Check logs for `ReceiveMessageService` warnings like "messageid not found".
4. Verify the support record exists for the messageId.

### Safe Replay Strategies

- Stripe: use the Dashboard's webhook delivery retry to preserve original payloads.
- Mailgun/Postmark: use provider redelivery features if available, otherwise re-send the captured payload to the same endpoint.

### What to Capture

- Timestamp, endpoint, response status.
- Request body as received.
- Headers (Stripe: `stripe-signature`; Mail: `References`, `Message-ID`, `In-Reply-To`).
- Any correlation fields: `orderId`, `kitId`, `sessionId`, `userId`.

## SAFE Actions

- Re-send webhook events from provider dashboards.
- Capture payloads and headers before retrying.
- Verify secrets and provider configuration.

## DANGEROUS Actions

- Manually marking payments as complete without webhook verification.
- Replaying webhooks without capturing the original payload.

## References

- [Operations Runbook](./runbook.md)
- [Error Catalog](./error-catalog.md)
- [Observability](./observability.md)
