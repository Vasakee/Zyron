# Architecture: Entrypoints

Answer: what can cause code in this repo to run?

### A) `docs/architecture/entrypoints.md`

A simple map of **how work enters the system**:

* HTTP controllers (internal vs external)
* webhooks (Stripe/Mailgun/Postmark)
* cron jobs
* queue processors
* websocket events (if any)

This answers: *“what can cause code in this repo to run?”*

## HTTP controllers
- Internal API controllers live across modules under `src/**/**.controller.ts`.
- External/public controllers are in `src/auth-external` and `src/order-external`.
- Global prefix is `api/v1` (see `src/main.ts`).
- Script and admin controllers exist under `src/scripts` and `src/queues` (manual/admin triggers).

## Webhooks
- Stripe: `POST /api/v1/payment/webhook` in `src/payment/controllers/payment.controller.ts`.
- Inbound email (Mailgun/Postmark): `POST /api/v1/mail/inbound` in `src/mail/mail.controller.ts`.

## Cron jobs
- Scheduler lives in `src/cron/cron.service.ts`.
- Hourly reconcile, monthly billing, and health-info sync/dispatch are triggered here.

## Queue processors
- Bull queue processors live in `src/queues/processors`.
- Jobs are enqueued by `src/queues/services/queue.service.ts` and cron.

## WebSocket events
- Health info gateway: `src/health-info/health-info.gateway.ts`.
- Vaari analysis gateway: `src/vaari/gateways/vaari-analysis.gateway.ts`.
- Shared base gateway utilities: `src/websocket/base`.

## CLI commands
- When `RUN_COMMAND=true`, Nest Commander runs from `src/main.ts` and exits.

## Admin tooling
- Bull Board: `/v1/admin/queues` router mounted in `src/main.ts`.
