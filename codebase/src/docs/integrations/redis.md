# Integration: Redis

## Source of truth
- Redis config: `src/config/redis.ts`
- Cache setup: `src/app.module.ts`
- Queue config: `src/config/queue.config.ts`

## Usage
- Bull queues for background jobs
- Cache manager for short-lived caching

## Required env vars
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD` (optional)
