# Domain: Users

Scope: user accounts, login, password resets, and transfers.

## Source of truth
- Controller: `src/user/user.controller.ts`
- Services: `src/user/service/*`
- Entities: `src/user/entity/user.entity.ts`, `src/user/entity/api-key.entity.ts`, `src/user/entity/transfer-log.entity.ts`

## Endpoint details (internal)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/users` | none | `CreateCustomerAccountDto` | Signup. |
| POST | `/api/v1/users/login` | none | `LoginAccountDto` | Login. |
| GET | `/api/v1/users` | `x-access-token` | none | List users. |
| GET | `/api/v1/users/profile` | `x-access-token` | none | Current user profile. |
| GET | `/api/v1/users/:id` | `x-access-token` | none | Get user by id. |
| PUT | `/api/v1/users` | `x-access-token` | `UpdateCustomerAccountDto` | Update current user. |
| PUT | `/api/v1/users/password` | `x-access-token` | `UpdatePasswordDto` | Update password. |
| PUT | `/api/v1/users/change-password` | `x-access-token` | `ChangePasswordDto` | Change password. |
| POST | `/api/v1/users/forgot-password` | none | `ForgotPasswordDTO` | Send reset email. |
| POST | `/api/v1/users/reset-password/:token` | none | `ResetPasswordDTO` | Reset password by token. |
| POST | `/api/v1/users/create-password/:token` | none | `ResetPasswordDTO` | Create password from invite token. |
| POST | `/api/v1/users/resend-token` | none | `ResendValidationTokenDto` | Resend validation token. |
| POST | `/api/v1/users/validate-account` | none | `ValidateAccountDto` | Validate account. |
| POST | `/api/v1/users/complete-registration` | `x-access-token` | `CompleteClientRegistrationDto` | Complete registration. |
| POST | `/api/v1/users/resend-new-platform-password` | none | `ForgotPasswordDTO` | New platform reset email. |
| POST | `/api/v1/users/reset-new-platform-password/:token` | none | `ResetNewPlatformPasswordDTO` | Reset password by token. |
| POST | `/api/v1/users/initiate-transfer` | `x-access-token` | `InitiateTransferDTO` | Start account transfer. |
| POST | `/api/v1/users/verify-transfer` | none | `VerifyTransferDTO` | Verify transfer. |
| POST | `/api/v1/users/complete-transfer` | none | `CompleteTransferDTO` | Complete transfer. |
| POST | `/api/v1/users/monthly-billing-access` | admin | `SetMonthlyBillingAccessDto` | Enable/disable monthly billing. |
| POST | `/api/v1/users/monthly-billing-access/bulk` | admin | `BulkMonthlyBillingAccessDto` + file | Bulk enable/disable. |

## Endpoint details (external)

None documented.

## Schemas (DTOs)

CreateCustomerAccountDto:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "555-1234",
  "recommended": "Friend",
  "reportAccess": "granted",
  "practitionerId": "uuid-or-not-found",
  "awarenessChannel": "instagram",
  "email": "jane@example.com",
  "receiveMarketing": true,
  "role": "user",
  "password": "secret",
  "practitionerLastName": "Smith",
  "practitionerFirstName": "Alex",
  "practitionerEmail": "alex@example.com",
  "practitionerWebsiteUrl": "https://clinic.example.com",
  "practitionerPhone": "555-9876"
}
```

CompleteClientRegistrationDto:
```json
{
  "identifier": "user@example.com",
  "identifierType": "email",
  "recommended": "Friend",
  "reportAccess": "granted",
  "practitionerId": "uuid-or-not-found",
  "awarenessChannel": "instagram",
  "practitionerLastName": "Smith",
  "practitionerFirstName": "Alex",
  "practitionerEmail": "alex@example.com",
  "practitionerWebsiteUrl": "https://clinic.example.com",
  "practitionerPhone": "555-9876"
}
```

LoginAccountDto:
```json
{
  "email": "jane@example.com",
  "password": "secret"
}
```

ResendValidationTokenDto:
```json
{
  "id": "user-id"
}
```

ValidateAccountDto:
```json
{
  "token": "validation-token"
}
```

ForgotPasswordDTO:
```json
{
  "email": "jane@example.com"
}
```

ResetPasswordDTO:
```json
{
  "email": "jane@example.com",
  "password": "new-secret",
  "confirmPassword": "new-secret"
}
```

ResetNewPlatformPasswordDTO:
```json
{
  "email": "jane@example.com",
  "password": "new-secret",
  "confirmPassword": "new-secret"
}
```

UpdateCustomerAccountDto:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "555-1234",
  "recommended": "Friend",
  "reportAccess": "granted",
  "practitionerId": "uuid-or-not-found",
  "practitionerLastName": "Smith",
  "practitionerFirstName": "Alex",
  "practitionerEmail": "alex@example.com",
  "practitionerWebsiteUrl": "https://clinic.example.com",
  "practitionerPhone": "555-9876"
}
```

UpdatePasswordDto:
```json
{
  "oldPassword": "old-secret",
  "newPassword": "new-secret"
}
```

ChangePasswordDto:
```json
{
  "oldPassword": "old-secret",
  "password": "new-secret"
}
```

InitiateTransferDTO:
```json
{
  "newEmail": "new@example.com"
}
```

VerifyTransferDTO:
```json
{
  "oldToken": "token",
  "status": "pending"
}
```

CompleteTransferDTO:
```json
{
  "newToken": "token"
}
```

SetMonthlyBillingAccessDto:
```json
{
  "email": "user@example.com",
  "enable": true
}
```

BulkMonthlyBillingAccessDto:
```json
{
  "enable": true
}
```

## Examples

Signup:
```http
POST /api/v1/users
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "secret"
}
```

Login:
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "secret"
}
```

## Error cases
- 400 validation errors from DTOs.
- 401 for protected endpoints with missing/invalid `x-access-token`.

## Related docs
- Auth flows: `src/docs/domains/auth.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
