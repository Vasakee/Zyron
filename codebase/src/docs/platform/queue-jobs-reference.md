# Queue Jobs Reference

Complete reference for all Bull queue jobs: job types, data shapes, processors, concurrency, and retry behavior.

## Overview

**Queue System:** Bull (backed by Redis)
**Source:** [src/queues/types/queue.types.ts](../../queues/types/queue.types.ts)

### Default Job Options
```typescript
// Set in src/app.module.ts
{
  removeOnComplete: 100,  // Keep last 100 completed
  removeOnFail: 200,      // Keep last 200 failed
  attempts: 3,            // Retry up to 3 times
  backoff: {
    type: 'exponential',
    delay: 2000           // 2s, 4s, 8s
  }
}
```

### Bull Board
Access the queue dashboard at: `/v1/admin/queues` (basic auth)

---

## Queues

### `test` Queue

For testing queue infrastructure.

| Job Type | Processor | Concurrency | Purpose |
|----------|-----------|-------------|---------|
| `TEST_REPORT` | `TestReportProcessor` | 2 | Test report generation with configurable steps |

**Data Shape:**
```typescript
interface TestReportJobData {
  testId: string;
  name: string;
  iterations?: number;  // Default: 10
  delayMs?: number;     // Default: 750
}
```

**Source:** [src/queues/processors/test.processor.ts](../../queues/processors/test.processor.ts)

---

### `stripe` Queue

Stripe synchronization and payment processing.

| Job Type | Processor | Concurrency | Purpose |
|----------|-----------|-------------|---------|
| `UPSERT_CHECKOUT_SESSIONS` | `StripeUpsertSessionsProcessor` | 2 | Sync Stripe checkout sessions to DB |
| `ENRICH_TRANSACTIONS_FROM_SESSIONS` | `StripeEnrichTransactionsProcessor` | 2 | Enrich transaction data from sessions |
| `PROCESS_PAYMENT_METHOD` | `ProcessPaymentMethodProcessor` | 1 | Attach payment methods to customers |
| `FIX_ORDER_PAYMENT_URLS` | `StripeFixOrderPaymentUrlsProcessor` | 1 | Fix payment URLs in orders |
| `SYNC_STRIPE_PRICES` | `StripeSyncPricesProcessor` | 2 | Sync Stripe prices to DB |

**Data Shapes:**

```typescript
interface UpsertCheckoutSessionsJobData {
  createdFrom?: number;  // Unix timestamp
  createdTo?: number;    // Unix timestamp
  batchSize?: number;    // Default varies
}

interface EnrichTransactionsJobData {
  batchSize?: number;
}

interface ProcessPaymentMethodJobData {
  sessionId: string;
  paymentMethodId: string;
  referenceId: string;
  userId: string;
  stripeCustomerId: string;
}

interface SyncStripePricesJobData {
  priceIds?: string[];  // Optional, syncs all if not specified
}
```

**Sources:**
- [src/queues/processors/stripe-upsert-sessions.processor.ts](../../queues/processors/stripe-upsert-sessions.processor.ts)
- [src/queues/processors/stripe-enrich-transactions.processor.ts](../../queues/processors/stripe-enrich-transactions.processor.ts)
- [src/queues/processors/process-payment-method.processor.ts](../../queues/processors/process-payment-method.processor.ts)
- [src/queues/processors/stripe-fix-order-payment-urls.processor.ts](../../queues/processors/stripe-fix-order-payment-urls.processor.ts)
- [src/queues/processors/stripe-sync-prices.processor.ts](../../queues/processors/stripe-sync-prices.processor.ts)

---

### `health` Queue

Health information synchronization.

| Job Type | Processor | Concurrency | Purpose |
|----------|-----------|-------------|---------|
| `HEALTH_INFO_SYNC` | `HealthInfoSyncProcessor` | 1 | Sync health info status from external API |
| `HEALTH_INFORMATION_DISPATCH` | `HealthInformationDispatchProcessor` | 1 | Dispatch health info to external API |

**Data Shapes:**

```typescript
interface HealthInfoSyncJobData {
  batchSize?: number;    // Default: 200
  concurrency?: number;  // Default: 8 (internal concurrency for API calls)
}

interface HealthInformationDispatchJobData {
  logId: string;  // ID of HealthInformationDispatchLog
}
```

**Logic:**
- Sync: Checks kits where `healthInfoCompleted = 'no'`, queries external API, updates to `'yes'` if exists
- Dispatch: Emits `health.info.dispatch` event for email sending

**Sources:**
- [src/queues/processors/health-info-sync.processor.ts](../../queues/processors/health-info-sync.processor.ts)
- [src/queues/processors/health-info-dispatch.processor.ts](../../queues/processors/health-info-dispatch.processor.ts)

---

### `billing` Queue

Monthly billing processing.

| Job Type | Processor | Concurrency | Purpose |
|----------|-----------|-------------|---------|
| `RECONCILE_PROCESSING` | `ReconcileProcessingStatementsProcessor` | 2 | Reconcile statements stuck in processing |
| `PROCESS_INVOICE_PAYMENT` | `ProcessInvoicePaymentProcessor` | 1 | Process invoice payments |

**Data Shapes:**

```typescript
interface ReconcileProcessingJobData {
  maxAgeMinutes?: number;   // Default: 30
  userGroupLimit?: number;  // Default: 200
}

interface ProcessInvoicePaymentJobData {
  invoice: Stripe.Invoice;  // Full Stripe invoice object
}
```

