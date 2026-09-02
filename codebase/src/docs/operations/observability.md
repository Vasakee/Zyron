# Observability

## Overview

This system relies on app logs, Sentry, Bull Board, and provider dashboards for operational visibility.

## Where to Look

- App logs: stdout/stderr from NestJS Logger and `console.log`.
- Sentry: exceptions when `SENTRY_DSN` is configured.
- Bull Board: `/v1/admin/queues` for job status and logs.
- Provider dashboards: Stripe webhooks/payments, Mailgun/Postmark delivery logs.

## Playbooks

### Correlation Fields to Search

- `orderId`
- `kitId`
- `sessionId`
- `userId`
- `jobId`

### What to Capture for Postmortems

- Incident timeline with timestamps.
- Request URL, method, and payload summary.
- Relevant IDs (orderId, kitId, sessionId, userId, jobId).
- Queue/job state (waiting/active/failed) and error stacks.
- Provider webhook delivery attempts and responses.
- Environment/config changes around the incident.

## SAFE Actions

- Export logs and screenshots from Sentry/Bull Board.
- Collect webhook delivery evidence from provider dashboards.

## DANGEROUS Actions

- Modifying production data while investigating.
- Clearing failed jobs before capturing error details.

## References

- [Operations Runbook](./runbook.md)
- [Error Catalog](./error-catalog.md)
- [Debugging Queues](./debugging-queues.md)
- [Debugging Webhooks](./debugging-webhooks.md)
- [Debugging Database](./debugging-database.md)
