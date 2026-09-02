# Entrypoints Reference

Complete reference of all API entrypoints: HTTP routes, webhooks, SSE, WebSocket, cron jobs, queues, and CLI commands.

**Global prefix:** `/api/v1` (set in [src/main.ts:35](../../main.ts))
**Exclusion:** `/v1/admin/queues` (Bull Board, basic auth)

---

## HTTP Routes

### Internal API Controllers

#### AppController (`/`)
**Source:** [src/app.controller.ts](../../app.controller.ts)
**Auth:** None

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Health check (root) |
| GET | `/health/:page` | Health check with page param |

---

#### AdminController (`/admins`)
**Source:** [src/admin/admin.controller.ts](../../admin/admin.controller.ts)
**Auth:** `x-access-token` (except `POST /`)

| Method | Route | Auth | Guards | Description |
|--------|-------|------|--------|-------------|
| POST | `/admins` | None | - | Create admin account |
| GET | `/admins` | `x-access-token` | - | Get all admins (paginated) |
| PUT | `/admins` | `x-access-token` | - | Update current admin account |
| PUT | `/admins/:adminId` | `x-access-token` | - | Update specific admin |
| POST | `/admins/promote` | `x-access-token` | `RolesGuard` + `SUPER_ADMIN` | Promote user to admin |

---

#### AuthController (`/auth`)
**Source:** [src/auth/auth.controller.ts](../../auth/auth.controller.ts)
**Auth:** Google OAuth

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/auth/google` | `AuthGuard('google')` | Initiate Google OAuth |
| GET | `/auth/google/callback` | `AuthGuard('google')` | Google OAuth callback → JWT |

---

#### ContactMessageController (`/contacts`)
**Source:** [src/contact-message/contact-message.controller.ts](../../contact-message/contact-message.controller.ts)
**Auth:** `x-access-token` (except `POST /`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/contacts` | None | Submit contact form (multipart/form-data) |
| GET | `/contacts` | `x-access-token` | Get all contact messages |
| GET | `/contacts/:id` | `x-access-token` | Get single contact message |

---

