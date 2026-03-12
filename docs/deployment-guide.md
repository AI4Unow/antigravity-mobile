# Deployment Guide

## Prerequisites

| Requirement | Version | Check |
|-------------|---------|-------|
| Node.js | ≥ 22 | `node -v` |
| pnpm | ≥ 10 | `pnpm -v` |
| Tailscale | Latest | `tailscale version` |
| Antigravity | Running | Check Activity Monitor |

## Quick Start

```bash
cd "/Users/nad/Antigravity Mobile"
cp .env.example .env
pnpm install
pnpm run dev:ts
tailscale serve --bg --https=443 http://localhost:5173
```

Open `https://<your-hostname>.<tailnet>.ts.net` on any device on your Tailscale network.

## Development Mode

Two servers: Vite (hot reload) + Proxy (API).

```bash
pnpm run dev:ts         # auto-detects Tailscale IP, starts both servers
```

Vite dev server: `http://localhost:5173` (with HMR)
Proxy API: `http://<tailscale-ip>:3170`

### Exposing via Tailscale

```bash
# Expose Vite dev server (Web UI + API proxy)
tailscale serve --bg --https=443 http://localhost:5173

# Stop when done
tailscale serve --https=443 off
```

## Production Mode (Single Port)

One server: Proxy serves both API + static web UI.

```bash
# 1. Build web UI
pnpm build:web

# 2. Start proxy with static serving
PORTA_STATIC_DIR=./packages/web/dist \
PORTA_HOST=$(tailscale ip -4) \
pnpm --filter @porta/proxy start

# 3. Expose via Tailscale
tailscale serve --bg --https=443 http://localhost:3170
```

## Configuration

### `.env` Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORTA_HOST` | `127.0.0.1` | Bind address. Auto-set by `dev:ts` |
| `PORTA_PORT` | `3170` | Proxy port |
| `PORTA_CORS_ORIGINS` | *(empty)* | Extra CORS origins |
| `PORTA_STATIC_DIR` | *(empty)* | Web `dist/` path for single-port mode |
| `PORTA_TAILSCALE_HOSTNAME` | *(empty)* | MagicDNS hostname for auto HTTPS |
| `VITE_API_BASE` | *(empty)* | API URL for production web builds |

### Finding Your Tailscale Info

```bash
tailscale ip -4              # Your Tailscale IP
tailscale status | head -1   # Your hostname
tailscale status             # All devices on your network
```

## iPad / iPhone Setup

1. Install **Tailscale** from App Store
2. Sign in with same account as Mac
3. Open Safari → `https://<your-hostname>.<tailnet>.ts.net`
4. Share → **Add to Home Screen** (PWA install)

## Upstream Sync (Porta Updates)

```bash
git fetch upstream
git log upstream/develop --oneline -10   # see new commits
git cherry-pick <hash>                    # pick specific changes
git merge upstream/develop               # merge everything
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't reach from iPad/phone | Ensure device is on Tailscale. Use `tailscale serve`, not direct IP |
| `EPERM` errors in IDE terminal | macOS sandbox issue. Run commands in Terminal.app |
| "No Language Server instances" | Antigravity must be running |
| PWA won't install | HTTPS required — use `tailscale serve` |
| Vite "blocked request" | Fixed in `vite.config.ts` with `allowedHosts: true` |
| `tsx: command not found` | Run via `pnpm run dev:ts`, not `node scripts/dev-tailscale.mjs` |
| Port 3170/5173 blocked | macOS firewall — use `tailscale serve` to bypass |

## Process Management

### Start
```bash
pnpm run dev:ts                                           # dev mode
tailscale serve --bg --https=443 http://localhost:5173    # expose
```

### Stop
```bash
# Ctrl+C in terminal (stops proxy + vite)
tailscale serve --https=443 off                          # stop HTTPS
```

### Logs

Dev mode logs are in `logs/proxy.log` and `logs/web.log`.
If macOS blocks writing, logs fall back to `/tmp/porta-logs/`.

```bash
tail -f logs/proxy.log logs/web.log
```
