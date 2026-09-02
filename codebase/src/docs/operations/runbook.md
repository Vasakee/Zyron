# Operations Runbook

## Overview

This runbook is the first stop for on-call triage. It focuses on fast diagnosis and safe actions.

Quick links:
- [Error Catalog](./error-catalog.md)
- [Debugging Queues](./debugging-queues.md)
- [Debugging Webhooks](./debugging-webhooks.md)
- [Debugging Database](./debugging-database.md)
- [Observability](./observability.md)
- [Deployment Runbook](./deployment-runbook.md)

## Where to Look

- App logs: stdout/stderr from NestJS Logger and `console.log`.
- Sentry: exceptions when `SENTRY_DSN` is configured.
- Bull Board: queue activity at `/v1/admin/queues`.
- Provider dashboards: Stripe webhooks, Mailgun/Postmark delivery logs.

## Playbooks

### First 5 Minutes

1. Confirm the API responds: `curl https://api.vitract.com/api/v1/`.
2. Open Bull Board at `/v1/admin/queues` for stuck/failed jobs.
3. Check Sentry for new exceptions tied to the incident window.
4. Scan app startup logs for TypeORM (MSSQL) or Redis connection errors.
5. Check Stripe/Mailgun/Postmark webhook delivery logs if the issue is payment/mail related.

### Correlate Request -> Job -> Webhook

1. Start with the request URL, timestamp, and any identifiers (orderId, kitId, sessionId, userId).
2. Find the request in app logs; capture any job IDs or queue names logged.
3. In Bull Board, search for the job by name/data, then inspect logs and attempts.
4. In provider dashboards, match the same timestamp and identifiers (sessionId, invoiceId, messageId).

### Symptom -> Checks -> SAFE Actions

| Symptom | Checks | SAFE Actions |
| --- | --- | --- |
| 401 on internal routes | `x-access-token` header, token expiry, `SECRET_KEY` | Ask user to re-login; verify env var parity |
| 401 on external routes | external token format, external middleware | Re-issue external token; verify header format |
| 401 on kit external status | `x-api-key`, `API_KEYS` env var | Verify key list and header presence |
| Stripe webhook failing | Stripe dashboard delivery logs, `STRIPE_WEBHOOK_HASH` | Verify webhook secret; re-send event in Stripe |
| Monthly billing not running | billing queue jobs, cron logs, `MONTHLY_BILLING_CRON` | Verify scheduler logs and queue status |
| Emails not sending | mail queue status, Postmark/Mailgun logs | Retry failed mail jobs; verify provider keys |
| Health info sync failing | `HEALTH_INFO_SYNC` job errors, external API status | Retry job; confirm API base URL/key |
| Queue backlog | Redis connectivity, worker health | Restart workers; inspect failed jobs |
| DB connection errors | TypeORM startup logs, DB host availability | Verify DB env vars; restart app |
| SSE/WebSocket issues | gateway/SSE logs, CORS settings | Confirm CORS and gateway init logs |

## SAFE Actions

- Retry failed queue jobs via Bull Board after reviewing errors.
- Restart application/worker processes to reset connections.
- Clear completed jobs to reduce queue memory usage.
- Test webhooks with provider tools (Stripe CLI, provider dashboards).
- Verify API keys and webhook secrets in external dashboards.
- Decode JWTs to inspect claims without verification.

## DANGEROUS Actions

- Manual database edits that bypass application logic.
- Clearing active queue jobs without understanding side effects.
- Marking payments complete without webhook verification.
- Editing migration files after they have been applied.
- Deleting Redis queue data manually.
- Changing critical env vars in production without testing.
- Bypassing authentication middleware for debugging.

## References

- [Error Catalog](./error-catalog.md)
- [Debugging Queues](./debugging-queues.md)
- [Debugging Webhooks](./debugging-webhooks.md)
- [Debugging Database](./debugging-database.md)
- [Observability](./observability.md)
