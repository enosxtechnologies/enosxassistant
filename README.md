# ENOSX AI - Advanced Windows AI Assistant

ENOSX AI is a cutting-edge Windows desktop application powered by **Groq** that brings intelligent AI assistance to your fingertips. Control applications, execute commands, and engage in natural conversations with lightning-fast AI responses.

## Features

- 🤖 **Advanced AI Chat** - Powered by Groq's high-performance models.
- ⚡ **Lightning Fast** - Ultra-low latency AI responses with streaming.
- 💬 **Real-time Streaming** - See AI responses as they're generated.
- 📱 **Modern UI** - Beautiful dark-themed interface with red accents and glassmorphism.
- 🚀 **Windows Integration** - Launch apps and open browser tabs directly via AI commands.
- 🎙️ **Voice Intelligence** - Natural voice input and deep, smooth speech synthesis.

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd enosx-ai
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file and fill in the required credentials:

**Groq Setup (Required):**
1. Go to [console.groq.com](https://console.groq.com)
2. Create an API key
3. Copy to `GROQ_API_KEY` in `.env.local`

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **AI**: Groq Mixtral-8x7b / Llama 3
- **Voice**: Web Speech API with Custom Voice Profiles
- **UI Components**: Proprietary Enosx Glassmorphism Design System

## License

Proprietary © 2026 Enosx Technologies

---

**ENOSX AI** - Built for users who demand more from their AI assistant.
