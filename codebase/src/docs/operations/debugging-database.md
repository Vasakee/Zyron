# Debugging Database

## Overview

The service uses TypeORM with MSSQL. Connection settings live in `src/config/db.ts`.

## Where to Look

- App startup logs for TypeORM connection errors.
- `src/config/db.ts` for MSSQL options and retries.
- Migration status via `yarn typeorm migration:show`.

## Playbooks

### MSSQL Connection Failures

Checks:
- Verify `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_PORT`.
- Confirm DB host is reachable and accepting connections.
- Review TypeORM retry logs (retryAttempts=5, retryDelay=2000ms).

SAFE Actions:
- Restart the app to reset the connection pool.
- Validate env vars against the target environment.

### Migration Mismatch

Symptoms:
- `yarn migration:run` fails or schema drift is detected.

Checks:
- Run `yarn typeorm migration:show` to compare applied vs. pending.
- Confirm build artifacts exist before running migrations.

SAFE Actions:
- Run `yarn migration:run` after building.
- Use `yarn migration:revert` only if you understand the last applied migration.

### Deadlocks and Timeouts

Checks:
- Look for repeated timeout errors in app logs.
- Review DB locks and long-running queries.

SAFE Actions:
- Reduce concurrent load on the failing endpoint.
- Restart the app if the pool is exhausted.

## SAFE Actions

- Use migration status commands to verify state.
- Restart app processes to reset pool/connection state.
- Enable `DB_LOGGING` for short-term query diagnostics.

## DANGEROUS Actions

- Manual schema edits outside migrations.
- Editing applied migration files.

## References

- [Operations Runbook](./runbook.md)
- [Error Catalog](./error-catalog.md)
- [Observability](./observability.md)
