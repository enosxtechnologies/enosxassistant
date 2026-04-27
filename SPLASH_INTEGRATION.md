# SplashScreen — Integration Guide

## What it is
A beautiful, animated **ENOSX AI** splash screen featuring:
- 🔷 **Glassmorphism EX logo** — circular glass disc with layered glow rings, specular highlight, and pulsing cyan/indigo light
- 🌌 **Cosmic dark background** — three ambient blur orbs (cyan, indigo, teal) that float gently
- ✨ **"ENOSX AI"** product name in ultra-light spaced uppercase
- 💫 **Animated loading dots** — three bouncing cyan dots
- ✍️ **"from Enosx Technologies"** — Dancing Script cursive signature at the bottom

Inspired by the splash screens of **Manus** and **Meta** products.

---

## Quick Start

### 1. Install font (optional — already loaded via Google Fonts CDN in component)
The component self-loads `Dancing Script` and `Inter` from Google Fonts automatically.

### 2. Add to your app entry point

**Next.js (`app/page.tsx` or `pages/_app.tsx`):**
```tsx
'use client';
import { useState } from 'react';
import SplashScreen from '@/components/SplashScreen';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} duration={3500} />}
      {/* rest of your app */}
    </>
  );
}
```

**React (`src/App.tsx`):**
```tsx
import { useState } from 'react';
import SplashScreen from '../components/SplashScreen';

function App() {
  const [ready, setReady] = useState(false);

  return (
    <>
      {!ready && <SplashScreen onComplete={() => setReady(true)} duration={3500} />}
      {ready && <YourMainLayout />}
    </>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onComplete` | `() => void` | — | Called when splash finishes (use to unmount/transition to app) |
| `duration` | `number` | `3500` | Total splash duration in milliseconds |

---

## Customisation

| What | Where in `SplashScreen.tsx` |
|------|-----------------------------|
| Logo size | `.sx-glass` — change `width`/`height` |
| Glow color | `.sx-glass`, `.sx-ex` — change `rgba(56,189,248,…)` |
| Speed | `@keyframes sxGlow`, `sxTextPulse`, `sxBounce` |
| Signature text | `<span className="sx-sig-text">` in JSX |
| Duration | Pass `duration` prop in ms |