#### FeedbackController (`/feedback`)
**Source:** [src/feedback/feedback.controller.ts](../../feedback/feedback.controller.ts)
**Auth:** `x-access-token`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/feedback` | Submit feedback |
| GET | `/feedback` | Get all feedback |
| GET | `/feedback/:id` | Get single feedback |

---

#### KitController (`/kits`) - 22 routes
**Source:** [src/kit/kit.controller.ts](../../kit/kit.controller.ts)
**Auth:** `VerifyTokenMiddleware` with exclusions

**Excluded from auth (no `x-access-token` required):**
- `GET /kits/get-name/:kitId`
- `GET /kits/singlekit/:id`
- `PUT /kits/status/:kitId`
- `PUT /kits/external/status/:kitId` (requires `x-api-key` instead)
- `PUT /kits/complete-process/:kitId`
- `PUT /kits/practitioner-status/:kitId`
- `POST /kits/transfer` (requires `ADMIN` role via `RolesGuard`)

| Method | Route | Auth | Guards | Description |
|--------|-------|------|--------|-------------|
| POST | `/kits` | `x-access-token` | - | Create/register kit |
| POST | `/kits/practitioner-kit` | `x-access-token` | - | Register practitioner kit |
| GET | `/kits/user-kits` | `x-access-token` | - | Get user's kits |
| GET | `/kits` | `x-access-token` | - | Get all kits (paginated) |
| PUT | `/kits/practitioner-kit-name` | `x-access-token` | `RolesGuard` + `ADMIN` | Update practitioner kit name |
| PUT | `/kits/:id` | `x-access-token` | - | Update kit |
| GET | `/kits/single/:id` | `x-access-token` | - | Get single kit |
| GET | `/kits/singlekit/:id` | None | - | Get single kit (public) |
| GET | `/kits/practitioner-kits` | `x-access-token` | - | Get practitioner's kits |
| GET | `/kits/all-practitioner-kits/:practitionerId` | `x-access-token` | - | Get all kits for practitioner |
| PUT | `/kits/status/:kitId` | None | - | Update kit status (internal) |
| PUT | `/kits/external/status/:kitId` | `x-api-key` | - | Update kit status (lab integration) |
| PUT | `/kits/practitioner-status/:kitId` | None | - | Update practitioner kit status |
| PATCH | `/kits/lock-status/:kitId` | `x-access-token` | - | Toggle kit lock status |
| DELETE | `/kits/:id` | `x-access-token` | - | Delete kit |
| GET | `/kits/family-kits` | `x-access-token` | - | Get family kits |
| GET | `/kits/old-practitioner-kits` | `x-access-token` | - | Get old practitioner kits |
| GET | `/kits/get-name/:kitId` | None | - | Get kit name by ID |
| PUT | `/kits/complete-process/:kitId` | None | - | Complete report process |
| PUT | `/kits/update-sample-collection-date/:kitId` | `x-access-token` | - | Update sample collection date |
| POST | `/kits/transfer` | `x-access-token` | `RolesGuard` + `ADMIN` | Transfer kit (customer → practitioner) |
| POST | `/kits/practitioner-kit/:id/health-info-dispatch` | `x-access-token` | - | Enqueue health info dispatch |

---

#### OrderController (`/orders`) - 19 routes
**Source:** [src/order/order.controller.ts](../../order/order.controller.ts)
**Auth:** `VerifyTokenMiddleware` with exclusions

**Excluded from auth (no `x-access-token` required):**
- `POST /orders/waitlist`
- `GET /orders/send-reminders`
- `POST /orders/complete-waitlist-payment`
- `POST /orders/consent-acceptance`
- `GET /orders/consent-decision/:sessionId`

| Method | Route | Auth | Guards | Description |
|--------|-------|------|--------|-------------|
| POST | `/orders` | `x-access-token` | `MonthlyBillingAccessGuard` | Create order |
| GET | `/orders/send-reminders` | None | - | Trigger reminder emails |
| POST | `/orders/save` | `x-access-token` | - | Save order draft |
| GET | `/orders` | `x-access-token` | - | Get all orders |
| GET | `/orders/customer-orders` | `x-access-token` | - | Get customer orders |
| GET | `/orders/waitlist-orders` | `x-access-token` | - | Get waitlist orders |
| GET | `/orders/order-kits/:orderId` | `x-access-token` | - | Get order kits |
| GET | `/orders/paidOrder` | `x-access-token` | - | Get paid orders |
| DELETE | `/orders/:id` | `x-access-token` | - | Delete order |
| PUT | `/orders/:id` | `x-access-token` | - | Update order |
| PATCH | `/orders/:id/cancel` | `x-access-token` | `RolesGuard` + `ADMIN` | Cancel order |
| GET | `/orders/pending-order/:id` | `x-access-token` | - | Get unpaid order |
| GET | `/orders/practitioner-orders` | `x-access-token` | - | Get practitioner orders |
| GET | `/orders/practitioner-waitlist-orders` | `x-access-token` | - | Get practitioner waitlist orders |
| PUT | `/orders/shipping/:id` | `x-access-token` | - | Update shipping |
| POST | `/orders/waitlist` | None | - | Join waitlist |
| POST | `/orders/complete-waitlist-payment` | None | - | Complete waitlist payment |
| POST | `/orders/consent-acceptance` | None | - | Accept consent |
| GET | `/orders/consent-decision/:sessionId` | None | - | Get consent decision |

---

#### PaymentController (`/payment`) - 8 routes
**Source:** [src/payment/controllers/payment.controller.ts](../../payment/controllers/payment.controller.ts)
**Auth:** Mixed

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/payment/webhook` | `stripe-signature` header | Stripe webhook handler |
| POST | `/payment/checkout/guest` | None | Guest checkout (no auth, no email) |
| POST | `/payment/charge-payment-method` | `x-access-token` | Charge saved payment method |
| GET | `/payment/payment-methods` | `x-access-token` | List user's payment methods |
| DELETE | `/payment/payment-methods/:id` | `x-access-token` | Delete payment method |
| POST | `/payment/payment-methods/:id/set-default` | `x-access-token` | Set default payment method |
| POST | `/payment/setup-intent` | `x-access-token` | Create setup intent for card |
| POST | `/payment/payment-methods/confirm` | `x-access-token` | Confirm payment method |

---

#### Other Internal Controllers

