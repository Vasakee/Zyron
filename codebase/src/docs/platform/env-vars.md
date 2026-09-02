# Environment Variables Reference

Complete reference for all environment variables.

**Source:** [src/config/keys.ts](../../config/keys.ts)
**Template:** [.env.example](../../../.env.example)

---

## Quick Start - Minimal Local Set

For local development, these are the minimum required variables:

```env
DATABASE_URL=mssql://sa:Password123@localhost:1433/vitract
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
NODE_ENV=development
ACCESS_KEY=your-jwt-secret-min-32-chars
SECRET_KEY=your-secret-min-32-chars
FRONTEND_URL=http://localhost:3001
```

---

## Variable Reference

### Core Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | HTTP server port |
| `NODE_ENV` | Yes | - | Environment: `development`, `production`, `staging` |
| `APP_NAME` | No | `Vitract` | Application name (used in emails) |

### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | MSSQL connection string: `mssql://user:pass@host:port/db` |
| `DB_LOGGING` | No | `false` | Enable SQL query logging (dev only) |

### Redis

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_HOST` | Yes | - | Redis server host |
| `REDIS_PORT` | Yes | - | Redis server port |
| `REDIS_PASSWORD` | No | - | Redis auth password |

### Authentication & JWT

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ACCESS_KEY` | Yes | - | JWT signing key for access tokens |
| `REFRESH_TOKEN_KEY` | Yes | - | JWT signing key for refresh tokens |
| `SECRET_KEY` | Yes | - | General secret key |
| `ACCESS_TOKEN_MAX_AGE` | No | `86400` | Access token expiry (seconds or string like `7d`) |
| `REFRESH_TOKEN_MAX_AGE` | No | `604800` | Refresh token expiry |
| `API_KEYS` | No | - | Comma-separated API keys for external integrations |

### Google OAuth

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | Yes* | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes* | - | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Yes* | - | OAuth callback URL |

*Required if Google login is enabled

### Frontend URLs

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FRONTEND_URL` | Yes | - | Main frontend app URL (for redirects, emails) |
| `WEBSITE_URL` | No | - | Public website URL |

### Stripe Payments

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STRIPE_API_KEY` | Yes* | - | Stripe API key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_WEBHOOK_HASH` | Yes* | - | Webhook signing secret (`whsec_...`) |
| `STRIPE_DASHBOARD_BASE_URL` | No | - | Stripe dashboard URL for links |

*Required if payments are enabled

**Price IDs (USD):**
| Variable | Description |
|----------|-------------|
| `STRIPE_USD_SINGLE_GUT_TEST_PRICE_ID` | Single gut test price |
| `STRIPE_USD_FIRST_DEEP_GUT_TEST_PRICE_ID` | First deep gut test price |
| `STRIPE_USD_SECOND_DEEP_GUT_TEST_PRICE_ID` | Second deep gut test price |
| `STRIPE_USD_DEEP_GUT_TEST_PRICE_ID` | Deep gut test price |

**Price IDs (CAD):**
| Variable | Description |
|----------|-------------|
| `STRIPE_CAD_SINGLE_GUT_TEST_PRICE_ID` | Single gut test price (CAD) |
| `STRIPE_CAD_FIRST_DEEP_GUT_TEST_PRICE_ID` | First deep gut test price (CAD) |
| `STRIPE_CAD_SECOND_DEEP_GUT_TEST_PRICE_ID` | Second deep gut test price (CAD) |
| `STRIPE_CAD_DEEP_GUT_TEST_PRICE_ID` | Deep gut test price (CAD) |

**Payment Methods:**
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MAX_PAYMENT_METHODS` | No | `3` | Max saved payment methods per user |
| `SAVE_CARD_PAYMENT_METHOD_CONFIGURATION_ID` | No | - | Stripe PM configuration ID |

### Billing Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BILLING_PERIOD_START_DAY` | No | `26` | Day of month billing period starts |
| `BILLING_PERIOD_END_DAY` | No | `25` | Day of month billing period ends |
| `RETRY_PERIOD_END_DAY` | No | `28` | Last day for payment retries |
| `BILLING_CYCLE_LENGTH` | No | `30` | Billing cycle length in days |
| `PAYMENT_GRACE_PERIOD_DAYS` | No | `3` | Grace period before overdue |
| `INVOICE_DUE_DAYS` | No | `3` | Days until invoice is due |
| `PAYMENT_RETRY_MAX_ATTEMPTS` | No | `3` | Max payment retry attempts |
| `PAYMENT_RETRY_INTERVAL_DAYS` | No | `3` | Days between retries |
| `SYSTEM_TIME_ZONE` | No | `America/New_York` | Timezone for billing |

