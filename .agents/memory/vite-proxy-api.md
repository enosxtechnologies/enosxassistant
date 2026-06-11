---
name: Vite proxy for API
description: The frontend fetch("/api/chat") must be proxied by Vite to the Express API server; without it requests fail silently
---

# Vite Proxy Required for API Calls

## Rule
The Vite dev server must proxy `/api/*` to the Express API server (port 8080). Without this, frontend `fetch("/api/chat")` hits the Vite dev server and returns 404, so the AI never responds.

```ts
// vite.config.ts server section
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8080",
      changeOrigin: true,
    },
  },
}
```

**Why:** In Replit's pnpm workspace, the React frontend (port 18426) and Express API (port 8080) are separate processes. Root-relative URLs like `/api/chat` resolve to the frontend's own port, not the API port. Vite's proxy bridges this gap in development.

**How to apply:** Any new API endpoint added to the Express server is automatically proxied once this config is in place. For production (deployment), Replit's application router handles the routing via port mapping (8080 → external 80).