| Controller | Base Route | Source | Auth | Notes |
|------------|-----------|--------|------|-------|
| `HealthInfoController` | `/health-info` | [src/health-info/health-info.controller.ts](../../health-info/health-info.controller.ts) | `x-access-token` | Health info CRUD |
| `MailController` | `/mail` | [src/mail/mail.controller.ts](../../mail/mail.controller.ts) | None | Inbound email webhook |
| `PractitionerController` | `/practitioners` | [src/practitioner/practitioner.controller.ts](../../practitioner/practitioner.controller.ts) | `x-access-token` | Practitioner CRUD |
| `QueueController` | `/queues` | [src/queues/controllers/queue.controller.ts](../../queues/controllers/queue.controller.ts) | `x-access-token` | Queue stats, pause/resume |
| `JobController` | `/jobs/run` | [src/queues/controllers/job.controller.ts](../../queues/controllers/job.controller.ts) | `x-access-token` | Manual job triggers |
| `ReportingController` | `/reporting` | [src/reporting/reporting.controller.ts](../../reporting/reporting.controller.ts) | `x-access-token` | Report generation |
| `ScriptKitController` | `/script/kit` | [src/scripts/controllers/kit.controller.ts](../../scripts/controllers/kit.controller.ts) | `x-access-token` | Admin kit scripts |
| `ScriptMigrationController` | `/script/migrate` | [src/scripts/controllers/migration.controller.ts](../../scripts/controllers/migration.controller.ts) | `x-access-token` | Admin migrations |
| `SupportController` | `/supports` | [src/support/support.controller.ts](../../support/support.controller.ts) | `x-access-token` | Support tickets |
| `SampleReportController` | `/sample-reports` | [src/testkit-sample-reports/controllers/sample-report.controller.ts](../../testkit-sample-reports/controllers/sample-report.controller.ts) | `x-access-token` | Sample reports |
| `TutorialController` | `/tutorials` | [src/tutorials/tutorial.controller.ts](../../tutorials/tutorial.controller.ts) | `x-access-token` | Tutorial content |
| `UserController` | `/users` | [src/user/user.controller.ts](../../user/user.controller.ts) | `x-access-token` | User management |
| `ValidKitController` | `/validKits` | [src/validKit/valid-kit.controller.ts](../../validKit/valid-kit.controller.ts) | `x-access-token` | Kit validation |

---

### External API Controllers

#### AuthExternalController (`/external/auth`)
**Source:** [src/auth-external/auth-external.controller.ts](../../auth-external/auth-external.controller.ts)
**Auth:** None (public)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/external/auth` | Authenticate external client → JWT |

---

#### OrderExternalController (`/external/orders`)
**Source:** [src/order-external/order-external.controller.ts](../../order-external/order-external.controller.ts)
**Auth:** `x-api-key` or `x-access-token` (external)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/external/orders` | `x-access-token` | Create external order |
| GET | `/external/orders` | `x-access-token` | Get external orders (Elyxium) |

---

### Vaari Controllers

| Controller | Base Route | Source | Auth |
|------------|-----------|--------|------|
| `VaariCustomerProfilesController` | `/vaari/customer-profiles` | [src/vaari/controllers/customer-profiles.controller.ts](../../vaari/controllers/customer-profiles.controller.ts) | `x-access-token` |
| `VaariCustomerProfilesAdminController` | `/vaari/customer-profiles/admin` | [src/vaari/controllers/customer-profiles.admin.controller.ts](../../vaari/controllers/customer-profiles.admin.controller.ts) | `x-access-token` + `ADMIN` |
| `VaariUsageController` | `/vaari/usage` | [src/vaari/controllers/vaari-usage.controller.ts](../../vaari/controllers/vaari-usage.controller.ts) | `x-access-token` |

---

### Replacement Kit Controllers

#### AdminReplacementKitController (`/admin/replacement-kit-requests`)
**Source:** [src/admin/admin-replacement-kit.controller.ts](../../admin/admin-replacement-kit.controller.ts)
**Auth:** `x-access-token`
**Guards:** `ThrottlerGuard`, `RolesGuard` (ADMIN, SUPER_ADMIN)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/admin/replacement-kit-requests` | Create replacement kit request for practitioner |
| GET | `/admin/replacement-kit-requests` | List all replacement kit requests (optional `?status=` filter) |

**Query Parameters:**
- `status` (optional): Filter by status (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, `EXPIRED`)

---

#### PractitionerReplacementKitController (`/practitioner/replacement-kit-requests`)
**Source:** [src/practitioner/practitioner-replacement-kit.controller.ts](../../practitioner/practitioner-replacement-kit.controller.ts)
**Auth:** `x-access-token`
**Guards:** `ThrottlerGuard`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/practitioner/replacement-kit-requests` | List practitioner's own replacement kit requests |
| POST | `/practitioner/replacement-kit-requests/:id/pay` | Generate Stripe checkout link for payment |

**Response (pay endpoint):**
```json
{
  "status": "success",
  "message": "Checkout link generated",
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/..."
  }
}
```

