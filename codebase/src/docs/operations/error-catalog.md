# Error Catalog

## Overview

Common errors, likely causes, and safe mitigations. Use this alongside the runbook for fast triage.

## Where to Look

- App logs for request errors and stack traces.
- Sentry for production exceptions.
- Bull Board for background job failures.
- Provider dashboards (Stripe, Mailgun/Postmark) for delivery errors.

## Playbooks

### Auth

#### 401 Unauthorized (Internal JWT)
- Symptom: `{"status":"error","message":"Unauthorized"}` on `/api/v1/*` protected routes.
- Where to look: Request headers, `src/common/middleware/verify-token.middleware.ts`.
- Likely causes: Expired token, invalid `SECRET_KEY`, user deleted/deactivated, token format mismatch.
- Fix/Mitigation: Re-authenticate; verify `SECRET_KEY` matches deployments.
- Prevention: Token rotation policies; document header formats for clients.

#### 401 Unauthorized (External JWT)
- Symptom: 401 on `/api/v1/external/*` routes.
- Where to look: `src/common/middleware/verify-external-token.ts`.
- Likely causes: External token signed with wrong key or format.
- Fix/Mitigation: Re-issue external token; verify header format expected by middleware.
- Prevention: Align external token generation with middleware expectations.

#### 401 Unauthorized (API Key)
- Symptom: 401 on `PUT /api/v1/kits/external/status/:kitId`.
- Where to look: `src/common/middleware/api-key.middleware.ts`, `API_KEYS` env var.
- Likely causes: Missing `x-api-key`, malformed `API_KEYS`, key not in list.
- Fix/Mitigation: Add correct key to header; fix `API_KEYS` list.
- Prevention: Centralize external client key rotation and documentation.

#### 403 Forbidden
- Symptom: `{"status":"error","message":"Forbidden resource"}`.
- Where to look: Route guards (`@Roles()`), `MonthlyBillingAccessGuard`.
- Likely causes: Missing ADMIN/SUPER_ADMIN role, billing access not granted.
- Fix/Mitigation: Update user role or billing access list.
- Prevention: Keep role and billing access management documented.

### Database

#### MSSQL Connection Failed
- Symptom: App fails to boot; TypeORM connection errors.
- Where to look: App startup logs, `src/config/db.ts`.
- Likely causes: Invalid host/user/password/database/port, DB unreachable, network/firewall.
- Fix/Mitigation: Verify `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_PORT`.
- Prevention: Validate env vars at deploy time; monitor DB availability.

#### Migration Mismatch
- Symptom: Migration commands fail or schema drift.
- Where to look: Migration logs; migration table; `yarn typeorm migration:show`.
- Likely causes: Missing build artifacts, conflicting migrations, permissions.
- Fix/Mitigation: Run `yarn migration:run` after build; revert if needed with `yarn migration:revert`.
- Prevention: Enforce migration ordering and review before deploy.

#### Query Timeout or Deadlock
- Symptom: Requests hang or time out under load.
- Where to look: App logs, DB slow query/lock reports.
- Likely causes: Long-running queries, table locks, connection pool exhaustion.
- Fix/Mitigation: Identify the slow query; restart app if pool exhausted.
- Prevention: Add indexes; keep long transactions short.

### Redis/Bull

#### Redis Connection Refused
- Symptom: Jobs fail; queue processing halts.
- Where to look: App logs; Redis status; `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`.
- Likely causes: Redis down, wrong host/port, auth required.
- Fix/Mitigation: Restore Redis connectivity; update env vars.
- Prevention: Redis health checks and alerting.

#### Queue Backlog / Jobs Not Processing
- Symptom: Jobs stuck in waiting; no active workers.
- Where to look: Bull Board `/v1/admin/queues`; worker logs.
- Likely causes: Worker crash, queue paused, high job volume, Redis issues.
- Fix/Mitigation: Restart workers; resume queues; inspect failed jobs before retry.
- Prevention: Capacity planning; monitor job throughput and failures.

### Stripe

