# Domain: Billing

Scope: recurring billing cycles, statement processing, and payment retries.

## Source of truth
- Module: `src/billing/billing.module.ts`
- Services: `src/billing/services/*`
- Queue processors: `src/queues/processors/*`
- Cron scheduler: `src/cron/cron.service.ts`

## Endpoint details (internal)
- No direct billing controller; billing is driven by cron and queue jobs.
- Reporting endpoints under `src/reporting/reporting.controller.ts` expose billing statements and summaries.

## Endpoint details (external)

None documented.

## Schemas (DTOs)

None documented.

## Examples

Monthly billing is triggered by cron:
- `MONTHLY_BILLING_CRON` configured in env
- Scheduler in `src/cron/cron.service.ts`

## Error cases
- Billing not running: check `MONTHLY_BILLING_CRON` and queue health.

## Related docs
- Reporting: `src/docs/domains/reporting.md`
- Queues and cron: `src/docs/platform/queues-and-cron.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
