# Swagger Reconciliation (Phase 5)

Goal: capture static gaps between code and docs. Runtime Swagger output not generated in this phase.

## Status
- Runtime Swagger JSON exported from local server.
- Controllers have `@ApiTags`, but most endpoints rely on default schema generation from DTOs.

## Known Swagger coverage (explicit annotations)
- External auth: `src/auth-external/auth-external.controller.ts` uses `@ApiOperation`, `@ApiOkResponse`.
- External orders: `src/order-external/order-external.controller.ts` uses `@ApiOperation`, `@ApiHeader`, `@ApiQuery`.
- Payment setup intent and confirm: `src/payment/controllers/payment.controller.ts` uses `@ApiOperation`, `@ApiResponse`.
- Kits external status update: `src/kit/kit.controller.ts` uses `@ApiOperation` with detailed description.
- Contact messages: `src/contact-message/contact-message.controller.ts` uses `@ApiOperation`, `@ApiConsumes`, `@ApiBody`, `@ApiResponse`.
- Queue management: `src/queues/controllers/queue.controller.ts` uses `@ApiOperation`, `@ApiResponse`.
- Reporting: `src/reporting/reporting.controller.ts` uses `@ApiResponse` for select endpoints.
- Vaari usage: `src/vaari/controllers/vaari-usage.controller.ts` uses `@ApiOperation`.

## Gaps to resolve in Swagger (recommended)
- Many internal controllers rely on default Swagger generation with minimal per‑endpoint summaries (e.g., users, practitioners, orders, support).
- SSE controllers lack explicit response schemas and example payloads (health info and Vaari SSE).
- Error response shapes are not consistently declared in Swagger annotations.

## Runtime reconciliation summary
- Internal Swagger paths: 152
- External Swagger paths: 2
- External docs match: 2/2 (`/api/v1/external/auth`, `/api/v1/external/orders`)
- Internal docs mismatches are mostly path parameter notation (`:id` vs `{id}`) and base-path usage.

### Internal paths missing from docs (top examples)
The internal docs use `:id` style params; Swagger uses `{id}`. Below are representative mismatches from runtime export:
- `/api/v1/admins/{adminId}`
- `/api/v1/orders/{id}`
- `/api/v1/orders/{id}/cancel`
- `/api/v1/kits/{id}`
- `/api/v1/users/{id}`

Also present in Swagger but not explicitly listed in internal docs:
- `/api/v1`
- `/api/v1/health/{page}`

## Suggested next alignment (if desired)
- Normalize path parameter syntax in docs to `{id}` to match Swagger.\n- Ensure base path (`/api/v1`) is consistently used in internal endpoint tables.

## Related docs
- Internal endpoint details: `src/docs/api/internal-endpoints.md`
- Public API contracts: `src/docs/api/public-api.md`