See [Replacement Kits Domain](../domains/replacement-kits.md) for full flow documentation.

---

## Webhooks

| Endpoint | Handler | Validation | Events | Source |
|----------|---------|------------|--------|--------|
| `POST /api/v1/payment/webhook` | `PaymentController.paymentWebhook` | Stripe signature (`stripe-signature` header) via `STRIPE_WEBHOOK_HASH` | `checkout.session.completed`, `payment_intent.canceled`, `invoice.payment_succeeded`, `invoice.finalization_failed`, `invoice.payment_failed` | [src/payment/services/stripe/payment-webhook.ts](../../payment/services/stripe/payment-webhook.ts) |
| `POST /api/v1/mail/inbound` | `MailController.handleInboundMail` | None | Inbound email from Mailgun/Postmark | [src/mail/mail.controller.ts](../../mail/mail.controller.ts) |

### Stripe Webhook Side Effects

**`checkout.session.completed`:**

The handler routes based on `metadata.paymentType` or `client_reference_id`:

| Payment Type | Detection | Side Effects |
|--------------|-----------|--------------|
| **Replacement Kit** | `paymentType=KIT_REPLACEMENT_ORDER` or `referenceId` starts with `repl_` | 1. Update `KitReplacementRequest.status` → `PAID`, set `paymentSessionId`, `paymentDate`<br>2. Update `Order.status` → `Paid`, set amounts<br>3. Update `Transaction.status` → `Successful` |
| **Standard Order** | `client_reference_id` present | Update existing order and transaction |
| **New Order** | No reference ID | Create new order from session data |

**Source:** [src/payment/services/stripe/checkout-session-completed.service.ts](../../payment/services/stripe/checkout-session-completed.service.ts)

**`invoice.payment_succeeded`:**
- Update `PaymentStatement.status` → `Paid`
- Record payment in transaction history

**`invoice.payment_failed`:**
- Update `PaymentStatement.status` → `PaymentFailed`
- Trigger retry logic if within retry window

---

## Server-Sent Events (SSE)

| Route | Controller | Auth | Query Params | Purpose |
|-------|-----------|------|--------------|---------|
| `GET /api/v1/sse/health-info/stream` | `HealthInfoSseController` | None | `kitId` (required), `userId` (required) | Real-time health info updates |
| `GET /api/v1/sse/vaari-analysis/stream` | `VaariAnalysisSseController` | None | `kitId` (required) | Real-time Vaari analysis |

**SSE Events (Health Info):**
- `connected` - Connection established
- `kit_state` - Current state snapshot
- `user_joined` - Another user connected
- `user_left` - User disconnected
- `response_updated` - Questionnaire response changed
- `room_info` - Room connection info
- `ping` - Heartbeat (every 25s)

**SSE Events (Vaari Analysis):**
- `connected` - Connection established
- `analysis_state` - Current analysis snapshot
- `analysis_updated` - Analysis data changed
- `analysis_generation_started` - Generation started
- `analysis_generation_completed` - Generation finished
- `analysis_generation_failed` - Generation failed
- `ping` - Heartbeat (every 25s)

**REST Actions (Health Info):**
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/sse/health-info/add_question_response` | Add single response |
| POST | `/sse/health-info/add_bulk_responses` | Add multiple responses |
| POST | `/sse/health-info/set_submitted` | Mark as submitted |
| POST | `/sse/health-info/set_agreement` | Set terms acceptance |
| POST | `/sse/health-info/reset_response` | Clear all responses |
| POST | `/sse/health-info/get` | Broadcast current state |
| POST | `/sse/health-info/get_room_info` | Broadcast room info |

**REST Actions (Vaari Analysis):**
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/sse/vaari-analysis/generate` | Start analysis generation |
| POST | `/sse/vaari-analysis/get` | Broadcast current analysis |
| POST | `/sse/vaari-analysis/update` | Update analysis data |
| POST | `/sse/vaari-analysis/delete` | Delete analysis |

**Source:**
- [src/health-info/health-info-sse.controller.ts](../../health-info/health-info-sse.controller.ts)
- [src/vaari/controllers/vaari-analysis-sse.controller.ts](../../vaari/controllers/vaari-analysis-sse.controller.ts)

---

## WebSocket Gateways