**Cron Schedules:**
| Variable | Default | Description |
|----------|---------|-------------|
| `MONTHLY_BILLING_CRON` | `0 */2 25-28 * *` | Monthly billing cron |
| `PAYMENT_RETRY_CRON` | - | Payment retry cron |
| `INVOICE_REMINDER_CRON` | - | Invoice reminder cron |

### Email - Postmark

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTMARK_API_TOKEN` | Yes* | - | Postmark API token |
| `POSTMARK_VERIFIED_EMAIL` | Yes* | - | Verified sender email |
| `POSTMARK_SUPPORT_EMAIL` | Yes* | - | Support email address |
| `VITRACT_SALES_EMAIL` | No | - | Sales email address |

*Required if Postmark is used

**Templates:**
| Variable | Description |
|----------|-------------|
| `POSTMARK_TEMPLATE_VITRACT_SINGLE_ID` | Single kit order template |
| `POSTMARK_TEMPLATE_VITRACT_UPDATE_SHIPPING_ID` | Shipping update template |
| `POSTMARK_TEMPLATE_VITRACT_PRACTITIONER_SINGLE_ID` | Practitioner kit template |

### Email - Mailgun

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MAILGUN_API_KEY` | Yes* | - | Mailgun API key |
| `MAILGUN_DOMAIN` | Yes* | - | Mailgun domain |

*Required if Mailgun is used

**Templates:**
| Variable | Description |
|----------|-------------|
| `MAILGUN_CUSTOMER_KIT_ORDER_TEMPLATE` | Customer kit order template |
| `MAILGUN_PRACTITIONER_KIT_ORDER_TEMPLATE` | Practitioner kit order template |
| `MAILGUN_ORDER_SHIPPED_TEMPLATE` | Order shipped template |
| `MAILGUN_CONTACT_MESSAGE_TEMPLATE` | Contact message template |

### AWS S3

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_ACCESS_KEY` | Yes* | - | AWS access key ID |
| `AWS_SECRET_KEY` | Yes* | - | AWS secret access key |
| `AWS_REGION` | Yes* | - | AWS region (e.g., `us-east-1`) |
| `BUCKET_NAME` | Yes* | - | S3 bucket name |
| `S3_ENDPOINT` | No | - | Custom S3 endpoint (for compatible services) |

*Required if S3 is used

### Health Info Integration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITRACT_QUESTIONAIRE_API_BASE_URL` | Yes* | - | Questionnaire API URL |
| `VITRACT_REST_KEY` | Yes* | - | Questionnaire API key |
| `HEALTH_INFO_DISPATCH_CUTOFF` | No | - | Cutoff time in minutes for health info dispatch eligibility |

*Required if health info sync is enabled

### Observability

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENTRY_DSN` | No | - | Sentry DSN for error tracking |

### Swagger Documentation

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SWAGGER_USER` | Yes | - | Swagger UI basic auth username |
| `SWAGGER_PASS` | Yes | - | Swagger UI basic auth password |

### Feature Flags & Misc

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RUN_COMMAND` | No | `false` | Set to `true` to run CLI mode |
| `PROMOTIONAL_CODE` | No | - | Active promotional code |
| `RETURN_LABEL_EMAIL_DELAY_MINUTES` | No | `30` | Delay before return label email |

---

## Feature Impact

### Disabling Features

If you don't need certain features, you can omit their env vars:

| Feature | Required Vars | Impact if Missing |
|---------|---------------|-------------------|
| Google OAuth | `GOOGLE_*` | Google login disabled |
| Stripe Payments | `STRIPE_*` | Payment routes fail |
| Postmark Email | `POSTMARK_*` | Uses Mailgun only |
| Mailgun Email | `MAILGUN_*` | Uses Postmark only |
| S3 Storage | `AWS_*`, `BUCKET_NAME` | File uploads fail |
| Health Info Sync | `VITRACT_QUESTIONAIRE_*` | Sync jobs fail |
| Sentry | `SENTRY_DSN` | No error tracking |

---

## Environment-Specific Notes

### Development

```env
NODE_ENV=development
DB_LOGGING=true
SENTRY_DSN=  # Optional, can be empty
```

### Staging

```env
NODE_ENV=staging
# Use test Stripe keys
STRIPE_API_KEY=sk_test_...
```

### Production

```env
NODE_ENV=production
# Use live Stripe keys
STRIPE_API_KEY=sk_live_...
# Ensure all required vars are set
# Never enable DB_LOGGING
```

---

## Validation

The app validates environment variables at startup. Missing required vars will cause startup failure with clear error messages.

Check [src/config/keys.ts](../../config/keys.ts) for the full list of imported variables.
