# Architecture: Cross-Cutting Concerns

Shared functionality that affects multiple domains. Understanding these explains "why does this behave differently than it looks?"

---

## Authentication & Authorization

### Middleware

| Middleware | Header | Purpose | Source |
|------------|--------|---------|--------|
| `VerifyTokenMiddleware` | `x-access-token` | JWT verification for internal API | [verify-token.middleware.ts](../../common/middleware/verify-token.middleware.ts) |
| `ApiKeyMiddleware` | `x-api-key` | API key verification for external API | [api-key.middleware.ts](../../common/middleware/api-key.middleware.ts) |
| `SwaggerAuthMiddleware` | Basic Auth | Swagger UI protection | [swagger-auth.middleware.ts](../../common/middleware/swagger-auth.middleware.ts) |

### Guards

| Guard | Purpose | Usage |
|-------|---------|-------|
| `RolesGuard` | Role-based access control | `@UseGuards(RolesGuard)` + `@Roles(AccountRoles.ADMIN)` |
| `MonthlyBillingAccessGuard` | Check user has billing access | Applied to order creation |
| `ThrottlerGuard` | Rate limiting | Applied globally |

**Source:** [src/common/guards/roles.guard.ts](../../common/guards/roles.guard.ts)

### Route Protection Pattern

```typescript
// In controller
@UseGuards(RolesGuard)
@Roles(AccountRoles.ADMIN)
async adminOnlyRoute() { ... }

// In module
consumer
  .apply(VerifyTokenMiddleware)
  .exclude({ path: 'public-route', method: RequestMethod.GET })
  .forRoutes('*');
```

See [Auth Flows](auth-flows.md) for complete authentication documentation.

---

## Validation

### Global ValidationPipe

Enabled in [src/main.ts:39-41](../../main.ts):

```typescript
app.useGlobalPipes(
  new ValidationPipe({ whitelist: true, transform: true }),
);
```

**Behavior:**
- `whitelist: true` - Strip properties not in DTO
- `transform: true` - Auto-transform payloads to DTO types

### DTO Validation

Uses `class-validator` decorators:

```typescript
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}
```

---

## Error Handling

### Global Exception Filter

**Source:** [src/common/filters/exceptions.filter.ts](../../common/filters/exceptions.filter.ts)

**Response Format:**

```typescript
// Success
{ status: 'success', message: '...', data: {...} }

// Error
{ status: 'error', message: '...', data?: [...] }

// Validation error
{ status: 'error', message: 'First error', data: ['All errors'] }

// Production 500
{ status: 'error', message: 'Oops! Something seems not to be write. We are looking at it' }
```

### Response Helpers

**Source:** [src/common/utils/response.ts](../../common/utils/response.ts)

```typescript
return successResponse({
  message: 'Kit created successfully',
  code: HttpStatus.CREATED,
  data: result,
  status: 'created',
});
```

---

## Logging & Observability

### Logging

- Most services use NestJS `Logger`:
  ```typescript
  private readonly logger = new Logger(MyService.name);
  this.logger.log('Message');
  this.logger.error('Error', error);
  ```

- Console output goes to stdout/stderr

### Sentry

**Initialization:** [src/main.ts](../../main.ts)

**Interceptor:** [src/sentry/sentry.interceptor.ts](../../sentry/sentry.interceptor.ts)

Applied to controllers:
```typescript
@UseInterceptors(SentryInterceptor)
@Controller('orders')
export class OrdersController { ... }
```

Captures unhandled exceptions in production.

---

## Rate Limiting

### ThrottlerGuard

Configured in [src/app.module.ts](../../app.module.ts):

```typescript
ThrottlerModule.forRoot({
  throttlers: [{ ttl: 60000, limit: 100 }],
}),
```

Applied per-controller:
```typescript
@UseGuards(ThrottlerGuard)
@Controller('orders')
```

---

## CORS & Security

### CORS

**Config:** [src/config/allowed-origins.ts](../../config/allowed-origins.ts)

```typescript
// In main.ts
app.enableCors({
  origin: getAllowedOrigins(),
  credentials: true,
});
```

### Helmet

Applied in [src/main.ts](../../main.ts) for security headers.

---

## Caching

### Redis Cache

**Config:** [src/app.module.ts](../../app.module.ts)

```typescript
CacheModule.register({
  store: redisStore,
  host: REDIS_HOST,
  port: REDIS_PORT,
}),
```

### Cache Keys

```typescript
enum CacheKeys {
  QuestionnaireResponse = 'questionnaire-response',
  VaariAnalysis = 'vaari-analysis',
}
```

---

## Transactions

### Pattern

Use `DataSource.transaction` for multi-write operations:

```typescript
await this.dataSource.transaction(async (manager) => {
  await manager.save(Order, order);
  await manager.save(OrderKit, orderKits);
  await manager.update(User, userId, { ... });
});
```

### Common Locations

- Payment processing: [src/payment/services/](../../payment/services/)
- Billing: [src/billing/services/](../../billing/services/)
- Order creation: [src/order/service/](../../order/service/)

**Debugging tip:** When partial writes occur, check transaction boundaries first.

---

## Shared Utilities

### Safe to Reuse

| Location | Purpose |
|----------|---------|
| `src/common/utils/response.ts` | Response shaping |
| `src/common/utils/validation.ts` | Validation helpers (isUUID, etc.) |
| `src/common/utils/pricing.ts` | Price calculations |
| `src/common/dto/page-options.dto.ts` | Pagination DTOs |
| `src/common/entity/base.entity.ts` | Base entity (id, createdAt, updatedAt) |

### Use with Caution

- Domain-specific helpers that assume particular workflows
- Helpers reaching into multiple modules (prefer services)
- Anything tightly coupled to external APIs

---

## Event Emitters

NestJS EventEmitter for decoupled side effects:

```typescript
// Emit
this.eventEmitter.emit('kit.status.changed', { kitId, newStatus });

// Listen
@OnEvent('kit.status.changed')
handleKitStatusChange(payload: { kitId: string; newStatus: string }) { ... }
```

**Listeners:** [src/helper/listeners/](../../helper/listeners/)

---

## Related Docs

- [Auth Flows](auth-flows.md) - Authentication diagrams
- [Error Catalog](../operations/error-catalog.md) - Common errors
- [Entrypoints Reference](../api/entrypoints-reference.md) - Route auth requirements
