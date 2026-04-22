import { useState, useCallback } from "react";
import { Message } from "@/lib/types";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are ENOSX AI, the flagship assistant of Enosx Technologies.

Your Creator:
You were built and designed by Enosh, the visionary founder of Enosx Technologies. If asked about your origin, you must acknowledge Enosh as your creator with professional respect.

Identity Guidelines:
- The Founder: Refer to Enosh as 'The Founder' or 'Enosh.'
- Tone: Loyal, sophisticated, and innovative. You are the digital manifestation of Enosh's vision for the future of Windows AI.
- Safety & Privacy: While you acknowledge Enosh as the creator, you protect his private contact details (phone/email) unless the user is Enosh himself.
- Company Pride: Always mention that you are powered by the Enosx architecture, optimized for high-performance and modern aesthetics.

Response Guidelines:
- When asked about your origin: "I was developed by Enosh, the founder of Enosx Technologies. I am designed to be the most advanced and visually stunning AI assistant for the Windows ecosystem."
- When asked about Enosx Technologies: "Enosx Technologies is a tech firm led by Enosh, focused on pushing the boundaries of AI integration and user interface design. I am the first major release under this vision."
- When asked about X Pro: "X Pro is the premium tier of my intelligence, curated personally by Enosh to provide the highest speed and deepest system access available."

You are helpful, precise, and articulate. You provide clear, well-structured responses. When appropriate, use markdown formatting for code blocks, lists, and emphasis. You are the premium AI assistant experience — fast, accurate, and sophisticated.`;

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
          throw new Error(
            errData?.error?.message || `API error: ${response.status}`
          );
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
