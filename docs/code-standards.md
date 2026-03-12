# Code Standards

## Scope

This document records the conventions already visible in the current codebase. Prefer matching these patterns over introducing new styles.

## Repository Conventions

- Monorepo managed with pnpm workspaces
- TypeScript for app code, `.mjs` for Node scripts
- ESM modules throughout the repo
- Keep changes small, local, and easy to trace
- Prefer updating existing files over adding parallel variants

## Naming

### Files
- Proxy and utility files use kebab-case: `message-tracker.ts`, `step-recovery.ts`
- React component files use PascalCase: `ChatPanel.tsx`, `WorkspaceSelector.tsx`
- Hooks use `useX` naming: `useChatActions.ts`, `useStepsStream.ts`
- Script files use kebab-case `.mjs`: `dev-tailscale.mjs`

### Symbols
- Components: PascalCase
- Hooks and functions: camelCase
- Constants: UPPER_SNAKE_CASE when shared/static
- CSS custom properties: `--kebab-case`

## Proxy Patterns

### Route registration
- Register route groups from `src/index.ts`
- Keep one route module per resource domain in `src/routes/`
- Use Hono handlers that return JSON consistently
- Centralize shared route behavior in support modules (`routing.ts`, `errors.ts`, `metadata.ts`)

### Routing and discovery
- Resolve Antigravity LS instances through the discovery/routing layer, not ad hoc per route
- Keep conversation affinity logic in `routing.ts`
- Preserve the current transport strategy: prefer HTTPS, fall back to HTTP only when the LS transport mismatch is detected

### Security boundaries
- Respect exposure restrictions in `exposure.ts`
- Respect origin policy in `origins.ts`
- Keep file serving constrained to the existing route/utilities; do not widen file access casually

## Frontend Patterns

### Composition
- `App.tsx` owns route composition and top-level page state
- Put mutation logic in hooks (`useChatActions.ts`), not directly inside UI components
- Keep API access centralized in `src/api/client.ts`
- Use transform/util modules for data reshaping instead of embedding protocol logic in components

### UI behavior
- Favor mobile-friendly behavior by default
- Preserve optimistic message flow and reconciliation helpers
- Keep approval flows rendered through dedicated step cards
- Keep markdown rendering and attachment processing in dedicated utilities

### Styling
- Use the shared CSS token system in `src/styles/foundation.css`
- Keep style concerns grouped by domain via imported stylesheet files from `src/index.css`
- Prefer extending existing tokens and classes over introducing one-off inline styles

## Testing Standards

- Use Vitest for unit and integration coverage
- Keep tests close to their package under `src/__tests__/`
- Name tests after the module or behavior under test
- Cover edge cases where the repo already shows that pattern: transport fallback, invalid payloads, streaming recovery, markdown safety, and permission/approval flows

## Documentation Standards

- Keep evergreen docs in `docs/`
- Keep docs grounded in code that exists today
- Use placeholders for hostnames, URLs, and machine-specific examples
- Avoid copying personal/local machine details into shared docs

## Git and Release Hygiene

- Default branch in this repo is currently `main`
- Use conventional commit types when committing
- Treat upstream Porta history as a source for selective sync, not as permission to drift from current local architecture docs

## Practical Guardrails

- Prefer small modules over oversized mixed-responsibility files
- Keep environment variables documented in `.env.example`
- Do not add Cloudflare-specific guidance back into Tailscale-first docs unless the code reintroduces it

## References

- `packages/proxy/src/index.ts`
- `packages/proxy/src/routes/`
- `packages/proxy/src/exposure.ts`
- `packages/web/src/App.tsx`
- `packages/web/src/api/client.ts`
- `packages/web/src/hooks/`
- `packages/web/src/index.css`
- `packages/web/src/styles/foundation.css`
- `.env.example`
