# Public API and Contracts

Goal: document the external interfaces other teams depend on.

You document:

* Public APIs
* Stable contracts
* Integration-facing endpoints
* Anything external teams depend on

Don’t manually write every endpoint doc. Instead:

* Use OpenAPI/Swagger generation if possible
* Add human notes only where needed (auth, edge cases, examples)

Files:

* `docs/api/public-api.md`
* or OpenAPI spec under `docs/openapi.yaml`

## Source of truth
- Swagger/OpenAPI is generated at runtime.
- Internal API docs: `/docs` (basic auth via `SWAGGER_USER`, `SWAGGER_PASS`).
- External API docs: `/api/docs/external` (includes only `AuthExternalModule` and `OrderExternalModule`).
- Endpoint index: `src/docs/api/endpoints-index.md`.

## External API overview
- Base path: `/api/v1` (global prefix in `src/main.ts`).
- External modules: `src/auth-external`, `src/order-external`.

## Stable contracts
Treat these modules as integration-facing and stable:
- `src/auth-external`
- `src/order-external`

Any breaking change here should include:
- Swagger updates (auto-generated)
- Release notes or a migration note in this doc

## How to access OpenAPI locally
1) Run the API: `yarn start:dev`
2) Open `/api/docs/external` for public endpoints
3) Use `/docs` for full internal API (requires basic auth)

## Authentication (external)
Source: `src/auth-external/auth-external.controller.ts`, `src/auth-external/auth-external.service.ts`,
`src/common/middleware/verify-external-token.ts`

- Token is required for external order endpoints.
- Header: `x-access-token`.
- Token is a JWT signed with `SECRET_KEY`.
- Token TTL is 10 hours (see `src/auth-external/dto/login-external-account.dto.ts`).

### POST `/api/v1/external/auth`
Authenticate external clients using `clientId` and `clientSecret` stored in `api-key`.

Request body:
- `clientId` (string, required)
- `clientSecret` (string, required)

Response body:
- `access_token` (string)
- `ttl` (number, seconds)

Error behavior:
- Returns 400 on invalid credentials (`Authentication failed!`).

Example request:
```json
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

## External Orders
Source: `src/order-external/order-external.controller.ts`, `src/order-external/services/*`

### POST `/api/v1/external/orders`
Creates a new external order. Requires `x-access-token` header.

Request body (required unless noted):
- `firstName`, `lastName`, `email` (string)
- `country` (string, only `United States`/`Canada` or `US`/`CA`)
- `addressLineOne`, `city`, `state`, `postalCode` (string)
- `quantity` (number, min 1)
- `kitType` (string, `gut-scan` or `deep-gut`)
- `paymentReferenceId` (string)
- `usePractitionerAccount` (boolean, optional)
- `practitionerEmail` (string, required when `usePractitionerAccount` is true)

Behavior notes:
- Orders are saved with `source = Elyxium` and `status = Paid`.
- When `usePractitionerAccount` is true, practitioner must exist or request fails.

Example request:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "country": "US",
  "addressLineOne": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "quantity": 1,
  "kitType": "gut-scan",
  "paymentReferenceId": "pi_12345"
}
```

Example response:
```json
{
  "message": "Order was created successfully",
  "code": 200,
  "status": "created",
  "data": {
    "id": "<order-id>",
    "email": "jane@example.com",
    "status": "paid",
    "kitType": "gut-scan",
    "quantity": 1
  }
}
```

### GET `/api/v1/external/orders`
Returns external orders for Elyxium integration. Requires `x-access-token` header.

Query params (all optional):
- `searchQuery` (string)
- `status` (string)
- `page` (number)
- `limit` (number)

Response includes:
- `result` (array of orders)
- `totalCount` (number)
- `counts` (array grouped by status)
- `pageMetaDto` (pagination metadata)

## Human notes (add as needed)
- Auth: external auth is handled in `src/auth-external`; note any auth flows or callback URLs here.
- Orders: external ordering endpoints live in `src/order-external`; note required headers and idempotency expectations here.

## Where to add future docs
- If you need a fixed spec file, export Swagger to `src/docs/openapi.yaml`.
- For extra examples, keep them in this file to avoid endpoint-by-endpoint duplication.
