# API Endpoints Index

Goal: a fast map of controllers and base routes. Use Swagger for full request/response details.

## Source of truth
- Controllers: `src/**/**.controller.ts`
- Swagger: `/docs` (internal), `/api/docs/external` (external)
- Internal endpoint details: `src/docs/api/internal-endpoints.md`

## Internal API controllers
- `src/app.controller.ts`: `/api/v1`
- `src/admin/admin.controller.ts`: `/api/v1/admins`
- `src/auth/auth.controller.ts`: `/api/v1/auth`
- `src/contact-message/contact-message.controller.ts`: `/api/v1/contacts`
- `src/feedback/feedback.controller.ts`: `/api/v1/feedback`
- `src/health-info/health-info.controller.ts`: `/api/v1/health-info`
- `src/health-info/health-info-sse.controller.ts`: `/api/v1/sse/health-info`
- `src/kit/kit.controller.ts`: `/api/v1/kits`
- `src/mail/mail.controller.ts`: `/api/v1/mail`
- `src/order/order.controller.ts`: `/api/v1/orders`
- `src/payment/controllers/payment.controller.ts`: `/api/v1/payment`
- `src/practitioner/practitioner.controller.ts`: `/api/v1/practitioners`
- `src/queues/controllers/job.controller.ts`: `/api/v1/jobs/run`
- `src/queues/controllers/queue.controller.ts`: `/api/v1/queues`
- `src/reporting/reporting.controller.ts`: `/api/v1/reporting`
- `src/scripts/controllers/kit.controller.ts`: `/api/v1/script/kit`
- `src/scripts/controllers/migration.controller.ts`: `/api/v1/script/migrate`
- `src/support/support.controller.ts`: `/api/v1/supports`
- `src/testkit-sample-reports/controllers/sample-report.controller.ts`: `/api/v1/sample-reports`
- `src/tutorials/tutorial.controller.ts`: `/api/v1/tutorials`
- `src/user/user.controller.ts`: `/api/v1/users`
- `src/validKit/valid-kit.controller.ts`: `/api/v1/validKits`
- `src/vaari/controllers/customer-profiles.controller.ts`: `/api/v1/vaari/customer-profiles`
- `src/vaari/controllers/customer-profiles.admin.controller.ts`: `/api/v1/vaari/customer-profiles/admin`
- `src/vaari/controllers/vaari-usage.controller.ts`: `/api/v1/vaari/usage`
- `src/vaari/controllers/vaari-analysis-sse.controller.ts`: `/api/v1/sse/vaari-analysis`

## External API controllers
- `src/auth-external/auth-external.controller.ts`: `/api/v1/external/auth`
- `src/order-external/order-external.controller.ts`: `/api/v1/external/orders`

## Webhooks
- Stripe: `/api/v1/payment/webhook` (`src/payment/controllers/payment.controller.ts`)
- Inbound mail: `/api/v1/mail/inbound` (`src/mail/mail.controller.ts`)

## Admin tooling
- Bull Board: `/v1/admin/queues` (mounted in `src/main.ts`)
