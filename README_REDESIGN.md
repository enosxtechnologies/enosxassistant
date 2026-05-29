# ENOSX XAI Assistant — Ultra-Modern Redesign

## Design Philosophy: "Crimson Matrix" — Cyberpunk Glassmorphism

This branch contains a complete redesign of the ENOSX XAI Assistant interface, inspired by Microsoft Copilot and Google Gemini aesthetics.

## Key Design Features

| Feature | Old Version | New Version |
|---------|-------------|-------------|
| Corners | Sharp / 4-8px | 24-32px super rounded |
| Borders | Solid Red | Translucent White (10% opacity) |
| Background | Flat Black | Blurred Acrylic / Mesh Gradient |
| Buttons | Square | Floating Action Buttons (FAB) |
| Theme | Basic Dark | Obsidian #0a0a0a + Crimson Pulse |

## Tech Stack
- **React 19** + TypeScript + Vite
- **Framer Motion** — spring physics animations
- **Tailwind CSS 4** — utility-first styling
- **Groq API** — llama-3.3-70b-versatile (streaming)
- **Web Speech API** — voice input + TTS output

## Components
- `Sidebar.tsx` — Floating acrylic panel, 24px radius, crimson active glow
- `MessageBubble.tsx` — Bento grid cards, AI gradient background
- `CommandBar.tsx` — Pill-shaped floating input, breathing neon glow
- `WelcomeScreen.tsx` — Hero with shimmer logo + suggestion chips

## Animations
- Message entrance: spring(stiffness: 320, damping: 28)
- Command bar focus: breathing crimson neon glow
- Logo: shimmer sweep every 4s
- Voice: radial pulse ring animation
- Waveform: real-time bar animation during voice input

## Voice Features
- 🎤 Voice input via Web Speech API (click mic button)
- 🔊 Voice output via Web Speech TTS (click speaker on AI messages)
- ⚡ Auto-speak mode: AI responses read aloud automatically after voice input
