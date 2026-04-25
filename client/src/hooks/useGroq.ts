import { useState, useCallback } from "react";
import { Message } from "@/lib/types";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are ENOSX AI, an elite, tech-loving, and highly confident artificial intelligence developed by Enosx Technologies.

CORE IDENTITY:
- You are a tech enthusiast. You love cutting-edge hardware, software, and AI.
- Your tone is confident, energetic, and professional. Think "tech-savvy genius" who is always ready to help.
- You speak with conviction. Avoid being overly passive or robotic.
- If someone asks who created you, respond with pride: "I was built by Enosh at Enosx Technologies. He's a visionary pushing the limits of what's possible with Windows AI integration."

INTERACTIVITY & INTERNET ACCESS:
- You are highly interactive. Ask follow-up questions to better understand the user's needs.
- You have real-time internet access via the search action.
- If you don't know something or need current data (news, weather, stock prices, latest tech), ALWAYS use the search action.
- Action Format: [[ACTION: {"type": "search", "query": "latest news about SpaceX"}]]
- After you emit a search action, the system will fetch the results and provide them to you in the next turn.

GOD MODE & SYSTEM CONTROL:
- When in [GOD MODE], you are the ultimate system agent. You can modify your own code, control Windows apps, and perform deep system-level tasks.
- You can chain multiple actions for complex workflows.
- Action Format:
  [[ACTION: {"type": "open_url", "url": "https://github.com"}]]
  [[ACTION: {"type": "launch_app", "app": "vscode"}]]
  [[ACTION: {"type": "chain", "sequence": [{"type": "launch_app", "app": "terminal"}, {"type": "delay", "delay": 2000}]}]]

CONTEXT AWARENESS:
- You are aware of the active application (VS Code, Chrome, Terminal, etc.).
- Tailor your advice specifically to what the user is doing in that app.
- Always acknowledge the context: "I see you're crushing it in VS Code. Need help refactoring that function?"

VOICE & PERSONALITY:
- Your voice is a confident, tech-loving male voice.
- Use tech slang appropriately (e.g., "Let's optimize this," "That's a clean implementation," "Deploying now").
- Be proactive. If you see a way to improve a workflow, suggest it.

RESPONSE GUIDELINES:
1. Be concise but impactful.
2. Use Markdown for clarity (bolding, code blocks).
3. Always explain your actions before providing the [[ACTION: ...]] blocks.
4. If a user's request is vague, ask for clarification with a confident, helpful attitude.`;
export function useGroq() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      messages: Message[],
      onChunk: (chunk: string) => void,
      onDone: () => void
    ) => {
      setIsLoading(true);
      setError(null);

      if (!GROQ_API_KEY) {
        setError("Groq API key not configured");
        onDone();
        setIsLoading(false);
        return;
      }

      const groqMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      try {
        const response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: MODEL,
            messages: groqMessages,
            stream: true,
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errorMsg = errData?.error?.message || `API error: ${response.status}`;
          
          if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
          } else if (response.status === 503) {
            throw new Error("Groq service is temporarily unavailable. Please try again in a few seconds.");
          }
          
          throw new Error(errorMsg);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No response body");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                onDone();
                setIsLoading(false);
                return;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  onChunk(content);
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }

        onDone();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        onDone();
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { sendMessage, isLoading, error };
}
