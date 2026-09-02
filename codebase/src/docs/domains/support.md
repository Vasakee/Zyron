# Domain: Support

Scope: support cases and threaded support messages.

## Source of truth
- Controller: `src/support/support.controller.ts`
- Entities: `src/support/entity/support.entity.ts`, `src/support/entity/support-message.entity.ts`
- Mail handling: `src/mail/*`

## Endpoint details (internal)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/supports` | `x-access-token` | `SupportDto` | Create support case. |
| GET | `/api/v1/supports` | `x-access-token` | `PageOptionsDto`, `SupportQueryDto` | List cases. |
| GET | `/api/v1/supports/:id` | `x-access-token` | none | Get case by id. |
| PUT | `/api/v1/supports/:id` | `x-access-token` | `UpdateSupportDto` | Update case status. |
| PUT | `/api/v1/supports/assign/:id` | `x-access-token` | `UpdateSupportDto` | Assign case. |
| POST | `/api/v1/supports/messages` | `x-access-token` | `SupportMessageDto` | Send support message. |

## Endpoint details (external)

None documented.

## Schemas (DTOs)

SupportDto:
```json
{
  "message": "Tracking not updating",
  "subject": "Shipping update"
}
```

SupportQueryDto:
```json
{
  "searchQuery": "tracking",
  "status": "open",
  "priority": "high",
  "assignedTo": "admin-id",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31"
}
```

SupportMessageDto:
```json
{
  "content": "We are investigating.",
  "supportId": "support-id"
}
```

## Examples

Create case:
```http
POST /api/v1/supports
x-access-token: <jwt>
Content-Type: application/json

{
  "subject": "Shipping update",
  "message": "Tracking not updating"
}
```

## Error cases
- 401 for missing/invalid `x-access-token`.
- 400 validation errors.

## Related docs
- Mail: `src/docs/domains/mail.md`
- Operations runbook: `src/docs/operations/runbook.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
