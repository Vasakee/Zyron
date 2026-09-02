# System Map

Goal: people stop guessing where things live.

Include:

* Major domains (Orders, Kits, Practitioners, Reports, Billing, Auth…)
* External dependencies per domain
* Data stores involved
* “If you need X, go here”

This is not endpoint lists. It’s a “mental model map”.

## Major domains and dependencies

### Auth + Users
- Location: `src/auth`, `src/user`, `src/auth-external`
- External deps: Google OAuth, JWT token issuance
- Data stores: `user`, `api-key`, `transfer-log` entities

### Practitioners
- Location: `src/practitioner`
- External deps: none direct (auth and billing often intersect)
- Data stores: `practitioner`, `client-practitioner` entities

### Kits
- Location: `src/kit`, `src/validKit`
- External deps: questionnaire API for eligibility checks
- Data stores: `kit`, `family-kit`, `generated-kit` entities

### Orders + Shipping
- Location: `src/order`, `src/order-external`
- External deps: payment system, email notifications
- Data stores: `order`, `order-kit`, `shipping`, `shipping-package` entities

### Billing + Payments
- Location: `src/billing`, `src/payment`
- External deps: Stripe
- Data stores: `transaction`, `payment-method`, `stripe-checkout-session`, `payment-statement` entities
- Background: billing cron jobs (`src/cron`)

### Reporting
- Location: `src/reporting`, `src/testkit-sample-reports`
- External deps: email and S3 links for sample reports
- Data stores: report exports are generated from order/payment data

### Support + Contact
- Location: `src/support`, `src/contact-message`, `src/mail`
- External deps: Mailgun/Postmark inbound and outbound email
- Data stores: `support`, `support-message`, `contact-message` entities

### Feedback
- Location: `src/feedback`
- External deps: none
- Data stores: `feedback` entity

### Tutorials
- Location: `src/tutorials`
- External deps: S3 for assets
- Data stores: `tutorial` entity

### Health Info
- Location: `src/health-info`, `src/integrations/health-info.client.ts`
- External deps: Vitract Questionnaire API
- Data stores: health info entities

### Vaari
- Location: `src/vaari`
- External deps: none direct (uses internal data + SSE)
- Data stores: `customer-profile`, `vaari-usage-event` entities

### Admin + Ops
- Location: `src/admin`, `src/dashboard`, `src/queues`, `src/cron`, `src/scripts`, `src/cli`
- External deps: Redis for queues, Bull Board at `/v1/admin/queues`
- Data stores: queue state in Redis

### Providers + Reminders
- Location: `src/provider`, `src/reminders`
- External deps: none
- Data stores: `provider`, `provider-account`, `reminder` entities

## Data stores
- MSSQL via TypeORM (`src/config/db.ts`)
- Redis for queues/cache (`REDIS_HOST`, `REDIS_PORT`)
- S3 for static assets and sample reports (`BUCKET_NAME`, `S3_ENDPOINT`)

## If you need X, go here
- Add or change user auth: `src/auth`, `src/auth-external`
- Work with practitioners: `src/practitioner`
- Work with kits: `src/kit`, `src/validKit`
- Order flows or external ordering: `src/order`, `src/order-external`
- Payments/billing logic: `src/payment`, `src/billing`
- Reports and exports: `src/reporting`, `src/testkit-sample-reports`
- Support or inbound email: `src/support`, `src/mail`
- Feedback: `src/feedback`
- Tutorials: `src/tutorials`
- Contact messages: `src/contact-message`
- Background jobs/queues: `src/cron`, `src/queues`, `src/dashboard`
- Health info sync/dispatch: `src/health-info`, `src/integrations/health-info.client.ts`
- Vaari features: `src/vaari`
- Scripts/CLI: `src/scripts`, `src/cli`
