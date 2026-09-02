# Domain: Admin

Scope: admin accounts and admin tooling.

## Source of truth
- Controller: `src/admin/admin.controller.ts`
- Entity: `src/admin/entity/admin.entity.ts`
- Dashboard router: `src/dashboard/dashboard.service.ts`

## Endpoint details (internal)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/admins` | none | `CreateAdminDto` | Create admin account. |
| GET | `/api/v1/admins` | `x-access-token` | `AdminQueryDto`, `PageOptionsDto` | List admins. |
| PUT | `/api/v1/admins` | `x-access-token` | `UpdateAdminAccountDto` | Update current admin. |
| PUT | `/api/v1/admins/:adminId` | `x-access-token` | `UpdateAdminDto` | Update admin by id. |
| GET | `/v1/admin/queues` | `x-access-token` | none | Bull Board (mounted in `src/main.ts`). |

## Endpoint details (external)

None documented.

## Schemas (DTOs)

CreateAdminDto:
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "secret",
  "permissions": ["manage_users", "manage_orders"]
}
```

UpdateAdminDto:
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "permissions": ["manage_orders"]
}
```

UpdateAdminAccountDto:
```json
{
  "firstName": "Admin",
  "lastName": "User"
}
```

AdminQueryDto:
```json
{
  "searchQuery": "admin"
}
```

## Examples

List admins:
```http
GET /api/v1/admins?page=1&limit=50
x-access-token: <jwt>
```

## Error cases
- 401 for missing/invalid token.

## Related docs
- Queues and cron: `src/docs/platform/queues-and-cron.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
