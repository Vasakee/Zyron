# Domain: Practitioners

Scope: practitioner profiles, client associations, and invites.

## Source of truth
- Controller: `src/practitioner/practitioner.controller.ts`
- Module: `src/practitioner/practitioner.module.ts`
- Entities: `src/practitioner/entity/practitioner.entity.ts`, `src/practitioner/entity/client-practitioner.entity.ts`, `src/practitioner/entity/external-practitioner.entity.ts`

## Endpoint details (internal)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/practitioners` | none | `CreatePractitionerAccountDto` | Signup. |
| POST | `/api/v1/practitioners/create-client` | `x-access-token` | `CreateClienttDto` | Create client under practitioner. |
| POST | `/api/v1/practitioners/send-info` | `x-access-token` | `SendInfoDto` | Send health info. |
| GET | `/api/v1/practitioners` | `x-access-token` | `PractitionerPageOptionsDto`, `PractitionerQueryDto` | List practitioners. |
| PUT | `/api/v1/practitioners/status/:id` | `x-access-token` | `UpdatePractitionerAccountStatusDto` | Update status. |
| PUT | `/api/v1/practitioners` | `x-access-token` | `UpdatePractitionerAccountDto` | Update current practitioner. |
| PUT | `/api/v1/practitioners/:id` | `x-access-token` | `UpdatePractitionerAccountDto` | Update by id. |
| POST | `/api/v1/practitioners/bulk` | `x-access-token` | `csvFile` | Bulk upload via CSV. |
| POST | `/api/v1/practitioners/resend-invites` | `x-access-token` | `{ email }` | Resend invite email. |

## Endpoint details (external)

None documented.

## Schemas (DTOs)

CreatePractitionerAccountDto:
```json
{
  "firstName": "Alex",
  "lastName": "Smith",
  "practiceName": "Clinic A",
  "practiceUrl": "https://clinic.example.com",
  "phone": "555-1234",
  "email": "alex@example.com",
  "degree": "ND",
  "gutTestUsedName": "Gut Scan",
  "gutTestUse": "yes",
  "monthlyClients": "10-20",
  "practitionerType": "naturopath",
  "countryLocation": "US",
  "stateLocation": "CA",
  "cityLocation": "Los Angeles",
  "zipCode": "90001",
  "awarenessChannel": "referral",
  "password": "secret"
}
```

CreateClienttDto:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "555-1234",
  "recommended": "Friend",
  "reportAccess": "granted",
  "practitionerId": "uuid-or-not-found",
  "email": "jane@example.com",
  "receiveMarketing": true,
  "practitionerLastName": "Smith",
  "practitionerFirstName": "Alex",
  "practitionerEmail": "alex@example.com",
  "practitionerWebsiteUrl": "https://clinic.example.com",
  "practitionerPhone": "555-9876"
}
```

SendInfoDto:
```json
{
  "email": "jane@example.com",
  "kitId": "KIT-123"
}
```

UpdatePractitionerAccountDto:
```json
{
  "firstName": "Alex",
  "lastName": "Smith",
  "practiceUrl": "https://clinic.example.com",
  "practiceName": "Clinic A",
  "phone": "555-1234",
  "degree": "ND",
  "gutTestUsedName": "Gut Scan",
  "gutTestUse": "yes",
  "practitionerType": "naturopath",
  "countryLocation": "US",
  "stateLocation": "CA",
  "cityLocation": "Los Angeles",
  "zipCode": "90001",
  "monthlyClients": "10-20",
  "awarenessChannel": "referral"
}
```

UpdatePractitionerAccountStatusDto:
```json
{
  "status": "approved"
}
```

## Examples

Create practitioner:
```http
POST /api/v1/practitioners
Content-Type: application/json

{
  "firstName": "Alex",
  "lastName": "Smith",
  "email": "alex@example.com",
  "clinicName": "Clinic A"
}
```

## Error cases
- 400 validation errors from DTOs.
- 401 for protected endpoints with missing/invalid `x-access-token`.

## Related docs
- Users: `src/docs/domains/users.md`
- Orders: `src/docs/domains/orders.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
