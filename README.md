# Porta

Tailscale-first remote web interface for [Antigravity](https://antigravity.google/) Agent Manager.

Porta has two workspace packages:
- `@porta/proxy` — Hono API/WebSocket bridge to local Antigravity Language Server instances
- `@porta/web` — React + Vite PWA chat UI

## Prerequisites

- Node.js `>= 22`
- pnpm `>= 10`
- Tailscale installed and logged in
- Antigravity running locally

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm dev:ts
```

Then expose HTTPS through Tailscale Serve (recommended for mobile + PWA install):

```bash
tailscale serve --bg --https=443 http://localhost:5173
```

Open your MagicDNS URL (`https://<hostname>.<tailnet>.ts.net`) on phone/tablet.

## Local-only Development (no Tailscale)

```bash
pnpm install
cp .env.example .env
pnpm dev
```

- Web UI: `http://localhost:5173`
- Proxy API: `http://127.0.0.1:3170`

## Production / Single-Port Mode

Build web UI and serve static files from proxy:

```bash
pnpm build:web
PORTA_STATIC_DIR=./packages/web/dist \
PORTA_HOST=$(tailscale ip -4) \
pnpm --filter @porta/proxy start
```

Optional HTTPS entrypoint:

```bash
tailscale serve --bg --https=443 http://localhost:3170
```

## Environment Variables

See `.env.example`.

| Variable | Default | Purpose |
|---|---|---|
| `PORTA_HOST` | `127.0.0.1` | Proxy bind host (set to Tailscale IP for remote access) |
| `PORTA_PORT` | `3170` | Proxy port |
| `PORTA_CORS_ORIGINS` | *(empty)* | Additional CORS origins |
| `PORTA_STATIC_DIR` | *(empty)* | Static web directory for single-port mode |
| `PORTA_TAILSCALE_HOSTNAME` | *(empty)* | Optional MagicDNS hostname used by `dev:ts` HTTPS helper |
| `VITE_API_BASE` | *(empty)* | Absolute API base for production web builds |

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Run proxy + web in dev mode |
| `pnpm dev:ts` | Tailscale-aware dev bootstrap (IP detection, optional HTTPS helper) |
| `pnpm build` | Build all workspaces |
| `pnpm build:web` | Build only web package |
| `pnpm lint` | Lint all workspaces |
| `pnpm test` | Run workspace tests |
| `pnpm test:e2e` | Run web e2e tests |

## API Surface (proxy)

- Health: `GET /api/health`
- Conversations:
  - `GET /api/conversations`
  - `GET /api/conversations/:id`
  - `GET /api/conversations/:id/steps`
  - `POST /api/conversations`
  - `POST /api/conversations/:id/messages`
  - `POST /api/conversations/:id/stop`
  - `POST /api/conversations/:id/revert`
  - `POST /api/conversations/:id/file-permission`
  - `POST /api/conversations/:id/command-action`
  - `DELETE /api/conversations/:id`
- Models: `GET /api/models`
- Workspaces: `GET /api/workspaces`
- Files: `GET /api/files?uri=<file://...>`
- Search: `GET /api/search?q=<query>`
- RPC passthrough: `POST /api/rpc/:method`
- WebSocket: `GET /api/conversations/:id/ws` (upgrade)

## Architecture

```text
Mobile/Desktop Browser
  -> Tailscale HTTPS (tailscale serve)
  -> Porta Web (Vite or static build)
  -> Porta Proxy (Hono + WS)
  -> Antigravity Language Server instance(s)
```

## Documentation

- [`/docs/project-overview-pdr.md`](./docs/project-overview-pdr.md)
- [`/docs/system-architecture.md`](./docs/system-architecture.md)
- [`/docs/codebase-summary.md`](./docs/codebase-summary.md)
- [`/docs/code-standards.md`](./docs/code-standards.md)
- [`/docs/deployment-guide.md`](./docs/deployment-guide.md)
- [`/docs/development-roadmap.md`](./docs/development-roadmap.md)
- [`/docs/pwa.md`](./docs/pwa.md)

## Limitations

- Requires a running local Antigravity instance
- Single-user oriented workflow
- Not a full remote IDE
- Remote usage assumes Tailscale connectivity

## License

MIT
