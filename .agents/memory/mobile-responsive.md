---
name: Mobile responsiveness pattern
description: How the ENOSX AI app handles mobile vs desktop layout for sidebar, viewport height, and touch targets
---

# Mobile Responsiveness Pattern

## Rule
- Use `h-dvh` (not `h-screen`) for full-height containers — `h-screen` ignores mobile browser chrome
- The Sidebar has two modes: desktop (fixed side panel, collapsed/expanded) and mobile (overlay drawer via `isMobileOpen` prop)
- On mobile, the Sidebar is rendered with `isMobileOpen` and wraps itself in a full-screen backdrop with slide-in animation
- `useIsMobile` hook (from `hooks/use-mobile.tsx`) detects `< 768px` breakpoint via `matchMedia`
- Mobile top bar replaces the sidebar entirely for navigation access (hamburger → `Menu` icon)
- Buttons in CommandBar use `w-9 h-9 sm:w-8 sm:h-8` for larger touch targets on mobile

**Why:** The original app used `h-screen` and a desktop sidebar that took up constant horizontal space, making it unusable on phones. The overlay drawer pattern avoids horizontal space loss on mobile.

**How to apply:** When adding new layout sections, check `isMobile` from `useIsMobile()` and render different variants. For new modals/overlays, use `fixed inset-0 z-50` with a backdrop so they work on both mobile and desktop.
