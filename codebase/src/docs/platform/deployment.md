# Platform: Deployment

## Source of truth
- Container build: `Dockerfile`
- Fly config: `fly.toml`, `fly.staging.toml`, `fly.prod.toml`
- Procfile: `Procfile`

## Notes
- App listens on `PORT` and binds to `0.0.0.0` (see `src/main.ts`).
- Fly health check path: `/api/v1` (see `fly.toml`).
