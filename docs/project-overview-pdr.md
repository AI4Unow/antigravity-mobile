# Porta — Product Overview

## Vision

Porta enables Antigravity users to access their local AI agent sessions from any device (phone, tablet, other computers) on their private Tailscale network. It provides a mobile-friendly, installable PWA chat interface that bridges to Antigravity's Language Server without exposing anything to the public internet.

## Problem Statement

Antigravity Agent Manager runs locally on a Mac. Users need to:
- Monitor long-running agent tasks from mobile devices
- Approve/reject agent tool calls from anywhere in the house/office
- Chat with agents from a phone or tablet
- Keep access private and secure (no public internet exposure)

## Solution

A two-part system:
1. **Proxy** — HTTP/WebSocket bridge from the network to Antigravity's Language Server
2. **Web UI** — React PWA installable on mobile home screens

Deployed on the same Mac running Antigravity, accessible via Tailscale's encrypted mesh VPN.

## User Personas

| Persona | Needs |
|---------|-------|
| **Developer at desk** | Full Antigravity IDE experience |
| **Developer on couch** | Monitor tasks, approve actions, quick chat from phone/iPad |
| **Developer on the go** | Check agent status, respond to approvals (Tailscale required) |

## Core Features

### Implemented (v0.2.0)
- Chat with Antigravity agents via mobile browser
- Real-time streaming responses via WebSocket
- Conversation history and management
- Command approval/rejection (tool calls)
- Model selection
- File browsing
- Workspace selection (multi-project)
- PWA installable via HTTPS (tailscale serve)
- Tailscale-only access (CGNAT IP support)
- Auto Tailscale IP detection
- Single-port production mode (proxy serves web UI)

### Not In Scope
- Full IDE features (file editing, terminal, git)
- Multi-user access
- Public internet exposure
- Native mobile apps

## Success Metrics

| Metric | Target |
|--------|--------|
| Connection setup time | < 2 minutes from install |
| Response latency | < 100ms over Tailscale |
| PWA install rate | Works on iOS Safari + Android Chrome |
| Uptime | Runs as long as Antigravity is running |

## Security Model

- **Network**: Tailscale WireGuard encryption (no public exposure)
- **Authentication**: Tailscale identity (device must be on your tailnet)
- **Authorization**: Single-user (proxy only connects to local LS instances)
- **Firewall bypass**: `tailscale serve` routes through Tailscale's stack, no open ports needed

## Technical Constraints

- Antigravity must be running for the proxy to function
- Devices must be on the same Tailscale network
- HTTPS requires `tailscale serve` (for PWA installability)
- macOS firewall may block direct IP access (use `tailscale serve`)
