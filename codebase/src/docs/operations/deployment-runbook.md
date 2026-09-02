# Deployment Runbook

Guide for deploying, managing, and rolling back the Vitract Kit API.

---

## Environments

| Environment | Branch | URL | Notes |
|-------------|--------|-----|-------|
| Development | `main` | localhost:3000 | Local development |
| Staging | `preview` | staging.api.vitract.com | Preview/testing |
| Production | `main` | api.vitract.com | Live production |

---

## Pre-Deployment Checklist

Before deploying:

- [ ] All tests pass locally (`yarn test`)
- [ ] Build succeeds (`yarn build`)
- [ ] Migrations reviewed (if any)
- [ ] Environment variables added/updated in deployment platform
- [ ] Stripe webhook endpoints verified (for payment changes)
- [ ] No breaking API changes (or clients updated)

---

## Deployment Process

### Standard Deployment

```bash
# 1. Ensure on correct branch
git checkout main
git pull origin main

# 2. Run tests
yarn test

# 3. Build
yarn build

# 4. Deploy (Fly.io example)
fly deploy

# 5. Verify deployment
fly status
fly logs
```

### Database Migrations

**Before deployment** (if migrations exist):

```bash
# 1. Backup database (production)
# Use Azure Portal or database admin tools

# 2. Run migrations against target environment
yarn migration:run

# 3. Verify migration success
yarn typeorm migration:show
```

**Migration rollback:**

```bash
# Revert last migration
yarn migration:revert

# Revert multiple (repeat as needed)
yarn migration:revert
yarn migration:revert
```

---

## Fly.io Specific

### Common Commands

```bash
# Deploy
fly deploy

# View logs
fly logs
fly logs --app vitract-api

# SSH into container
fly ssh console

# Scale
fly scale count 2

# View status
fly status

# Secrets (env vars)
fly secrets list
fly secrets set KEY=value
fly secrets unset KEY
```

### Setting Environment Variables

```bash
# Set single secret
fly secrets set STRIPE_API_KEY=sk_live_xxx

# Set multiple
fly secrets set \
  DATABASE_URL=mssql://... \
  REDIS_HOST=redis.example.com

# Import from file (careful - exposes in shell history)
fly secrets import < .env.production
```

### Scaling

```bash
# Scale instances
fly scale count 2

# Scale memory
fly scale memory 512

# View current scale
fly scale show
```

---

## Rollback Procedures

### Code Rollback (Quick)

```bash
# 1. Find previous deployment
fly releases list

# 2. Rollback to previous version
fly releases rollback <version>

# Or redeploy previous commit
git checkout <previous-commit>
fly deploy
```

### Database Rollback

```bash
# 1. Revert TypeORM migrations (one at a time)
yarn migration:revert

# 2. Verify state
yarn typeorm migration:show

# 3. For catastrophic issues, restore from backup
# Use Azure Portal or database admin tools
```

### Full Rollback Steps

1. **Stop traffic** (if critical):
   ```bash
   fly scale count 0
   ```

2. **Rollback code**:
   ```bash
   fly releases rollback <version>
   ```

3. **Rollback database** (if needed):
   ```bash
   yarn migration:revert
   ```

4. **Restore traffic**:
   ```bash
   fly scale count 2
   ```

5. **Verify**:
   - Check logs: `fly logs`
   - Test health endpoint: `GET /api/v1/`
   - Test critical flows manually

---

## Post-Deployment Verification

### Health Checks

```bash
# API health
curl https://api.vitract.com/api/v1/

# Swagger accessible
curl -u $SWAGGER_USER:$SWAGGER_PASS https://api.vitract.com/docs

# Bull Board accessible
curl -u admin:$PASS https://api.vitract.com/v1/admin/queues
```

### Smoke Tests

1. **Auth flow**: Test Google OAuth login
2. **Order creation**: Create test order (staging only)
3. **Kit registration**: Register test kit
4. **Payment**: Test Stripe checkout (test mode)
5. **Queues**: Check Bull Board for processing

### Monitoring

- **Sentry**: Check for new errors after deploy
- **Stripe Dashboard**: Verify webhook events processing
- **Bull Board**: Verify queue processing
- **Logs**: `fly logs` for runtime errors

---

## Hotfix Process

For urgent production fixes:

```bash
# 1. Create hotfix branch
git checkout main
git checkout -b hotfix/critical-fix

# 2. Make minimal fix
# ...edit files...

# 3. Test locally
yarn test
yarn build

# 4. Deploy directly (skip staging for critical fixes)
fly deploy --app vitract-api-prod

# 5. Merge back to main
git checkout main
git merge hotfix/critical-fix
git push origin main

# 6. Clean up
git branch -d hotfix/critical-fix
```

---

## Queue Management During Deploy

### Before Deployment

If deploy includes queue changes:

```bash
# Pause queues via Bull Board
# Or via API:
curl -X POST https://api.vitract.com/api/v1/queues/pause \
  -H "x-access-token: $TOKEN"
```

### After Deployment

```bash
# Resume queues via Bull Board
# Or via API:
curl -X POST https://api.vitract.com/api/v1/queues/resume \
  -H "x-access-token: $TOKEN"
```

### Draining Jobs

If you need to wait for jobs to complete before deploy:

```bash
# Check queue status
curl https://api.vitract.com/api/v1/queues/stats \
  -H "x-access-token: $TOKEN"

# Wait for active jobs to complete (Bull Board)
```

---

## Troubleshooting Deployments

### Deploy Fails

| Symptom | Check | Fix |
|---------|-------|-----|
| Build fails | `yarn build` locally | Fix TypeScript errors |
| Container won't start | `fly logs` | Check env vars, database connection |
| Health check fails | App startup logs | Check PORT, database URL |
| Out of memory | `fly scale memory` | Increase memory allocation |

### App Crashes After Deploy

1. Check logs: `fly logs`
2. Check for missing env vars: `fly secrets list`
3. Check database connectivity
4. Check Redis connectivity
5. Rollback if needed: `fly releases rollback`

### Database Connection Issues

```bash
# Test connection from container
fly ssh console
# Inside container:
node -e "require('./dist/src/config/db').default"
```

---

## Environment-Specific Notes

### Staging

- Uses test Stripe keys
- Can safely test with real orders
- Migrations can be tested before production

### Production

- **Never** skip migrations or break API compatibility
- Always test in staging first
- Keep rollback plan ready
- Monitor Sentry closely after deploy

---

## Related Docs

- [Error Catalog](error-catalog.md) - Common errors and fixes
- [Operations Runbook](runbook.md) - Debugging guide
- [Environment Variables](../platform/env-vars.md) - Configuration reference
- [Queue Jobs Reference](../platform/queue-jobs-reference.md) - Queue management