#### Webhook Signature Invalid
- Symptom: `POST /api/v1/payment/webhook` fails or throws.
- Where to look: Stripe Dashboard → Webhooks; app logs in `StripePaymentWebhook`.
- Likely causes: Wrong `STRIPE_WEBHOOK_HASH`, unexpected payload format.
- Fix/Mitigation: Update `STRIPE_WEBHOOK_HASH`; re-send event from Stripe dashboard.
- Prevention: Keep webhook secrets synced between environments.

#### Payment Processing Failures
- Symptom: Checkout completes but payment not recorded.
- Where to look: Stripe Dashboard → Payments; Bull Board `stripe` queue jobs.
- Likely causes: Invalid price IDs, customer missing, Stripe API key mismatch.
- Fix/Mitigation: Verify `STRIPE_API_KEY` and price IDs; retry affected queue jobs after verifying Stripe state.
- Prevention: Keep Stripe product/price IDs aligned with env config.

### Mail

#### Outbound Emails Not Sending
- Symptom: No emails received; mail jobs failing.
- Where to look: Bull Board `mail` queue; Postmark/Mailgun logs.
- Likely causes: Invalid `POSTMARK_API_TOKEN`/`MAILGUN_API_KEY`, unverified sender (`POSTMARK_VERIFIED_EMAIL`), template IDs invalid.
- Fix/Mitigation: Verify provider keys and template IDs; retry failed mail jobs.
- Prevention: Monitor provider delivery errors; validate templates on deploy.

#### Inbound Email Threading Fails
- Symptom: Replies do not create support threads.
- Where to look: `POST /api/v1/mail/inbound` logs; `ReceiveMessageService`.
- Likely causes: Missing `References` header; support messageId not found.
- Fix/Mitigation: Confirm inbound payload includes `References`; verify support record exists for messageId.
- Prevention: Keep provider inbound webhook configuration in sync.

### Reporting/S3

#### Reports Missing or Empty
- Symptom: Report download fails or file missing.
- Where to look: Reporting logs, S3 bucket configuration.
- Likely causes: Wrong `AWS_*`/`BUCKET_NAME`, upload failed.
- Fix/Mitigation: Verify S3 credentials and bucket; re-run report generation.
- Prevention: S3 access validation in deployment checks.

### Health-info

#### HEALTH_INFO_SYNC Jobs Failing
- Symptom: `HEALTH_INFO_SYNC` jobs fail in Bull Board.
- Where to look: Job logs; external API status.
- Likely causes: Invalid `VITRACT_QUESTIONAIRE_API_BASE_URL` or `VITRACT_REST_KEY`, upstream outage.
- Fix/Mitigation: Update API base URL/key; retry failed job.
- Prevention: Monitor upstream API uptime and rate limits.

#### HEALTH_INFORMATION_DISPATCH Jobs Failing
- Symptom: Dispatch jobs fail; emails not sent.
- Where to look: Job logs; related order/kit records.
- Likely causes: Missing order/practitioner/kit records, mail failures.
- Fix/Mitigation: Validate order/practitioner/kit records; check mail queue.
- Prevention: Ensure dispatch log creation is healthy before enqueueing.

### Common HTTP Errors

| Status | Meaning in this repo | Typical cause |
| --- | --- | --- |
| 400 | Validation failed | DTO validation errors or missing fields |
| 401 | Unauthorized | Missing/invalid JWT or API key |
| 403 | Forbidden | Role guard or billing access denied |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource constraint |
| 429 | Too Many Requests | ThrottlerGuard rate limit |
| 500 | Internal Server Error | Unhandled exception or dependency failure |

## SAFE Actions

- Retry failed jobs after reviewing their error details.
- Verify provider dashboard logs for Stripe/Mailgun/Postmark.
- Restart workers if queue processing is stalled.
- Run migration status checks (`yarn typeorm migration:show`).

## DANGEROUS Actions

- Manual data edits in MSSQL for payment/order state.
- Clearing active jobs or deleting Redis queue data.
- Forcing payment status changes without Stripe confirmation.

## References

- [Operations Runbook](./runbook.md)
- [Debugging Queues](./debugging-queues.md)
- [Debugging Webhooks](./debugging-webhooks.md)
- [Debugging Database](./debugging-database.md)
- [Observability](./observability.md)
