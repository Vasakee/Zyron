# Integration: Google OAuth

## Source of truth
- Controller: `src/auth/auth.controller.ts`
- Auth service: `src/auth/auth.service.ts`

## Required env vars
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

## Entry points
- `GET /api/v1/auth/google`
- `GET /api/v1/auth/google/callback`