**Sources:**
- [src/queues/processors/reconcile-processing-statements.processor.ts](../../queues/processors/reconcile-processing-statements.processor.ts)
- [src/queues/processors/process-invoice-payment.processor.ts](../../queues/processors/process-invoice-payment.processor.ts)

---

### `billing-access` Queue

Billing access file processing.

| Job Type | Processor | Concurrency | Purpose |
|----------|-----------|-------------|---------|
| `PROCESS_BILLING_ACCESS_FILE` | `BillingAccessProcessor` | 1 | Process billing access CSV files |

**Data Shape:**

```typescript
interface BillingAccessJobData {
  emails: string[];          // Email addresses to enable/disable
  enable?: boolean;          // Default: true
  requestedBy?: string | null;
}
```

**Source:** [src/queues/processors/billing-access.processor.ts](../../queues/processors/billing-access.processor.ts)

---

### `kit` Queue

Kit-related background jobs.

| Job Type | Processor | Concurrency | Purpose |
|----------|-----------|-------------|---------|
| `AUTO_REGISTER_PRACTITIONER_ORDER_KITS` | `AutoRegisterPractitionerOrderKitsProcessor` | 1 | Auto-register kits from practitioner orders |
| `HEALTH_INFORMATION_DISPATCH` | `HealthInformationDispatchProcessor` | 1 | Dispatch health info (shared with health queue) |

**Data Shape:**

```typescript
interface AutoRegisterPractitionerOrderKitsJobData {
  orderId: string;
  kitId: string;
}
```

**Source:** [src/queues/processors/auto-register.processor.ts](../../queues/processors/auto-register.processor.ts)

---

### `mail` Queue

Email sending (Postmark/Mailgun).

| Job Type | Processor | Concurrency | Purpose |
|----------|-----------|-------------|---------|
| `SendMail` | `MailQueueProcessor` | 5 | Send plain email |
| `SendMailWithTemplate` | `MailQueueProcessor` | 5 | Send email with template |
| `SendInitialSupportMail` | `MailQueueProcessor` | 2 | Initial support ticket email |
| `SendSupportMail` | `MailQueueProcessor` | 2 | Support reply email |

**Source:** [src/mail/mail-queue.processor.ts](../../mail/mail-queue.processor.ts)

**Data Shape:** Varies by job type, typically includes:
- `to`: Recipient email
- `subject`: Email subject
- `body` or `templateId` + `templateData`

---

## Triggering Jobs Manually

### Via API

```bash
# POST /api/v1/jobs/run/:jobType
curl -X POST http://localhost:3000/api/v1/jobs/run/test-report \
  -H "x-access-token: <token>" \
  -H "Content-Type: application/json" \
  -d '{"testId": "test-123", "name": "Manual Test"}'
```

### Via Queue Service

```typescript
// In code
await this.queueService.addTestReportJob({ testId: 'test-123', name: 'Test' });
await this.queueService.addHealthInfoSyncJobDefault();
await this.queueService.addReconcileProcessingJob();
```

**Source:** [src/queues/services/queue.service.ts](../../queues/services/queue.service.ts)

---

## Debugging Jobs

### Check Job Status

1. Open Bull Board: `/v1/admin/queues`
2. Select queue
3. View: Waiting, Active, Completed, Failed jobs
4. Click job for details and logs

### Common Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Job stuck in "active" | Processor crashed/hung | Restart app, job will retry |
| Job in "failed" after retries | Unhandled error | Check error message, fix root cause |
| Jobs not processing | Redis disconnected | Check Redis connection |
| Queue paused | Manual pause | Resume via Bull Board or API |

### Job Logs

Processors use `job.log()` for progress:
```typescript
await job.log(`Step ${i}/${total} completed`);
```

View in Bull Board job details.

---

## Queue Configuration

### Redis Connection

Set via environment variables:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional
```

### Concurrency per Job Type

Concurrency is set per `@Process()` decorator:
```typescript
@Process({ name: JobTypes.SYNC_STRIPE_PRICES, concurrency: 2 })
```

Most jobs run with concurrency 1 for safety. Higher concurrency only where safe:
- `UPSERT_CHECKOUT_SESSIONS`: 2
- `ENRICH_TRANSACTIONS_FROM_SESSIONS`: 2
- `SYNC_STRIPE_PRICES`: 2
- `RECONCILE_PROCESSING`: 2
- `TEST_REPORT`: 2
- `SendMail`: 5
- `SendMailWithTemplate`: 5
- `SendInitialSupportMail`: 2
- `SendSupportMail`: 2

### Retry Behavior

Default: 3 attempts with exponential backoff (2s, 4s, 8s)

Override per job:
```typescript
await queue.add(JobTypes.MY_JOB, data, {
  attempts: 5,
  backoff: {
    type: 'fixed',
    delay: 10000  // 10s between retries
  }
});
```

---

## Event Emitters

Some jobs emit events for further processing:

| Job | Event | Payload | Listener |
|-----|-------|---------|----------|
| `HEALTH_INFORMATION_DISPATCH` | `health.info.dispatch` | `{ logId, email, name, ... }` | Sends email |

**Source:** [src/queues/processors/health-info-dispatch.processor.ts:75](../../queues/processors/health-info-dispatch.processor.ts)
