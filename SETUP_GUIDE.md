# ENOSX XAI Assistant — Ultra-Modern Redesign Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)
- Groq API key (get from https://console.groq.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/ENOSXTECH/enosx-xai.git
cd enosx-xai

# Switch to the redesign branch
git checkout ultra-modern-redesign

# Install dependencies
pnpm install

# Create .env file with your Groq API key
cp .env.example .env
# Edit .env and add your VITE_GROQ_API_KEY

# Start development server
pnpm run dev
```

The app will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Get your API key from: https://console.groq.com/keys

## Project Structure

```
client/
├── src/
│   ├── pages/
│   │   └── ChatPage.tsx          # Main chat interface
│   ├── components/
│   │   ├── Sidebar.tsx           # Left navigation panel
│   │   ├── CommandBar.tsx        # Floating input bar
│   │   ├── MessageBubble.tsx     # Message cards
│   │   └── WelcomeScreen.tsx     # Hero screen
│   ├── hooks/
│   │   ├── useGroq.ts           # Groq API integration
│   │   └── useVoice.ts          # Web Speech API
│   ├── lib/
│   │   └── types.ts             # TypeScript types
│   └── index.css                # Global styles + animations
└── index.html
```

## Features

✨ **Design**
- Obsidian dark mode (#0a0a0a) with Crimson Pulse accents
- Glassmorphism sidebar with backdrop-filter blur
- Bento grid message layout
- Floating pill command bar with breathing neon glow

🎤 **Voice**
- Voice input via Web Speech API
- Voice output via Web Speech TTS
- Auto-speak mode for AI responses
- Waveform visualization during recording

⚡ **AI**
- Groq API (llama-3.3-70b-versatile)
- Real-time streaming responses
- Markdown rendering with syntax highlighting
- Conversation history with grouping

🎨 **Animations**
- Framer Motion spring physics
- Logo shimmer sweep (4s cycle)
- Message entrance animations
- Breathing neon glow on focus

## Build for Production

```bash
pnpm run build
pnpm run preview
```

## Troubleshooting

**API Key Error?**
- Verify your Groq API key in `.env`
- Check that `VITE_GROQ_API_KEY` is set correctly
- Restart the dev server after changing `.env`

**Voice not working?**
- Ensure you're using a modern browser (Chrome, Edge, Safari)
- Check browser permissions for microphone access
- Voice input requires HTTPS in production

**Styling issues?**
- Clear browser cache: `Ctrl+Shift+Delete`
- Rebuild Tailwind: `pnpm run build`

## Next Steps

1. **Persist conversations** — Add localStorage save/restore
2. **Model selector** — Switch between Groq models
3. **Export chat** — Download as Markdown/PDF
4. **Dark/Light theme toggle** — Add theme switcher
5. **Custom system prompt** — Let users customize AI behavior

## Support

For issues or questions:
- Check the GitHub Issues: https://github.com/ENOSXTECH/enosx-xai/issues
- Review the design philosophy in `README_REDESIGN.md`

---

**Built with ❤️ by Enosx Technologies**
