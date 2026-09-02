# Domain: Health Info

Scope: health info responses, submission status, and SSE updates.

## Source of truth
- Controllers: `src/health-info/health-info.controller.ts`, `src/health-info/health-info-sse.controller.ts`
- Gateway: `src/health-info/health-info.gateway.ts`
- Integration client: `src/integrations/health-info.client.ts`
- Queue processors: `src/queues/processors/health-info-*.processor.ts`

## Endpoint details (internal)

Health info REST:

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/health-info/:kitId` | none | path param | Get questionnaire responses. |
| POST | `/api/v1/health-info/response` | none | `addQuestionResponseDto` | Add response. |
| POST | `/api/v1/health-info/submitted` | none | `setSubmittedDto` | Set submitted status. |
| POST | `/api/v1/health-info/agreement` | none | `SetAgreementDto` | Store agreement status. |

Health info SSE:

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/sse/health-info/stream` | none | `kitId`, `userId` query | SSE stream. |
| POST | `/api/v1/sse/health-info/add_question_response` | none | {kitId, categoryId, questionResponse, completed?, userId?} | Update cached response. |
| POST | `/api/v1/sse/health-info/add_bulk_responses` | none | {kitId, responses, userId?} | Bulk update. |
| POST | `/api/v1/sse/health-info/set_submitted` | none | {kitId, submitted, userId?} | Set submitted flag. |
| POST | `/api/v1/sse/health-info/set_agreement` | none | {kitId, acceptedTerms?, acceptedPolicy?, userId?} | Set agreement. |
| POST | `/api/v1/sse/health-info/reset_response` | none | {kitId, userId?} | Reset response state. |
| POST | `/api/v1/sse/health-info/get` | none | {kitId} | Push current state to SSE. |
| POST | `/api/v1/sse/health-info/get_room_info` | none | {kitId} | Push room info. |

## Endpoint details (external)

None documented.

## Schemas (DTOs)

addQuestionResponseDto:
```json
{
  "kitId": "KIT-123",
  "categoryId": 1,
  "completed": false,
  "questionResponse": {
    "KitId": "KIT-123",
    "questionId": 10,
    "answers": [
      {
        "questionItemId": 1,
        "selectedOption": "yes",
        "text": "Optional text",
        "date": "2024-01-01",
        "selectedOptions": ["a", "b"]
      }
    ]
  }
}
```

setSubmittedDto:
```json
{
  "kitId": "KIT-123",
  "submitted": true
}
```

SetAgreementDto:
```json
{
  "kitId": "KIT-123",
  "acceptedTerms": true,
  "acceptedPolicy": true
}
```

## Examples

Get kit responses:
```http
GET /api/v1/health-info/<kitId>
```

SSE stream:
```http
GET /api/v1/sse/health-info/stream?kitId=<kitId>&userId=<userId>
```

## Error cases
- 400 if required fields are missing (e.g., `kitId`).

## Related docs
- Questionnaire API integration: `src/docs/integrations/questionnaire-api.md`
- WebSocket/SSE: `src/docs/platform/websocket.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
