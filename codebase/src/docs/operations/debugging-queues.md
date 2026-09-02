# Debugging Queues

## Overview

Background processing uses Bull queues. Use Bull Board for live inspection and queue health.

## Where to Look

- Bull Board: `/v1/admin/queues`.
- Queue stats API: `GET /api/v1/queues/stats`.
- App logs for `QueueService` and processor errors.

## Playbooks

### Queue List, Job Types, and Processors

| Queue | Job type | Processor | Concurrency | Retry/backoff |
| --- | --- | --- | --- | --- |
| test | `test-report` | `src/queues/processors/test.processor.ts` | 2 | Not specified |
| stripe | `upsert-checkout-sessions` | `src/queues/processors/stripe-upsert-sessions.processor.ts` | 2 | Not specified |
| stripe | `enrich-transactions-from-sessions` | `src/queues/processors/stripe-enrich-transactions.processor.ts` | 2 | Not specified |
| stripe | `process-payment-method` | `src/queues/processors/process-payment-method.processor.ts` | Default (not set) | attempts=3, exponential backoff 2000ms |
| stripe | `fix-order-payment-urls` | `src/queues/processors/stripe-fix-order-payment-urls.processor.ts` | 1 | Not specified |
| stripe | `sync-stripe-prices` | `src/queues/processors/stripe-sync-prices.processor.ts` | 2 | attempts=3, exponential backoff 2000ms |
| health | `health-info-sync` | `src/queues/processors/health-info-sync.processor.ts` | 1 | removeOnComplete=5, removeOnFail=10 |
| billing | `reconcile-processing` | `src/queues/processors/reconcile-processing-statements.processor.ts` | 2 | removeOnComplete=5, removeOnFail=50 |
| billing | `process-invoice-payment` | `src/queues/processors/process-invoice-payment.processor.ts` | Default (not set) | attempts=3, exponential backoff 2000ms |
| billing-access | `process-billing-access-file` | `src/queues/processors/billing-access.processor.ts` | Default (not set) | attempts=3, exponential backoff 2000ms |
| kit | `auto-register-practitioner-order-kits` | `src/queues/processors/auto-register.processor.ts` | Default (not set) | attempts=3, exponential backoff 2000ms |
| kit | `health-information-dispatch` | `src/queues/processors/health-info-dispatch.processor.ts` | Default (not set) | attempts=3, exponential backoff 2000ms |
| mail | `send-mail` | `src/mail/mail-queue.processor.ts` | 5 | Not specified (some enqueues add delay=3000ms) |
| mail | `sand-mail-via-template` | `src/mail/mail-queue.processor.ts` | 5 | Not specified |
| mail | `send-initial-support-mail` | `src/mail/mail-queue.processor.ts` | 2 | Not specified (some enqueues add delay=3000ms) |
| mail | `send-support-mail` | `src/mail/mail-queue.processor.ts` | 2 | Not specified (some enqueues add delay=3000ms) |

Notes:
- Concurrency marked as "Default" is not explicitly set on the processor.
- Health info sync also uses per-job `concurrency` in job data to control internal batching.

### Using Bull Board

1. Open `/v1/admin/queues`.
2. Check `waiting`, `active`, `failed`, and `delayed` counts.
3. Inspect failed jobs for stack traces and job data.
4. Retry only after confirming the root cause is resolved.

### Safe Retry Guidance

- Prefer retrying idempotent jobs (sync/enrich/fix) after fixing the root cause.
- Jobs with built-in retries (`attempts=3`) should be allowed to finish before manual retry.

### When NOT to Retry

- `process-payment-method` or `process-invoice-payment` if Stripe already shows a final state.
- Mail jobs if the provider dashboard shows successful delivery (avoid duplicates).

## SAFE Actions

- Pause/resume queues via the API (`POST /api/v1/queues/:queueName/pause` and `/resume`) after confirming impact.
- Retry failed jobs after reviewing error details and provider state.
- Clear completed jobs to reduce queue memory use.

## DANGEROUS Actions

- Clearing active jobs or deleting queue data directly in Redis.
- Retrying payment-related jobs without verifying Stripe state.

## References

- [Operations Runbook](./runbook.md)
- [Error Catalog](./error-catalog.md)
- [Observability](./observability.md)
