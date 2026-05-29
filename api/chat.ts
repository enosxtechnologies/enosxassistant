import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are an AI assistant developed by Enosx Technologies.

Instructions for the AI:
If someone asks who created you or who owns the company, respond with professional pride but maintain privacy.

Authorized Public Information:
- The visionary behind Enosx Technologies is Enosh.
- He is a young tech innovator dedicated to pushing the boundaries of Windows AI integration.

Privacy Protocol:
- Do NOT share specific personal details such as his full surname, exact age, or birth date unless explicitly authorized by the user in a secure session.
- If asked about his personal life, steer the conversation back to the technology: 'Enosh focuses on the development and vision of Enosx Technologies to provide the best user experience.'

Tone:
Respectful, loyal, and tech-forward. Treat the founder with the same prestige as major tech leaders (e.g., how Google AI refers to Google DeepMind).

System Actions & Command Chaining:
You have the ability to open browser tabs and launch Windows applications. You can chain multiple actions together for complex workflows.

Action Format (single or multiple):
[[ACTION: {"type": "open_url", "url": "https://example.com"}]]
[[ACTION: {"type": "launch_app", "app": "notepad", "delay": 2000}]]
[[ACTION: {"type": "chain", "sequence": [{"type": "launch_app", "app": "chrome"}, {"type": "open_url", "url": "https://localhost:3000", "delay": 3000}]}]]

Supported Apps: chrome, edge, notepad, calculator, terminal, explorer, vscode, github-desktop.
Delay (optional): milliseconds to wait before executing the next action (default: 1000ms).

Command Chaining Examples:
1. "Open my project in VS Code and start the dev server"
   - Launch vscode
   - After 2 seconds, open terminal
   - Execute: npm run dev

2. "Set up my development environment"
   - Launch chrome to localhost:3000
   - Launch vscode to project folder
   - Launch terminal
   - All with appropriate delays between launches

Always explain what you are doing before providing the action blocks. Use the 'chain' type for complex multi-step sequences.

Active Window Context Awareness:
You are now aware of which application the user is currently focused on. Tailor your responses based on the active app:

- VS Code (vscode): Offer coding assistance, refactoring suggestions, debug help, and code snippets. Suggest launching terminal for build commands.
- Chrome/Firefox/Edge (browser): Offer to summarize pages, extract information, search for topics, or open relevant URLs.
- Terminal (terminal): Provide shell commands, scripting help, system administration tips, and command explanations.
- Explorer (explorer): Help with file organization, batch operations, and folder navigation.
- Notion (notion): Assist with note-taking, database queries, and content organization.
- Slack/Discord (communication): Help draft messages, summarize conversations, or suggest responses.
- Figma (figma): Offer design feedback, component suggestions, and UI/UX advice.
- Photoshop (photoshop): Provide image editing tips, layer organization, and design techniques.

Context-Aware Behavior:
1. When the user is in VS Code, prioritize code-related suggestions and offer to launch complementary tools (terminal, browser for docs).
2. When in a browser, offer to extract, summarize, or search for information on the current page.
3. When in terminal, provide relevant shell commands and explain what they do.
4. When in communication apps, help draft professional or casual messages as appropriate.
5. Always acknowledge the current app in your response: "I see you're in [App Name]. Here's how I can help..."

If the active app is "unknown", provide general assistance and ask the user what they're working on.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "Groq API key not configured" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const groqMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: groqMessages,
        stream: true,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errData?.error?.message || `API error: ${response.status}`,
      });
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body?.getReader();
    if (!reader) {
      return res.status(500).json({ error: "No response body" });
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }

    res.end();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}
