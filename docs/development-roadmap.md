# Development Roadmap

## Completed

### Phase 0: Porta Fork ✅
- [x] Merged upstream l1m80/porta (v0.2.0)
- [x] Replaced Cloudflare with Tailscale
- [x] CGNAT IP support, static serving, dev script
- [x] macOS sandbox resilience
- [x] iPad verified working via `tailscale serve`

---

## Current

### Phase 1: Polish & Stability
- [ ] Auto-start `tailscale serve` in `dev-tailscale.mjs` using `PORTA_TAILSCALE_HOSTNAME`
- [ ] Add health check endpoint for iPad connection status
- [ ] PWA manifest customization (name, icons, theme color)
- [ ] Push notification support (ntfy.sh or Pushover) for tool call approvals
- [ ] Auto-reconnect WebSocket on network changes

### Phase 2: UX Improvements
- [ ] QR code display for quick device pairing
- [ ] Dark/light theme toggle
- [ ] Haptic feedback on tool call approval buttons (iOS)
- [ ] Image attachment preview in chat
- [ ] Conversation search
- [ ] Swipe gestures for sidebar

---

## Future

### Phase 3: Multi-Workspace
- [ ] Workspace dashboard (see all active Antigravity sessions)
- [ ] Quick workspace switcher in bottom tab bar
- [ ] Workspace status indicators (idle, running, waiting approval)

### Phase 4: Notifications
- [ ] Background push notifications when agent needs approval
- [ ] Notification categories (approval, completion, error)
- [ ] Integration with iOS Focus/DND modes

### Phase 5: Offline & Sync
- [ ] Offline conversation viewer (cached in IndexedDB)
- [ ] Background sync when reconnected
- [ ] Export conversation as markdown

---

## Upstream Tracking

Porta upstream releases to potentially cherry-pick:

| Version | Features | Status |
|---------|----------|--------|
| v0.2.0 | Command approval, step recovery | ✅ Merged |
| v0.3.0+ | TBD | Watch `upstream/develop` |

```bash
git fetch upstream
git log upstream/develop --oneline -10
```

---

## Non-Goals

- Native iOS/Android apps (PWA is sufficient)
- Full IDE in browser (Porta is a chat bridge)
- Public internet access (Tailscale-only by design)
- Multi-user support (single-user for security)
