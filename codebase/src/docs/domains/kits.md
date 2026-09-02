# Domain: Kits

Scope: kit registration, status updates, and practitioner kit management.

## Source of truth
- Controllers: `src/kit/kit.controller.ts`, `src/validKit/valid-kit.controller.ts`
- Module: `src/kit/kit.module.ts`, `src/validKit/valid-kit.module.ts`
- Entities: `src/kit/entity/kit.entity.ts`, `src/kit/entity/family-kit.entity.ts`, `src/kit/entity/genrated-kit.entity.ts`, `src/validKit/entity/valid-kit.entity.ts`

## Endpoint details (internal)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/kits` | `x-access-token` | `CreateKitDto` | Register kit for current user. |
| POST | `/api/v1/kits/practitioner-kit` | `x-access-token` | `RegisterPractitionerKitDto` | Register practitioner kit. |
| GET | `/api/v1/kits/user-kits` | `x-access-token` | `PageOptionsDto`, `KitQueryDto` | List user kits. |
| GET | `/api/v1/kits` | `x-access-token` | `PageOptionsDto`, `KitQueryDto` | List all kits. |
| GET | `/api/v1/kits/single/:id` | `x-access-token` | none | Get kit by id. |
| GET | `/api/v1/kits/singlekit/:id` | none | none | Get kit by id (no auth). |
| GET | `/api/v1/kits/practitioner-kits` | `x-access-token` | `PageOptionsDto`, `KitQueryDto` | Kits for current practitioner. |
| GET | `/api/v1/kits/all-practitioner-kits/:practitionerId` | `x-access-token` | `PageOptionsDto`, `KitQueryDto` | Kits for practitioner id. |
| PUT | `/api/v1/kits/:id` | `x-access-token` | `UpdateKitDto` | Update kit. |
| PUT | `/api/v1/kits/status/:kitId` | `x-access-token` | `UpdateKitStatusDto` | Update kit status. |
| PUT | `/api/v1/kits/practitioner-status/:kitId` | `x-access-token` | `UpdateKitStatusDto` | Update practitioner kit status. |
| PATCH | `/api/v1/kits/lock-status/:kitId` | `x-access-token` | none | Toggle lock status. |
| DELETE | `/api/v1/kits/:id` | `x-access-token` | none | Delete kit. |
| GET | `/api/v1/kits/family-kits` | `x-access-token` | `PageOptionsDto`, `KitQueryDto` | Family kits. |
| GET | `/api/v1/kits/old-practitioner-kits` | `x-access-token` | `PageOptionsDto`, `KitQueryDto` | Legacy practitioner kits. |
| GET | `/api/v1/kits/get-name/:kitId` | none | none | Lookup kit name. |
| PUT | `/api/v1/kits/complete-process/:kitId` | `x-access-token` | `CompleteReportDto` | Mark report complete. |
| PUT | `/api/v1/kits/update-sample-collection-date/:kitId` | `x-access-token` | `UpdateDateOfSampleCollectionDto` | Update sample collection date. |
| PUT | `/api/v1/kits/practitioner-kit-name` | admin | `UpdatePractitionerKitNameDto` | Update practitioner kit name. |
| POST | `/api/v1/kits/transfer` | admin | `TransferKitDto` | Transfer kit to practitioner. |
| POST | `/api/v1/validKits/bulk` | `x-access-token` | `csvFile` | Bulk upload valid kits. |
| GET | `/api/v1/validKits` | `x-access-token` | `PageOptionsDto` | List valid kits. |

## Endpoint details (external)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| PUT | `/api/v1/kits/external/status/:kitId` | `x-api-key` | `UpdateKitStatusDto` | External status update. |

## Schemas (DTOs)

CreateKitDto:
```json
{
  "kitNumber": "KIT-123",
  "kitId": "optional-kit-id",
  "dateOfSampleCollection": "2024-01-15T10:30:00Z",
  "lockStatus": "locked",
  "kitType": "gut-scan"
}
```

RegisterPractitionerKitDto:
```json
{
  "kitNumber": "KIT-123",
  "name": "Jane Doe",
  "kitId": "optional-kit-id",
  "dateOfSampleCollection": "2024-01-15T10:30:00Z",
  "kitType": "gut-scan"
}
```

KitQueryDto:
```json
{
  "searchQuery": "KIT",
  "type": "gut-scan",
  "practitionerId": "uuid"
}
```

UpdateKitDto:
```json
{
  "kitNumber": "KIT-123",
  "dateOfSampleCollection": "2024-01-15T10:30:00Z"
}
```

UpdateKitStatusDto:
```json
{
  "status": "lab-processing",
  "healthInfoCompleted": "yes",
  "isClient": false,
  "submitted": true,
  "date": "2024-01-15T10:30:00Z",
  "dateOfSampleCollection": "2024-01-10T10:30:00Z"
}
```

UpdateDateOfSampleCollectionDto:
```json
{
  "dateOfSampleCollection": "2024-01-15T10:30:00Z"
}
```

UpdatePractitionerKitNameDto:
```json
{
  "kitNumber": "KIT-123",
  "name": "Jane Doe"
}
```

CompleteReportDto:
```json
{
  "pdfUrl": "https://example.com/report.pdf",
  "taxonomyUrl": "https://example.com/taxonomy.json",
  "summaryUrl": "https://example.com/summary.pdf",
  "amrUrl": "https://example.com/amr.json",
  "fastQUrl": "https://example.com/data.fastq"
}
```

TransferKitDto:
```json
{
  "email": "practitioner@example.com",
  "name": "Jane Doe",
  "kitId": "KIT-123"
}
```

## Examples

Update kit status:
```http
PUT /api/v1/kits/status/<kitId>
x-access-token: <jwt>
Content-Type: application/json

{
  "status": "awaiting-result"
}
```

External status update:
```http
PUT /api/v1/kits/external/status/<kitId>
x-api-key: <api-key>
Content-Type: application/json

{
  "status": "result-ready"
}
```

## Error cases
- 401 for protected endpoints without `x-access-token`.
- 403 for admin-only endpoints without proper role.
- 400 validation errors for status transitions and DTOs.

## Related docs
- Orders: `src/docs/domains/orders.md`
- Health info: `src/docs/domains/health-info.md`
- Questionnaire API: `src/docs/integrations/questionnaire-api.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
