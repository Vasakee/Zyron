# Domain: Reminders

Scope: reminder records and delivery status tracking.

## Source of truth
- Entity: `src/reminders/entity/reminder.entity.ts`
- Reminder flow: `src/order/service/waitlist-reminder.ts`

## Endpoint details (internal)
- No dedicated controller. Reminder actions are triggered by `GET /api/v1/orders/send-reminders`.

## Endpoint details (external)

None documented.

## Schemas (DTOs)

None documented.

## Examples

None documented.

## Error cases

None documented.

## Related docs
- Orders: `src/docs/domains/orders.md`
- Queues and cron: `src/docs/platform/queues-and-cron.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
