# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Mac (Host)                           │
│                                                             │
│  ┌──────────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │  Antigravity  │◄──│  Proxy   │◄──│  tailscale serve  │  │
│  │  Language     │    │ (:3170)  │    │  (HTTPS :443)    │  │
│  │  Server(s)    │    │  Hono    │    └────────┬─────────┘  │
│  └──────────────┘    └──────────┘             │             │
│                           ▲                    │             │
│                           │                    │             │
│  ┌──────────────┐         │              Tailscale          │
│  │  Vite Dev    │         │              WireGuard          │
│  │  Server      │─────────┘              Tunnel             │
│  │  (:5173)     │                          │                │
│  └──────────────┘                          │                │
└────────────────────────────────────────────┼────────────────┘
                                             │
                    ┌────────────────────────┼──────────┐
                    │      Tailscale Network (100.x.x.x) │
                    │                        │            │
                    │    ┌───────────┐  ┌────┴───────┐   │
                    │    │  iPhone   │  │   iPad     │   │
                    │    │  Safari   │  │   Safari   │   │
                    │    └───────────┘  └────────────┘   │
                    └─────────────────────────────────────┘
```

## Component Architecture

### Proxy (`packages/proxy`)

Hono HTTP + WebSocket server bridging browser ↔ Antigravity Language Server.

```
packages/proxy/src/
├── index.ts              # Server entrypoint, middleware, static serving
├── discovery.ts          # LS instance discovery (process scanning)
├── routing.ts            # Request routing to LS instances
├── exposure.ts           # Host binding validation (CGNAT support)
├── origins.ts            # CORS origin management
├── ws.ts                 # WebSocket streaming bridge
├── rpc.ts                # Connect RPC client for LS communication
├── errors.ts             # Error handling utilities
├── metadata.ts           # Request metadata extraction
├── message-tracker.ts    # WebSocket message tracking
├── conversation-mutations.ts  # Chat mutation handlers
├── step-recovery.ts      # Step recovery for interrupted streams
├── signals.ts            # Graceful shutdown signals
├── transport-hints.ts    # LS transport detection
├── platform/             # OS-specific LS discovery
│   ├── index.ts          # Platform router
│   ├── darwin.ts         # macOS-specific discovery
│   ├── linux.ts          # Linux-specific discovery
│   ├── win32.ts          # Windows-specific discovery
│   ├── shared.ts         # Shared discovery logic
│   └── types.ts          # Platform type definitions
└── routes/               # API route handlers
    ├── conversations.ts  # /api/conversations/*
    ├── models.ts         # /api/models/*
    ├── workspaces.ts     # /api/workspaces/*
    ├── files.ts          # /api/files/*
    ├── search.ts         # /api/search/*
    └── rpcPassthrough.ts # /api/rpc/* (generic RPC proxy)
```

### Web UI (`packages/web`)

React PWA with mobile-first chat interface.

```
packages/web/src/
├── App.tsx               # Root app component
├── main.tsx              # Entry point
├── constants.ts          # App constants
├── api/
│   └── client.ts         # API client (fetch wrapper)
├── components/
│   ├── ChatPanel.tsx     # Main chat view
│   ├── ChatHeader.tsx    # Top bar (model, workspace)
│   ├── ChatInput.tsx     # Message input + attachments
│   ├── StepCards.tsx     # Agent step visualization + approval cards
│   ├── MarkdownContent.tsx # Markdown renderer
│   ├── ModelSelector.tsx # Model picker dropdown
│   ├── WorkspaceSelector.tsx # Workspace picker
│   ├── Sidebar.tsx       # Conversation list sidebar
│   └── Icons.tsx         # SVG icon components
├── hooks/
│   ├── useConversations.ts  # Conversation CRUD
│   ├── useChatActions.ts    # Send/approve/reject
│   ├── useStepsStream.ts    # WebSocket step streaming
│   ├── useWorkspaces.ts     # Workspace management
│   ├── usePolling.ts        # Polling utility
│   ├── useAppResume.ts      # PWA resume handling
│   └── useDraftText.ts      # Draft persistence
├── styles/               # CSS files
└── types/                # TypeScript type definitions
```

### Scripts

```
scripts/
├── common.mjs            # Shared utilities (env loading, process mgmt)
├── dev.mjs               # Local dev server (proxy + web)
└── dev-tailscale.mjs     # Tailscale dev (auto IP detect, then dev.mjs)
```

## Data Flow

### Chat Message Flow

```
User (iPad) → HTTPS → tailscale serve → Vite (:5173)
                                            │
                                    POST /api/conversations/:id/messages
                                            │
                                    Vite proxy → Proxy (:3170)
                                            │
                                    Connect RPC → Antigravity LS
                                            │
                                    LS processes → streams response
                                            │
                                    WebSocket /api/conversations/:id/ws ← Proxy ← LS
                                            │
                                    User sees streaming response
```

### LS Discovery Flow

```
Proxy startup → Platform scanner (darwin.ts)
    │
    ├── Scans running processes for Antigravity LS
    ├── Extracts HTTPS port from process args
    ├── Validates connectivity
    └── Returns LS instance list
```

## Network Architecture

| Layer | Technology | Port |
|-------|-----------|------|
| User access | Tailscale HTTPS | 443 (via `tailscale serve`) |
| Web dev server | Vite | 5173 |
| Proxy API | Hono/Node.js | 3170 |
| Antigravity LS | Connect RPC | Dynamic (50000+) |
| Network encryption | WireGuard (Tailscale) | UDP 41641 |

## Deployment Modes

### Development (two servers)
```
tailscale serve → Vite (:5173) ──proxy──→ Proxy (:3170) → LS
```

### Production (single server)
```
tailscale serve → Proxy (:3170) ──serveStatic──→ Web UI
                       │
                       └──→ Antigravity LS
```
