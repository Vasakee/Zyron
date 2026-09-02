# How It Works (Flows)

Goal: document business-critical user journeys.

Examples:

* “Practitioner purchases kit → admin ships → customer registers → report generated”
* “Payment → subscription state → entitlements”
* “Support email → thread → inbound webhook flow”
* “Report generation pipeline (micro-BAM / gut-loss)”

Each flow doc should answer:

* Entry point (where it starts)
* Key steps (what happens)
* Data touched
* Failure modes + debugging

## Flow: Practitioner purchases kit -> admin ships -> customer registers -> report generated

Entry point
- Order creation (internal) in `src/order` or external order in `src/order-external`

Key steps
- Order is created and tied to a practitioner/client.
- Payment is captured and an order kit is allocated.
- Shipping info is created/updated.
- Customer registration and health info are recorded.
- Reporting or sample report is generated for the kit.

Data touched
- `order`, `order-kit`, `kit`, `shipping` entities
- Practitioner and user records
- Reporting exports (derived from order/payment data)

Failure modes + debugging
- Payment fails: check Stripe webhook logs and `src/payment`
- Kit allocation missing: verify `src/kit` and order-kit records
- Shipping updates not reflected: check `src/order` services and shipping entities
- Report missing: check `src/reporting` and `src/testkit-sample-reports`

## Flow: Payment -> subscription state -> entitlements

Entry point
- Stripe checkout or payment capture (`src/payment`)

Key steps
- Checkout session is created and associated to a user/practitioner.
- Transaction and payment method records are persisted.
- Billing periods and statements are generated (cron-based in `src/billing`).
- Entitlements are derived from payment state in downstream services.

Data touched
- `stripe-checkout-session`, `transaction`, `payment-method`, `payment-statement`

Failure modes + debugging
- Webhook signature mismatch: verify `STRIPE_WEBHOOK_HASH`
- Subscription/checkout session not linked: inspect `stripe-checkout-session` entity
- Billing period off: check cron config (`BILLING_*` settings) and `src/billing`

## Flow: Support email -> thread -> inbound webhook flow

Entry point
- Inbound email POST at `/api/v1/mail/inbound` (`src/mail/mail.controller.ts`)

Key steps
- Inbound payload is parsed and threaded by message references.
- Support message is created or appended to a thread.
- Notifications are sent back to the requester.

Data touched
- `support`, `support-message`, `contact-message`

Failure modes + debugging
- Inbound payload missing headers: inspect `mail.processInboundEmail`
- Thread not found: check References header parsing in `src/mail/services/new-message.ts`
- Notification not sent: verify Mailgun/Postmark config in `.env`

## Flow: Report generation pipeline (sample/demo + exports)

Entry point
- Reporting endpoints in `src/reporting` or sample report endpoint in `src/testkit-sample-reports`

Key steps
- Reporting queries aggregate order/payment data.
- Sample/demo reports are assembled with templates and S3 links.
- Results are delivered via API or email.

Data touched
- Reporting DTOs, order/payment entities
- S3 assets for demo PDFs

Failure modes + debugging
- Export errors: check `src/reporting/service/*` logs
- Demo report link broken: verify S3 assets and `S3_ENDPOINT`
- Email delivery issues: validate Postmark/Mailgun credentials

## Flow: Health info sync + dispatch

Entry point
- Cron scheduler in `src/cron/cron.service.ts` enqueues sync jobs

Key steps
- Queue job fetches questionnaire status via `src/integrations/health-info.client.ts`.
- Pending health info is dispatched by `DispatchHealthInformationService`.
- SSE or gateway updates notify clients.

Data touched
- Health info entities
- Dispatch logs in `src/health-info/entity/health-information-dispatch-log.entity.ts`

Failure modes + debugging
- Sync job not running: check cron logs and `src/queues/processors/health-info-sync.processor.ts`
- External API errors: verify `VITRACT_QUESTIONAIRE_API_BASE_URL` and `VITRACT_REST_KEY`

## Flow: Monthly billing + payment retries

Entry point
- Cron scheduler in `src/cron/cron.service.ts`

Key steps
- Billing scheduler builds statements and queues payment jobs.
- Retry processor handles failed payments per retry config.

Data touched
- `payment-statement`, `payment-statement-item`, `transaction` entities

Failure modes + debugging
- Billing cron not firing: check `MONTHLY_BILLING_CRON`
- Retry failures: inspect `src/billing/services/payment-retry.service.ts`

