# ENOSX AI - Quick Start Guide

Get ENOSX AI running in 5 minutes!

## ⚡ Fast Setup

### Step 1: Create Accounts (2 min)

**Supabase** (Free Database)
- Go to [supabase.com/sign-up](https://supabase.com/sign-up)
- Create account
- Create new project (PostgreSQL)
- Copy Project URL and API Keys

**OpenAI** (AI Engine)
- Go to [platform.openai.com](https://platform.openai.com)
- Sign up / Login
- Get API Keys section
- Create new secret key

### Step 2: Clone & Install (1 min)

```bash
# Clone this repo
git clone <repo-url> enosx-ai
cd enosx-ai

# Install dependencies
pnpm install
```

### Step 3: Configure (1 min)

```bash
# Copy example env file
cp .env.example .env.local

# Edit with your credentials
nano .env.local
# or use your favorite editor
```

**Fill in these 4 values:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### Step 4: Run (1 min)

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🚀

## 🎯 First Chat

1. Click "Get Started" or "Start Chatting"
2. Type a message: "Hello ENOSX!"
3. Watch the AI respond in real-time
4. Messages auto-save to your database

## 📦 What You Get

✅ Beautiful dark-themed chat interface  
✅ Real-time streaming responses  
✅ Chat history saved to database  
✅ OpenAI GPT-4 integration  
✅ Responsive design  
✅ Ready for Electron desktop app  

## 🚀 Next Steps

### Try These Commands

```
"What is the current time?"
"List system information"
"Help me write a Python script"
"Explain quantum computing"
```

### Enable Electron Desktop App

```bash
# Terminal 1: Dev server
pnpm dev

# Terminal 2: Electron app
pnpm electron-dev
```

### Deploy to Web

```bash
# Push to GitHub
git push

# Deploy to Vercel
# Visit vercel.com → Import Repository
# Add environment variables
# Click Deploy
```

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `pnpm install` |
| "Missing env variables" | Check `.env.local` file |
| "Database error" | Visit init-db: `localhost:3000/api/init-db` |
| "No AI response" | Check OpenAI API key is valid |

## 📚 Learn More

- [Full Setup Guide](README.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Architecture Docs](ARCHITECTURE.md)

## 💡 Pro Tips

1. **Better Responses**: Give context in your prompts
2. **Save Chats**: Click chat in sidebar to resume
3. **Customize**: Edit theme in Tailwind config
4. **Scale**: Deploy to Vercel for production

## 🎓 What's Included

```
enosx-ai/
├── Chat Interface (React + Framer Motion)
├── API Routes (Next.js)
├── Database (Supabase PostgreSQL)
├── AI Engine (OpenAI)
├── Electron Support (Desktop app)
└── Everything else you need!
```

## 📞 Need Help?

- Check [GitHub Issues](https://github.com/yourusername/enosx-ai/issues)
- Read [README.md](README.md) for detailed docs
- Check env variables are set correctly

---

**That's it! You now have ENOSX AI running.** 🎉

Enjoy your advanced Windows AI assistant!
