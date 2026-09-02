# Platform: WebSocket and SSE

## Source of truth
- Health info gateway: `src/health-info/health-info.gateway.ts`
- Vaari analysis SSE: `src/vaari/controllers/vaari-analysis-sse.controller.ts`
- Health info SSE: `src/health-info/health-info-sse.controller.ts`
- Base utilities: `src/websocket/base`

## Entry points
- `GET /api/v1/sse/health-info`
- `GET /api/v1/sse/vaari-analysis`

## Notes
- WebSocket server is initialized in `src/main.ts` (log output on boot).