## Flow: Vaari usage + SSE updates

Entry point
- Usage endpoints under `src/vaari/controllers/vaari-usage.controller.ts`

Key steps
- Usage events are created and aggregated for summaries.
- SSE streams notify clients of analysis updates.

Data touched
- `vaari-usage-event`, `customer-profile` entities

Failure modes + debugging
- SSE not connecting: inspect `src/vaari/controllers/vaari-analysis-sse.controller.ts`

## Flow: External auth -> external order creation

Entry point
- `POST /api/v1/external/auth` then `POST /api/v1/external/orders` (`src/auth-external`, `src/order-external`)

Key steps
- External client authenticates with `clientId` and `clientSecret`.
- JWT is returned and used in `x-access-token` header.
- Order is created with source `Elyxium` and status `Paid`.

Data touched
- `api-key`, `order`, `order-kit` entities

Failure modes + debugging
- Auth failed: verify `api-key` records and hashing in `src/auth-external/auth-external.service.ts`
- Unauthorized order: check `VerifyTokenMiddlewareExternal` and `SECRET_KEY`
- Practitioner lookup fails: verify email lookup in `src/order-external/services/save-order-external.ts`

## Flow: Kit status update (external API key)

Entry point
- `PUT /api/v1/kits/external/status/:kitId` (`src/kit/kit.controller.ts`)

Key steps
- External system posts status update with `x-api-key`.
- Status change updates dates and optional health info state.

Data touched
- `kit` and `practitioner-kit` entities

Failure modes + debugging
- Unauthorized: verify `x-api-key` middleware in `src/common/middleware/api-key.middleware.ts`
- Status transitions unexpected: inspect `UpdateKitStatusDto` handling

## Flow: Contact form submission -> admin review

Entry point
- `POST /api/v1/contacts` (`src/contact-message/contact-message.controller.ts`)

Key steps
- Form payload (and optional file) is stored.
- Admins review via `GET /api/v1/contacts` and `GET /api/v1/contacts/:id`.

Data touched
- `contact-message` entity

Failure modes + debugging
- Upload issues: inspect `FileInterceptor` handling and storage config
- Missing records: check `ContactMessageService` persistence

## Flow: Waitlist signup -> reminder -> payment link

Entry point
- `POST /api/v1/orders/waitlist` (`src/order/order.controller.ts`)

Key steps
- Waitlist record is created.
- Reminder job can be triggered via `GET /api/v1/orders/send-reminders`.
- Follow-up payment link generated via `POST /api/v1/orders/complete-waitlist-payment`.

Data touched
- `shotgun-waitlist`, `order` entities

Failure modes + debugging
- Reminder not sent: inspect `src/order/service/waitlist-reminder.ts`
- Payment link failures: check Stripe services under `src/payment/services/stripe/*`

## Flow: Support case -> admin assignment -> threaded messages

Entry point
- `POST /api/v1/supports` (`src/support/support.controller.ts`)

Key steps
- Case is created for the user.
- Admin assigns case via `PUT /api/v1/supports/assign/:id`.
- Messages sent via `POST /api/v1/supports/messages`.

Data touched
- `support`, `support-message` entities

Failure modes + debugging
- Assignment not persisted: check `AssignCaseStatusService`
- Message not sent: inspect `SendMessageService`

## Flow: Queue admin actions -> job execution

Entry point
- `POST /api/v1/queues/:queueName/pause` or `/resume` (`src/queues/controllers/queue.controller.ts`)
- Job triggers via `GET /api/v1/jobs/run/*` (`src/queues/controllers/job.controller.ts`)

Key steps
- Queue state updated in Redis.
- Jobs are enqueued and processed by processors in `src/queues/processors/*`.

Data touched
- Redis queue state

Failure modes + debugging
- Queue not pausing: check `QueueService` and Redis connectivity
- Job stuck: inspect processor logs and Bull Board `/v1/admin/queues`

## Flow: Migration scripts (manual)

Entry point
- `POST /api/v1/script/migrate/*` (`src/scripts/controllers/migration.controller.ts`)

Key steps
- Script endpoints trigger migration services.
- Output is returned as success response or data payload.

Data touched
- Depends on migration: users, kits, practitioner kits, reports

Failure modes + debugging
- Migration errors: inspect corresponding services in `src/scripts/services/*`
