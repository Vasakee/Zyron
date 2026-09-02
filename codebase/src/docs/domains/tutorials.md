# Domain: Tutorials

Scope: tutorial content and assets.

## Source of truth
- Controller: `src/tutorials/tutorial.controller.ts`
- Entity: `src/tutorials/entity/tutorial.entity.ts`

## Endpoint details (internal)

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/tutorials` | `x-access-token` | `UploadTutorialDto` + file | Multipart upload. |
| GET | `/api/v1/tutorials` | `x-access-token` | `PageOptionsDto`, `TutorialsQueryDto` | List tutorials. |
| GET | `/api/v1/tutorials/:id` | `x-access-token` | none | Get tutorial by id. |
| POST | `/api/v1/tutorials/:id` | `x-access-token` | `UpdateTutorialDto` + optional file | Update tutorial. |
| DELETE | `/api/v1/tutorials/:id` | `x-access-token` | none | Delete tutorial. |

## Endpoint details (external)

None documented.

## Schemas (DTOs)

UploadTutorialDto:
```json
{
  "category": "practitioner",
  "title": "Getting Started",
  "resourceType": "pdf",
  "imageUrl": "https://example.com/image.png",
  "videoUrl": "https://example.com/video.mp4",
  "documentUrl": "https://example.com/doc.pdf",
  "pptUrl": "https://example.com/slides.pptx"
}
```

UpdateTutorialDto:
```json
{
  "category": "practitioner",
  "title": "Updated Title",
  "resourceType": "pdf",
  "imageUrl": "https://example.com/image.png",
  "videoUrl": "https://example.com/video.mp4",
  "documentUrl": "https://example.com/doc.pdf",
  "pptUrl": "https://example.com/slides.pptx"
}
```

TutorialsQueryDto:
```json
{
  "searchQuery": "gut",
  "category": "practitioner",
  "resourceType": "pdf"
}
```

## Examples

Upload tutorial:
```http
POST /api/v1/tutorials
Content-Type: multipart/form-data

file=@tutorial.pdf&title=Getting Started
```

## Error cases
- 400 for missing fields or file errors.
- 401 for missing/invalid token.

## Related docs
- S3 integration: `src/docs/integrations/s3.md`
- Internal endpoints: `src/docs/api/internal-endpoints.md`
