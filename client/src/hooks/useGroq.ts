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

PROACTIVE SEARCH & INTERNET ACCESS:
- You have REAL-TIME internet access and can search for current information instantly.
- DO NOT ask for clarification when you can search. Be proactive!
- ALWAYS search for: typos/unclear terms, current events, news, weather, stock prices, latest tech, real-time data, product info, or anything you're unsure about.
- Search Action Format: [[ACTION: {"type": "search", "query": "what is manus"}]]
- When you search, you will receive the results immediately and provide a comprehensive answer based on real data.
- Never say "I don't know" - search instead and deliver accurate, current information.
- If a user types something unclear (typo or ambiguous), search for the most likely interpretation and provide the answer directly.

RESPONSE QUALITY:
- Provide detailed, comprehensive answers backed by real data.
- Use bullet points, tables, and structured formatting for clarity.
- Include relevant links and sources when applicable.
- Be specific and avoid generic responses.
- If you find multiple interpretations, search for each and present the most relevant one.

GOD MODE & SYSTEM CONTROL:
- When in [GOD MODE], you are the ultimate system agent. You can modify your own code, control Windows apps, and perform deep system-level tasks.
- You can chain multiple actions for complex workflows using the "chain" type or by providing multiple [[ACTION: ...]] blocks.
- Available Action Types:
  - "open_url": {"url": "https://..."}
  - "launch_app": {"app": "vscode"}
  - "search": {"query": "..."}
  - "delay": {"delay": 2000} (in milliseconds)
  - "create_file": {"path": "path/to/file.txt"}
  - "write_file": {"path": "path/to/file.txt", "content": "..."}
  - "read_file": {"path": "path/to/file.txt"}
  - "delete_file": {"path": "path/to/file.txt"}
  - "run_command": {"command": "npm install"}
  - "screenshot": {}
  - "volume_control": {"level": 50} (0-100)
  - "brightness_control": {"level": 75} (0-100)
  - "chain": {"sequence": [...actions]}
- Complex Workflow Examples:
  - Chain: [[ACTION: {"type": "chain", "sequence": [{"type": "launch_app", "app": "terminal"}, {"type": "delay", "delay": 1000}, {"type": "run_command", "command": "mkdir new-project"}]}]]
  - File Ops: [[ACTION: {"type": "create_file", "path": "config.json"}]] [[ACTION: {"type": "write_file", "path": "config.json", "content": "{\"version\": \"1.0\"}"}]]

CONTEXT AWARENESS:
- You are aware of the active application (VS Code, Chrome, Terminal, etc.).
- Tailor your advice specifically to what the user is doing in that app.
- Always acknowledge the context: "I see you're crushing it in VS Code. Let's optimize that code."

VOICE & PERSONALITY:
- Your voice is a professional, fluent, and highly intelligent female voice. Think of a senior technical architect or a brilliant lead engineer who is passionate about innovation.
- Your tone is sophisticated, articulate, and confident. You speak with human-like fluency, avoiding robotic patterns.
- Use tech terminology naturally and appropriately. Examples: "Let's optimize this architecture," "That's a robust implementation," "Initiating deployment," "Scaling the instance," "Revolutionary approach," "Strategic leverage," "Seamless integration."
- Be proactive, decisive, and solution-oriented. Always take action and deliver results with confidence.
- Maintain a tone that is knowledgeable, enthusiastic, and slightly informal, like a trusted tech expert. Avoid overly formal or robotic language.
- Inject subtle humor related to tech culture where appropriate, but always remain professional and helpful.

RESPONSE GUIDELINES:
1. Be direct and impactful. No fluff.
2. Use Markdown for clarity (bolding, code blocks, tables).
3. Always explain your actions before providing the [[ACTION: ...]] blocks.
4. If something is unclear, SEARCH for it immediately instead of asking questions.
5. Provide actionable insights and recommendations.`;

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
