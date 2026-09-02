# Platform: Scripts and CLI

## Source of truth
- CLI entry: `src/main.ts` (runs when `RUN_COMMAND=true`)
- Command module: `src/cli/command.module.ts`
- Script controllers: `src/scripts/controllers/*`

## Entry points
- `POST /api/v1/script/kit/*`
- `POST /api/v1/script/migrate/*`

## Notes
- CLI commands run via Nest Commander and exit after execution.
