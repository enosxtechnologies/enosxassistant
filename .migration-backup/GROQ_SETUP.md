# Groq API Setup Guide for ENOSX AI

ENOSX AI uses **Groq's Mixtral-8x7b** model for lightning-fast AI responses. Follow this guide to set up your Groq API key.

## Get Your Groq API Key

### Step 1: Create a Groq Account
1. Go to [console.groq.com](https://console.groq.com)
2. Click **Sign Up** (or **Sign In** if you already have an account)
3. Complete the registration process

### Step 2: Get Your API Key
1. Once logged in, go to **API Keys** section
2. Click **Create API Key**
3. Name it something like "ENOSX AI"
4. Copy the API key (starts with `gsk_`)

### Step 3: Configure ENOSX AI
1. Open `.env.local` in your project root
2. Set your API key:
   ```
   GROQ_API_KEY=gsk_your_actual_api_key_here
   ```
3. Save the file

## Verify Setup

Test your API key with:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "chatId": "test"
  }'
```

You should see a streaming response from Groq.

## Available Models

ENOSX AI uses **mixtral-8x7b-32768** by default, which offers:
- ⚡ Ultra-low latency (often <1 second)
- 💪 High performance for complex tasks
- 🆓 Free tier available
- 📊 32K token context window

## Troubleshooting

### "Groq API key not configured"
- Check that `GROQ_API_KEY` is set in `.env.local`
- Restart the dev server after adding the key
- Verify the key starts with `gsk_`

### Slow responses
- Groq is usually fast, but network latency may vary
- Check your internet connection
- Try a simple query first: "Say hello"

### Rate limiting
- Free tier has generous limits
- If you hit rate limits, wait a moment and try again
- Upgrade to a paid plan if needed

## What is Groq?

Groq is a company that specializes in **Language Processors (LPUs)** - specialized hardware designed specifically for LLM inference. This means:

- **Faster**: Response times measured in milliseconds
- **Cost-effective**: Generous free tier
- **Reliable**: Enterprise-grade infrastructure
- **No subscription needed**: Pay as you go or free tier

Learn more at [groq.com](https://groq.com)

## Model Information

**Mixtral 8x7B**
- Parameters: 8x7B (Sparse Mixture of Experts)
- Context: 32,768 tokens
- Training data: Up to April 2024
- Use cases: General purpose, coding, analysis
- Speed: Extremely fast with Groq LPU

## Support

For Groq-specific issues:
- Check [Groq Docs](https://console.groq.com/docs)
- Visit [Groq Discord](https://discord.gg/groq)

For ENOSX AI issues:
- Check the main README.md
- Open an issue on GitHub
