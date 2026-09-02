# Domain: Auth

Scope: internal Google OAuth and external token issuance.

## Source of truth
- Internal auth entrypoints: `src/auth/auth.controller.ts`, `src/auth/auth.service.ts`
- External auth entrypoints: `src/auth-external/auth-external.controller.ts`, `src/auth-external/auth-external.service.ts`
- External token verification: `src/common/middleware/verify-external-token.ts`
- Auth helpers: `src/common/utils` (token generation, hashing)

## Endpoint details (internal)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/auth/google` | none | none | Starts Google OAuth flow. |
| GET | `/api/v1/auth/google/callback` | none | none | OAuth callback; redirects/sets session. |

## Endpoint details (external)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/external/auth` | none | `clientId`, `clientSecret` | External auth; returns JWT + ttl. |

## Schemas (DTOs)

LoginExternalAccountDto:
```json
{
  "clientId": "elyxium-client",
  "clientSecret": "secret-value"
}
```

## Examples

External auth:
```http
POST /api/v1/external/auth
Content-Type: application/json

{
  "clientId": "elyxium-client",
  "clientSecret": "secret-value"
}
```

Example response:
```json
{
  "message": "Authentication successful",
  "code": 200,
  "status": "success",
  "data": {
    "username": "Elyxium",
    "access_token": "<jwt>",
    "ttl": 36000
  }
}
```

## Error cases
- 400 on invalid credentials (`Authentication failed!`).
- 401 if a downstream external endpoint receives an invalid `x-access-token`.

## Related docs
- Public API contracts: `src/docs/api/public-api.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