| Gateway | Namespace | Source | Client Events | Server Events |
|---------|-----------|--------|---------------|---------------|
| `HealthInfoGateway` | `/health-info` | [src/health-info/health-info.gateway.ts](../../health-info/health-info.gateway.ts) | `join_kit`, `ping` | `connected`, `kit_state`, `user_joined`, `user_left`, `error`, `pong` |
| `VaariAnalysisGateway` | `/vaari-analysis` | [src/vaari/gateways/vaari-analysis.gateway.ts](../../vaari/gateways/vaari-analysis.gateway.ts) | `join_kit`, `generate_analysis`, `get_analysis`, `update_analysis`, `delete_analysis`, `get_room_info`, `ping` | `connected`, `analysis_state`, `user_joined`, `user_left`, `analysis_generation_started`, `analysis_generation_completed`, `analysis_generation_failed`, `analysis_updated`, `room_info`, `error`, `pong` |

**Connection Example:**
```javascript
// Connect to Vaari Analysis WebSocket
const socket = io('wss://api.example.com/vaari-analysis', {
  transports: ['websocket', 'polling']
});

socket.emit('join_kit', { kitId: 'kit-uuid' });
socket.on('analysis_state', (data) => console.log(data));
```

---

## Cron Jobs

**Source:** [src/cron/cron.service.ts](../../cron/cron.service.ts), [src/billing/services/billing-scheduler.service.ts](../../billing/services/billing-scheduler.service.ts)

| Schedule | Method | Purpose | Enqueues Job |
|----------|--------|---------|--------------|
| Every hour | `handleEveryHourTasks` | Reconcile processing statements | `RECONCILE_PROCESSING` |
| `MONTHLY_BILLING_CRON` (default: `0 */2 25-28 * *`) | `handleMonthlyBillingTasks` | Monthly billing cycle | Direct service call |
| Every 5 minutes | `handleHealthInfoSync` | Health info sync | `HEALTH_INFO_SYNC` |
| Every 5 minutes | `handleHealthInformationDispatch` | Health info dispatch | Direct service call |

**Billing Scheduler Logic:**
- Day = `BILLING_PERIOD_START_DAY - 1`: Run `monthlyBillingService.processBillingDay()`
- Day >= `BILLING_PERIOD_START_DAY` and <= `BILLING_PERIOD_START_DAY + 2`: Run `paymentRetryService.processRetryDay()`
- Outside window: No action

---

## Queue Jobs

**Queues:** 7 total ([src/queues/types/queue.types.ts](../../queues/types/queue.types.ts))

| Queue Name | Job Types |
|------------|-----------|
| `test` | `TEST_REPORT` |
| `stripe` | `UPSERT_CHECKOUT_SESSIONS`, `ENRICH_TRANSACTIONS_FROM_SESSIONS`, `PROCESS_PAYMENT_METHOD`, `FIX_ORDER_PAYMENT_URLS`, `SYNC_STRIPE_PRICES` |
| `health` | `HEALTH_INFO_SYNC`, `HEALTH_INFORMATION_DISPATCH` |
| `billing` | `RECONCILE_PROCESSING`, `PROCESS_INVOICE_PAYMENT` |
| `billing-access` | `PROCESS_BILLING_ACCESS_FILE` |
| `kit` | `AUTO_REGISTER_PRACTITIONER_ORDER_KITS`, `HEALTH_INFORMATION_DISPATCH` |
| `mail` | `SendMail`, `SendMailWithTemplate`, `SendInitialSupportMail`, `SendSupportMail` |

See [Queue Jobs Reference](../platform/queue-jobs-reference.md) for full details.

---

## CLI Commands

**Trigger:** `RUN_COMMAND=true yarn start:cli <command>`

| Command | Handler | Source | Description |
|---------|---------|--------|-------------|
| `generate:kit <count> <version>` | `GenerateKitCommand` | [src/cli/services/genarate-kit.ts](../../cli/services/genarate-kit.ts) | Generate kit batches |
| `sync:stripe-prices [-p priceIds]` | `SyncStripePricesCommand` | [src/cli/commands/sync-stripe-prices.ts](../../cli/commands/sync-stripe-prices.ts) | Sync Stripe prices to DB |

---

## Admin Interfaces

| Interface | URL | Auth | Source |
|-----------|-----|------|--------|
| Swagger (Internal) | `/docs` | Basic auth (`SWAGGER_USER`/`SWAGGER_PASS`) | [src/main.ts:54-56](../../main.ts) |
| Swagger (External) | `/api/docs/external` | None | [src/main.ts:70](../../main.ts) |
| Bull Board | `/v1/admin/queues` | Basic auth | [src/main.ts:73](../../main.ts) |
