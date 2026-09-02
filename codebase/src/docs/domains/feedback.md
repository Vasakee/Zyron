# Domain: Feedback

Scope: feedback submissions and retrieval.

## Source of truth
- Controller: `src/feedback/feedback.controller.ts`
- Entity: `src/feedback/entity/feedback.entity.ts`

## Endpoint details (internal)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/feedback` | none | `CreateFeedbackDto` | Submit feedback. |
| GET | `/api/v1/feedback` | `x-access-token` | `PageOptionsDto`, `FeedBackQueryDto` | List feedback. |

## Endpoint details (external)

None documented.

## Schemas (DTOs)

CreateFeedbackDto:
```json
{
  "referenceEmail": "ref@example.com",
  "sessionId": "session-id",
  "satisfaction": 5,
  "code": "PROMO",
  "awarenessChannel": "instagram",
  "source": "web"
}
```

FeedBackQueryDto:
```json
{
  "searchQuery": "jane@example.com"
}
```

## Examples

Submit feedback:
```http
POST /api/v1/feedback
Content-Type: application/json

{
  "message": "Great experience"
}
```

## Error cases
- 400 validation errors.
- 401 for listing feedback without token.

## Related docs
- Internal endpoints: `src/docs/api/internal-endpoints.md`
