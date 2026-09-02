# Vitract Kit API Documentation

**Goal:** A new engineer can orient in 10 minutes.

**Start here:** [START-HERE.md](START-HERE.md) - Onboarding front door

---

## What This Repo Is

NestJS backend API for the Vitract microbiome testing platform:
- Kit ordering, registration, and lifecycle management
- Replacement kit requests (admin-initiated, practitioner payment)
- Payments (Stripe) and monthly billing
- Health information sync with external questionnaire API
- User management (customers, practitioners, admins)
- Support tickets and transactional email

## What It Owns

| Area | Location |
|------|----------|
| Domain logic | `src/*` (orders, kits, payments, billing, etc.) |
| Background jobs | `src/cron`, `src/queues` |
| Data model | `src/**/entity`, `src/common/migrations*` |
| API contracts | Controllers in each domain |

## What It Does NOT Own

- Frontend applications (admin portal, customer app, practitioner dashboard)
- External services: Stripe, Postmark/Mailgun, AWS S3, Google OAuth
- Lab systems (integrates via API key-authenticated endpoints)
- Questionnaire service (`VITRACT_QUESTIONAIRE_API_BASE_URL`)

---

## Quick Start

```bash
yarn install
cp .env.example .env
# Edit .env with DATABASE_URL, REDIS_HOST, etc.
yarn start:dev
```

See [Environment Variables](platform/env-vars.md) for complete configuration.

---

## Documentation Index

### Getting Started

| Doc | Description |
|-----|-------------|
| [START-HERE.md](START-HERE.md) | Onboarding front door - read this first |
| [Root README](../../README.md) | Project overview and quick start |

### API Reference

| Doc | Description |
|-----|-------------|
| [Entrypoints Reference](api/entrypoints-reference.md) | ALL routes, webhooks, SSE, cron, CLI |
| [Shared Contracts](api/shared-contracts.md) | Response envelope, auth headers, pagination, state machines |
| [Public API](api/public-api.md) | External API documentation |
| [Endpoints Index](api/endpoints-index.md) | Quick endpoint lookup |

### Architecture

| Doc | Description |
|-----|-------------|
| [Auth Flows](architecture/auth-flows.md) | JWT, API key, OAuth with diagrams |
| [Cross-Cutting Concerns](architecture/cross-cutting.md) | Guards, validation, error handling |
| [System Map](system-map.md) | High-level architecture |

### Platform

| Doc | Description |
|-----|-------------|
| [Queue Jobs Reference](platform/queue-jobs-reference.md) | Job types, data shapes, processors |
| [Queues and Cron](platform/queues-and-cron.md) | Background job overview |
| [Database Schema](platform/database-schema.md) | ER diagrams and entity reference |
| [Environment Variables](platform/env-vars.md) | Full configuration reference |

### Operations

| Doc | Description |
|-----|-------------|
| [Error Catalog](operations/error-catalog.md) | Common errors and fixes |
| [Deployment Runbook](operations/deployment-runbook.md) | Deploy, migrate, rollback |
| [Operations Runbook](operations/runbook.md) | Debugging guide |

### Domain Docs

| Domain | Description |
|--------|-------------|
| [Kits](domains/kits.md) | Kit registration and lifecycle |
| [Orders](domains/orders.md) | Order management |
| [Replacement Kits](domains/replacement-kits.md) | Admin-initiated kit replacements |
| [Payments](domains/payments.md) | Stripe integration |
| [Billing](domains/billing.md) | Monthly billing |
| [Health Info](domains/health-info.md) | Questionnaire sync |
| [Support](domains/support.md) | Support tickets |
| [Auth](domains/auth.md) | Authentication |
| [Users](domains/users.md) | User management |
| [Practitioners](domains/practitioners.md) | Practitioner accounts |
| [Vaari](domains/vaari.md) | Customer profiles |
| [Admin](domains/admin.md) | Admin management |
| [Mail](domains/mail.md) | Email services |
| [Reporting](domains/reporting.md) | Report generation |

### Integrations

| Integration | Description |
|-------------|-------------|
| [Stripe](integrations/stripe.md) | Payment processing |
| [Mailgun/Postmark](integrations/mailgun-postmark.md) | Email delivery |
| [S3](integrations/s3.md) | File storage |
| [Redis](integrations/redis.md) | Caching and queues |
| [Questionnaire API](integrations/questionnaire-api.md) | Health info |
| [Sentry](integrations/sentry.md) | Error tracking |
| [Google OAuth](integrations/google-oauth.md) | Authentication |

---

## Key Files Quick Reference

| What | Where |
|------|-------|
| App entry | [src/main.ts](../main.ts) |
| Global config | [src/config/keys.ts](../config/keys.ts) |
| All enums | [src/enum.ts](../enum.ts) |
| Queue types | [src/queues/types/queue.types.ts](../queues/types/queue.types.ts) |
| Cron jobs | [src/cron/cron.service.ts](../cron/cron.service.ts) |
| Base entity | [src/common/entity/base.entity.ts](../common/entity/base.entity.ts) |
| Response helpers | [src/common/utils/response.ts](../common/utils/response.ts) |

---

## External Links

| Link | Description |
|------|-------------|
| `/docs` | Swagger UI (internal, basic auth) |
| `/api/docs/external` | Swagger UI (external API) |
| `/v1/admin/queues` | Bull Board (queue dashboard) |
