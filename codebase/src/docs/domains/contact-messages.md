# Domain: Contact Messages

Scope: inbound contact form submissions.

## Source of truth
- Controller: `src/contact-message/contact-message.controller.ts`
- Service: `src/contact-message/service/contact-message.service.ts`
- Entity: `src/contact-message/entity/contact-message.entity.ts`

## Endpoint details (internal)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/contacts` | none | `CreateContactMessageDto` + optional file | Multipart form data. |
| GET | `/api/v1/contacts` | `x-access-token` | none | List submissions. |
| GET | `/api/v1/contacts/:id` | `x-access-token` | path param | Get submission by id. |

## Endpoint details (external)

None documented.

## Schemas (DTOs)

CreateContactMessageDto:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "message": "Hello, I would like to know more."
}
```

## Examples

Submit contact form:
```http
POST /api/v1/contacts
Content-Type: multipart/form-data

name=Jane Doe&email=jane@example.com&message=Hello
```

## Error cases
- 400 for missing required fields.
- 401 for admin endpoints without token.

## Related docs
- Mail: `src/docs/domains/mail.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
