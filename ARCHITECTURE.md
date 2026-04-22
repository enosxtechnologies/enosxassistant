# ENOSX AI Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    ENOSX AI System                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐         ┌──────────────────┐      │
│  │  Electron App   │◄────────┤ Next.js Server   │      │
│  │  (Windows)      │         │  (Web UI)        │      │
│  └─────────────────┘         └──────────────────┘      │
│         │                              │                 │
│         │      HTTP/WebSocket          │                │
│         └──────────────────┬───────────┘                 │
│                            │                            │
│                    ┌───────▼────────┐                   │
│                    │  API Routes    │                   │
│                    │  ├ /chat       │                   │
│                    │  ├ /chats      │                   │
│                    │  ├ /messages   │                   │
│                    │  └ /init-db    │                   │
│                    └───────┬────────┘                   │
│                            │                            │
│         ┌──────────────────┼──────────────────┐         │
│         │                  │                  │         │
│    ┌────▼───┐       ┌─────▼────┐      ┌─────▼─────┐   │
│    │Supabase│       │  OpenAI  │      │ System    │   │
│    │Database│       │   API    │      │ Commands  │   │
│    └────────┘       └──────────┘      └───────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **UI Components**: shadcn/ui (custom select)
- **State Management**: React hooks + SWR
- **Desktop**: Electron (Windows native)

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Authentication**: Supabase Auth (extensible)
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI GPT-4 with streaming
- **Streaming**: Vercel AI SDK

### Infrastructure
- **Hosting**: Vercel (web), Desktop (Electron)
- **Database**: Supabase (managed PostgreSQL)
- **CDN**: Vercel Edge Network
- **Monitoring**: Built-in Vercel analytics

## Component Architecture

### Client-Side Components

```
App Root
├── ChatSidebar
│   ├── Chat List
│   └── New Chat Button
├── ChatDisplay
│   ├── Message List
│   ├── Loading Animation
│   └── Welcome Screen
└── MessageInput
    ├── Text Area
    └── Send Button
```

### Data Flow

```
User Input
    │
    ▼
MessageInput Component
    │
    ▼
Chat Page Handler
    │
    ├─► Save to Local State
    │
    ├─► POST /api/chats/[id]/messages
    │   └─► Save to Supabase
    │
    └─► POST /api/chat (Streaming)
        │
        ├─► Call OpenAI API
        │
        ├─► Stream Response
        │
        └─► POST /api/chats/[id]/messages
            └─► Save Assistant Response
```

## Database Schema

### Chats Table
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  chat_id UUID FOREIGN KEY,
  role VARCHAR(50), -- 'user' | 'assistant'
  content TEXT,
  created_at TIMESTAMP
)
```

### Indexes
- `messages.chat_id` - For fast message lookup
- `chats.created_at` - For sorting chats

## API Endpoints

### Chat Management
- `POST /api/chats` - Create new chat
- `GET /api/chats` - List all chats
- `DELETE /api/chats/:id` - Delete chat

### Messages
- `GET /api/chats/:chatId/messages` - Get chat messages
- `POST /api/chats/:chatId/messages` - Save message

### Chat Streaming
- `POST /api/chat` - Send message & get streaming response

### System
- `GET /api/init-db` - Initialize database tables

## State Management

### Local Component State
- Current chat ID
- Messages array
- Loading state
- Input text

### Server State (Supabase)
- Chat history
- Message persistence
- User data (when auth added)

### Real-time Updates
- Supabase real-time subscriptions (optional)
- Polling for simplicity
- WebSocket for advanced features

## Security Considerations

### Current Implementation
- Supabase anon key for reads/writes
- Service role key server-side only
- No user authentication (open chat)
- RLS disabled for demo

### Production Hardening
1. **Authentication**
   - Implement Supabase Auth
   - Add user sessions
   - Enforce row-level security

2. **Authorization**
   - RLS policies per user
   - API key validation
   - Rate limiting

3. **Data Protection**
   - Encryption at rest
   - HTTPS only
   - CORS restrictions

4. **Monitoring**
   - Error logging (Sentry)
   - Performance tracking
   - Audit logs

## Performance Optimization

### Frontend
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image
- **Bundle Analysis**: `npx next-bundle-analyzer`
- **Caching**: Static generation where possible

### Backend
- **Message Streaming**: Real-time response display
- **Database Indexing**: Chat & message lookups
- **API Response Caching**: ETags, 304s
- **Connection Pooling**: Via Supabase

### Deployment
- **CDN**: Vercel Edge Network
- **Compression**: GZIP/Brotli
- **Minification**: Automatic
- **Tree Shaking**: Webpack optimization

## Scaling Strategy

### Horizontal
- Stateless Next.js API routes
- Multiple Vercel regions
- Load balancing via Vercel

### Vertical
- Database query optimization
- Caching layers (Redis possible)
- Connection pooling tuning

### Database
- Read replicas for scaling
- Partitioning for large tables
- Backup & recovery strategy

## Electron Integration

### IPC Channels
- `launch-app` - Execute Windows app
- `execute-command` - Run system commands
- `get-system-info` - Retrieve system data

### Process Model
- Main process: App lifecycle & system calls
- Renderer process: UI (Next.js server)
- Preload: Secure IPC bridge

### Build Process
```
Next.js Build
    │
    ├─► Static export (/out)
    │
    └─► Package with Electron
        │
        └─► Create Windows installer
```

## Development Workflow

### Local Development
```bash
# Terminal 1: Next.js dev server
pnpm dev

# Terminal 2: Electron app
pnpm electron-dev

# Result: Full-featured desktop app
```

### Testing
- Manual testing in browser
- Electron dev tools
- Console logs for debugging
- Network tab for API calls

### Debugging
- Browser DevTools (F12)
- Electron DevTools
- Server logs in terminal
- Supabase dashboard

## Deployment Architecture

### Web (Vercel)
```
┌──────────────────┐
│   Vercel Edge    │
│     Network      │
└────────┬─────────┘
         │
    ┌────▼────────┐
    │ Next.js App │
    │  (Vercel)   │
    └────┬────────┘
         │
    ┌────▼────────────┐
    │  Supabase       │
    │  (PostgreSQL)   │
    └─────────────────┘
```

### Desktop (Electron)
```
┌──────────────────┐
│  Windows App     │
│  (Electron)      │
└────────┬─────────┘
         │
    ┌────▼────────────┐
    │  Next.js Web    │
    │  or Vercel      │
    └────┬────────────┘
         │
    ┌────▼────────────┐
    │  Supabase       │
    │  (PostgreSQL)   │
    └─────────────────┘
```

## Roadmap

### Phase 1 (Current)
- ✅ Chat interface
- ✅ Message persistence
- ✅ Streaming responses
- ✅ Chat history

### Phase 2
- [ ] User authentication
- [ ] App launching
- [ ] Command execution
- [ ] System info display

### Phase 3
- [ ] Voice input/output
- [ ] Custom models
- [ ] Advanced prompts
- [ ] Export/import chats

### Phase 4
- [ ] Plugins system
- [ ] Custom integrations
- [ ] Team features
- [ ] Advanced analytics

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
