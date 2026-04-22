# ENOSX AI - Advanced Windows AI Assistant

ENOSX AI is a cutting-edge Windows desktop application powered by **Groq** that brings intelligent AI assistance to your fingertips. Control applications, execute commands, and engage in natural conversations with lightning-fast AI responses.

## Features

- 🤖 **Advanced AI Chat** - Powered by Groq's Mixtral-8x7b model
- ⚡ **Lightning Fast** - Ultra-low latency AI responses with streaming
- 💬 **Real-time Streaming** - See AI responses as they're generated
- 📱 **Modern UI** - Beautiful dark-themed interface with red accents
- 🗂️ **Chat History** - Persistent chat storage with Supabase
- 🚀 **Windows Integration** - Launch apps and execute commands directly

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm package manager
- Groq API key (free tier available at groq.com)
- Supabase account (optional, for chat history)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd enosx-ai
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Fill in the required credentials:

**Groq Setup (Required):**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Create an API key
4. Copy to `GROQ_API_KEY` in `.env.local`

**Supabase Setup (Optional - for chat history):**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings → API
4. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Initialize Database

The database tables are automatically created on first request. To manually initialize:

```bash
curl http://localhost:3000/api/init-db
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building Electron App

### Development

```bash
# Terminal 1: Start Next.js dev server
pnpm dev

# Terminal 2: Run Electron
pnpm electron-dev
```

### Production Build

```bash
pnpm electron-build
```

This creates a Windows installer in the `dist` folder.

## Project Structure

```
enosx-ai/
├── app/
│   ├── api/              # API routes
│   ├── chat/             # Chat pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/
│   ├── ChatSidebar.tsx   # Sidebar component
│   ├── ChatDisplay.tsx   # Message display
│   └── MessageInput.tsx  # Input component
├── hooks/
│   └── useElectronAPI.ts # Electron integration
├── lib/
│   └── supabase.ts       # Supabase client
├── public/
│   ├── electron-main.js  # Electron main process
│   └── electron-preload.js # Preload script
└── scripts/
    └── 01_create_tables.sql # Database schema
```

## API Routes

- `GET/POST /api/chats` - Chat management
- `GET/POST /api/chats/[chatId]/messages` - Message management
- `POST /api/chat` - Chat completions (streaming)
- `GET /api/init-db` - Database initialization

## Features in Development

- [ ] Windows app launching via AI commands
- [ ] System command execution
- [ ] Advanced app control integration
- [ ] Voice input support
- [ ] Custom model selection
- [ ] Advanced prompt templates
- [ ] Export chat history

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key from console.groq.com | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ⚠️ Optional |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ⚠️ Optional |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ⚠️ Optional |

## Troubleshooting

### "Missing Supabase credentials"
- Check that all Supabase environment variables are set in `.env.local`
- Verify credentials are correct

### "Failed to fetch chats"
- Ensure database tables are initialized: `curl http://localhost:3000/api/init-db`
- Check Supabase connection

### Electron app won't start
- Ensure Next.js dev server is running on port 3000
- Check that all dependencies are installed: `pnpm install`

## Technology Stack

- **Frontend**: React 19, Next.js 16, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL) - Optional
- **AI**: Groq Mixtral-8x7b, Vercel AI SDK
- **Desktop**: Electron
- **UI Components**: Tailwind CSS with custom components

## License

Proprietary © 2024 Enosx Technologies

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**ENOSX AI v1.0** - Built with ❤️ for Windows users who demand more from their AI assistant.
