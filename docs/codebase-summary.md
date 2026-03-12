# Codebase Summary

## Overview

Porta is a pnpm monorepo for a private, Tailscale-first remote interface to Antigravity Agent Manager.

- `packages/proxy` exposes a stable HTTP + WebSocket surface over local Antigravity Language Server instances.
- `packages/web` provides a React + Vite PWA chat UI optimized for phone, tablet, and browser usage.
- `scripts/` contains local dev orchestration, including a Tailscale-aware bootstrap flow.

## Repository Layout

```text
packages/
  proxy/   Hono proxy, RPC bridge, WS stream bridge, discovery logic
  web/     React PWA, API client, chat UI, hooks, styles
scripts/   Dev orchestration helpers
docs/      Evergreen project docs
```

## Workspace Responsibilities

### `packages/proxy`

Main files:
- `packages/proxy/src/index.ts` — server bootstrap, CORS, health route, route registration, optional static serving
- `packages/proxy/src/routes/conversations.ts` — conversation CRUD, step reads, message sends, approvals, revert, delete
- `packages/proxy/src/routing.ts` — conversation-aware LS routing and affinity
- `packages/proxy/src/discovery.ts` — running LS discovery and caching
- `packages/proxy/src/rpc.ts` — Connect RPC transport with HTTPS → HTTP fallback
- `packages/proxy/src/ws.ts` — conversation step streaming bridge
- `packages/proxy/src/exposure.ts` — listen-host validation, including Tailscale CGNAT support

Primary API surface:
- `GET /api/health`
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
- `GET /api/models`
- `GET /api/workspaces`
- `GET /api/files`
- `GET /api/search`
- `POST /api/rpc/:method`
- `WS /api/conversations/:id/ws`

### `packages/web`

Main files:
- `packages/web/src/App.tsx` — route shell, workspace/chat view composition, sidebar behavior
- `packages/web/src/api/client.ts` — typed API wrapper using `VITE_API_BASE` when present
- `packages/web/src/hooks/useChatActions.ts` — start/send/stop/revert/delete mutations and optimistic state
- `packages/web/src/hooks/useStepsStream.ts` — HTTP bootstrap + WS sync for conversation steps
- `packages/web/src/components/ChatPanel.tsx` — message rendering, approvals, revert, lightbox
- `packages/web/src/components/ChatInput.tsx` — draft input, model selection, planner mode, image attachments
- `packages/web/src/components/Sidebar.tsx` — workspace-grouped conversation list and search
- `packages/web/src/components/StepCards.tsx` — command and file-permission approval cards
- `packages/web/src/index.css` + `packages/web/src/styles/*.css` — global design system and layout styles

Key frontend behaviors:
- Lazy conversation creation on first send
- Optimistic user messages reconciled against server-confirmed steps
- Hybrid sync model: polling for summaries, WebSocket for active step streaming
- PWA install via `vite-plugin-pwa` and `public/manifest.json`
- Mobile-first layout, swipeable sidebar, image attachments, markdown rendering

## Runtime Configuration

Root `.env.example` documents the current runtime contract:
- `PORTA_HOST`
- `PORTA_PORT`
- `PORTA_CORS_ORIGINS`
- `PORTA_STATIC_DIR`
- `PORTA_TAILSCALE_HOSTNAME`
- `VITE_API_BASE`

## Tooling

- Node.js `>= 22`
- pnpm `>= 10`
- TypeScript across both workspaces
- Vitest for unit/integration tests
- Vite for frontend build/dev server
- Hono + `ws` for proxy runtime

## Test Coverage Shape

Proxy tests cover routing, discovery, RPC fallback behavior, exposure rules, CORS/origin policy, file access safety, search, metadata, message tracking, platform adapters, transport hints, and WebSocket behavior.

Web tests cover transforms, optimistic reconciliation, streaming hooks, chat actions, chat input, image attachments, markdown safety, API client behavior, command-card rendering, and basic app-level flows.

## Operational Modes

### Local-only development
- `pnpm dev`
- Web on `localhost:5173`
- Proxy on `127.0.0.1:3170`

### Tailscale development
- `pnpm dev:ts`
- Detects Tailscale IPv4 when possible
- Optionally starts `tailscale serve` when `PORTA_TAILSCALE_HOSTNAME` is set

### Single-port production-style mode
- Build web assets with `pnpm build:web`
- Run proxy with `PORTA_STATIC_DIR=./packages/web/dist`
- Optionally expose through `tailscale serve --https=443`

## Current Documentation Gaps

The repo now has a Tailscale-first README and docs set, but historical Cloudflare references still need to stay aligned when legacy docs are touched.

## References

- `README.md`
- `package.json`
- `.env.example`
- `packages/proxy/src/index.ts`
- `packages/proxy/src/routes/conversations.ts`
- `packages/web/src/App.tsx`
- `packages/web/src/api/client.ts`
- `packages/web/vite.config.ts`
- `scripts/dev.mjs`
- `scripts/dev-tailscale.mjs`
