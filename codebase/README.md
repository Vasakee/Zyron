# Vitract Kit API v1

Backend API for the Vitract platform - microbiome test kit ordering, registration, billing, and health information management.

## What This Repo Owns

- **Orders & Kits** - Kit ordering (PAYG, monthly billing, on-site), registration, status tracking
- **Replacement Kits** - Admin-initiated kit replacements with practitioner payment flow
- **Payments & Billing** - Stripe integration, checkout sessions, monthly invoicing, payment retries
- **Health Info** - Sync and dispatch of health questionnaire data to/from external API
- **Users & Auth** - Google OAuth, JWT, API keys, admin/practitioner/customer roles
- **Support & Mail** - Contact forms, support tickets, transactional email (Postmark/Mailgun)
- **Vaari** - Customer profile management and analysis
- **Background Jobs** - Queue-based processing (Bull/Redis), cron jobs

## What This Repo Does NOT Own

- Frontend applications (admin portal, customer app, practitioner dashboard)
- External services: Stripe, Postmark, Mailgun, AWS S3, Google OAuth
- Lab systems (integrates via API key-authenticated endpoints)
- Questionnaire service (`VITRACT_QUESTIONAIRE_API_BASE_URL`)

## Quick Start

### Prerequisites

- Node.js 18+ (see `engines` in package.json)
- Yarn 4.x
- MSSQL database
- Redis server

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd vitract-kit-api-v1
yarn install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values (see src/docs/platform/env-vars.md for details)

# 3. Run migrations
yarn migration:run

# 4. Start development server
yarn start:dev
```

### Minimal Local Environment

```env
DATABASE_URL=mssql://user:pass@localhost:1433/vitract
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
NODE_ENV=development
ACCESS_KEY=your-jwt-secret
SECRET_KEY=your-secret
FRONTEND_URL=http://localhost:3001
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `yarn start:dev` | Development with hot reload |
| `yarn start:prod` | Production mode |
| `yarn build` | Build for production |
| `yarn test` | Run unit tests |
| `yarn test:e2e` | Run E2E tests |
| `yarn migration:run` | Run database migrations |
| `yarn migration:generate` | Generate migration from entity changes |
| `yarn start:cli` | Run CLI commands (with `RUN_COMMAND=true`) |

### CLI Commands

```bash
# Generate kits
RUN_COMMAND=true yarn start:cli generate:kit <count> <version>

# Sync Stripe prices
RUN_COMMAND=true yarn start:cli sync:stripe-prices
```

## Architecture

```
src/
├── admin/          # Admin management
├── auth/           # Google OAuth flow
├── auth-external/  # External client JWT auth
├── billing/        # Monthly billing scheduler
├── cli/            # CLI commands
├── common/         # Shared utilities, middleware, guards
├── config/         # Environment configuration
├── contact-message/# Contact form submissions
├── cron/           # Scheduled jobs
├── feedback/       # User feedback
├── health-info/    # Health questionnaire sync/dispatch
├── integrations/   # External API clients
├── kit/            # Kit management (22 routes)
├── mail/           # Email services (Postmark/Mailgun)
├── order/          # Order management (19 routes)
├── order-external/ # External order API
├── payment/        # Payments & Stripe (8 routes)
├── practitioner/   # Practitioner management
├── replacement-kit/# Replacement kit requests
├── queues/         # Bull queue processors
├── reporting/      # Report generation
├── scripts/        # Admin scripts
├── support/        # Support tickets
├── testkit-sample-reports/ # Sample reports
├── tutorials/      # Tutorial content
├── user/           # User management
├── vaari/          # Vaari analysis
└── validKit/       # Kit validation
```

## API Overview

| API Type | Base Path | Auth | Description |
|----------|-----------|------|-------------|
| Internal | `/api/v1/*` | `x-access-token` (JWT) | Main app API |
| External | `/api/v1/external/*` | `x-api-key` or `x-access-token` | Partner integrations |
| Webhooks | `/api/v1/payment/webhook`, `/api/v1/mail/inbound` | Stripe signature / None | Event handlers |
| Swagger (Internal) | `/docs` | Basic auth | Full API docs |
| Swagger (External) | `/api/docs/external` | None | Public API docs |
| Bull Board | `/v1/admin/queues` | Basic auth | Queue dashboard |

## Documentation

Start here: [src/docs/START-HERE.md](src/docs/START-HERE.md)

### Quick Links

- [Entrypoints Reference](src/docs/api/entrypoints-reference.md) - All HTTP routes, webhooks, cron, queues
- [Queue Jobs Reference](src/docs/platform/queue-jobs-reference.md) - Job types, processors, retry behavior
- [Environment Variables](src/docs/platform/env-vars.md) - Configuration reference
- [Error Catalog](src/docs/operations/error-catalog.md) - Common errors and fixes
- [Auth Flows](src/docs/architecture/auth-flows.md) - JWT, API key, OAuth diagrams

### Domain Docs

- [Kits](src/docs/domains/kits.md) | [Orders](src/docs/domains/orders.md) | [Replacement Kits](src/docs/domains/replacement-kits.md)
- [Payments](src/docs/domains/payments.md) | [Billing](src/docs/domains/billing.md) | [Health Info](src/docs/domains/health-info.md) | [Support](src/docs/domains/support.md)

### Full Index

See [src/docs/README.md](src/docs/README.md) for complete documentation index.

## Tech Stack

- **Framework:** NestJS 9.x
- **Database:** MSSQL (TypeORM)
- **Cache/Queues:** Redis (Bull)
- **Payments:** Stripe
- **Email:** Postmark, Mailgun
- **Storage:** AWS S3
- **Auth:** JWT, Google OAuth, API Keys
- **Monitoring:** Sentry

## Contributing

1. Create a feature branch from `main`
2. Follow existing code patterns
3. Run `yarn lint` and `yarn test` before committing
4. Create PR with clear description
