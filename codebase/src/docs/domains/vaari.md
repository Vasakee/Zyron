# Domain: Vaari

Scope: customer profiles, usage analytics, and SSE streams.

## Source of truth
- Controllers: `src/vaari/controllers/*.ts`
- Services: `src/vaari/services/*`
- Entities: `src/vaari/entity/customer-profile.entity.ts`, `src/vaari/entity/vaari-usage-event.entity.ts`

## Endpoint details (internal)

Customer profiles:

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/vaari/customer-profiles` | `x-access-token` | `CreateCustomerProfileDto` | Create profile. |
| GET | `/api/v1/vaari/customer-profiles` | `x-access-token` | `PageOptionsDto`, `search` | List profiles for user. |
| GET | `/api/v1/vaari/customer-profiles/:id` | `x-access-token` | path param | Get profile by id. |
| GET | `/api/v1/vaari/customer-profiles/kit/:kitId` | `x-access-token` | path param | Get profile by kit id. |
| PATCH | `/api/v1/vaari/customer-profiles/:kitId/status` | `x-access-token` | `UpdateCustomerProfileStatusDto` | Update status. |
| GET | `/api/v1/vaari/customer-profiles/check-kit-validity/:kitId` | `x-access-token` | path param | Check kit validity. |
| DELETE | `/api/v1/vaari/customer-profiles/:id` | `x-access-token` | path param | Delete profile. |

Customer profiles (admin):

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/vaari/customer-profiles/admin` | `x-access-token` | `CreateCustomerProfileDto` | Admin create profile. |
| GET | `/api/v1/vaari/customer-profiles/admin/check-kit-validity/:kitId` | `x-access-token` | path param | Check kit validity. |
| GET | `/api/v1/vaari/customer-profiles/admin/all` | `x-access-token` | `PageOptionsDto`, `search` | List all profiles. |
| PATCH | `/api/v1/vaari/customer-profiles/admin/:kitId/status` | `x-access-token` | `UpdateCustomerProfileStatusDto` | Update status. |

Usage analytics:

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/vaari/usage/weekly` | `x-access-token` | none | Weekly summary for current user. |
| GET | `/api/v1/vaari/usage/analytics/series` | `x-access-token` | `UsageSeriesDto` | Usage series charts. |
| GET | `/api/v1/vaari/usage/analytics/table` | `x-access-token` | `UsageTableQueryDto` | Admin usage table. |
| POST | `/api/v1/vaari/usage` | `x-access-token` | `CreateUsageDto` | Create usage record. |
| GET (SSE) | `/api/v1/vaari/usage/events` | none | none | SSE stream. |

Vaari analysis SSE:

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/sse/vaari-analysis/stream` | none | `kitId` query | SSE stream. |
| POST | `/api/v1/sse/vaari-analysis/generate` | none | {kitId} | Set generating status and broadcast. |
| POST | `/api/v1/sse/vaari-analysis/get` | none | {kitId} | Push current analysis state. |
| POST | `/api/v1/sse/vaari-analysis/update` | none | {kitId, analysis} | Update analysis state. |
| POST | `/api/v1/sse/vaari-analysis/delete` | none | {kitId} | Delete analysis state. |

## Endpoint details (external)

None documented.

## Schemas (DTOs)

CreateCustomerProfileDto:
```json
{
  "clientName": "John Doe",
  "kitId": "KIT12345",
  "reportReleaseDate": "2025-08-19T10:00:00Z",
  "vaariAnalysisDate": "2025-08-20T12:00:00Z",
  "status": "pending"
}
```

UpdateCustomerProfileStatusDto:
```json
{
  "status": "processed",
  "vaariAnalysisDate": "2025-08-20T12:00:00Z"
}
```

UsageSeriesDto:
```json
{
  "granularity": "daily",
  "fromIso": "2024-01-01",
  "toIso": "2024-01-31"
}
```

UsageTableQueryDto:
```json
{
  "search": "Smith",
  "page": 1,
  "take": 10
}
```

CreateUsageDto:
```json
{
  "kitId": "KIT12345"
}
```

## Examples

Create customer profile:
```http
POST /api/v1/vaari/customer-profiles
x-access-token: <jwt>
Content-Type: application/json

{
  "kitId": "K-123",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

SSE stream:
```http
GET /api/v1/sse/vaari-analysis/stream?kitId=<kitId>
```

## Error cases
- 400 for missing `kitId` or invalid payloads.
- 401 for missing/invalid `x-access-token` on protected endpoints.

## Related docs
- WebSocket/SSE: `src/docs/platform/websocket.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
