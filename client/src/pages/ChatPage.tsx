/*
 * ENOSX XAI Assistant — ChatPage
 * Design: "Crimson Matrix" — Cyberpunk Glassmorphism
 * Layout: Left floating acrylic sidebar + right bento chat area + floating pill command bar
 * Theme: Obsidian #0a0a0a + Crimson Pulse #dc143c + Glass surfaces
 * Features: Groq streaming API + Web Speech API voice input + TTS voice output
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import MessageBubble from "@/components/MessageBubble";
import CommandBar from "@/components/CommandBar";
import WelcomeScreen from "@/components/WelcomeScreen";
import { useGroq } from "@/hooks/useGroq";
import { useVoice } from "@/hooks/useVoice";
import { Conversation, Message } from "@/lib/types";
import { BotMessageSquare, Wifi, Zap, ChevronDown, Mic, Info } from "lucide-react";
import { useLocation } from "wouter";

const BG_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663581012760/3KsVJNzTNHX32FLQf9aZCC/enosx-bg-mesh-dMF6AjTJ234cK4z3d5pivU.webp";

function createConversation(): Conversation {
  return {
    id: nanoid(),
    title: "New Chat",
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function generateTitle(firstMessage: string): string {
  const words = firstMessage.trim().split(/\s+/).slice(0, 6);
  return words.join(" ") + (firstMessage.split(/\s+/).length > 6 ? "..." : "");
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isPro, setIsPro] = useState(false); // Pro user state

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef<string | null>(null);
  const conversationsRef = useRef<Conversation[]>([]);

  // Keep refs in sync
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  const { sendMessage, isLoading, error } = useGroq();
  const {
    voiceState,
    transcript,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoice();

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    if (activeConversation?.messages.length) {
      scrollToBottom();
    }
  }, [activeConversation?.messages.length, scrollToBottom]);

  // Track scroll for scroll-to-bottom button
  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  };

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(`API Error: ${error}`);
    }
  }, [error]);

  const createNewChat = useCallback(() => {
    const conv = createConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        setActiveId(null);
      }
    },
    [activeId]
  );

  const handleSend = useCallback(
    async (text: string) => {
      let convId = activeIdRef.current;

      // Create new conversation if none active
      if (!convId) {
        const conv = createConversation();
        conv.title = generateTitle(text);
        setConversations((prev) => [conv, ...prev]);
        setActiveId(conv.id);
        convId = conv.id;
        // Wait for state to settle
        await new Promise((r) => setTimeout(r, 0));
      }

      const targetConvId = convId;

      const userMessage: Message = {
        id: nanoid(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      const assistantId = nanoid();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      // Get current messages for context before state update
      const currentMessages =
        conversationsRef.current.find((c) => c.id === targetConvId)?.messages ?? [];

      // Add both messages
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== targetConvId) return c;
          return {
            ...c,
            messages: [...c.messages, userMessage, assistantMessage],
            updatedAt: new Date(),
            title: c.messages.length === 0 ? generateTitle(text) : c.title,
          };
        })
      );

      const allMessages = [...currentMessages, userMessage];
      let fullResponse = "";

      await sendMessage(
        allMessages,
        (chunk) => {
          fullResponse += chunk;
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== targetConvId) return c;
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: fullResponse }
                    : m
                ),
              };
            })
          );
        },
        () => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== targetConvId) return c;
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId ? { ...m, isStreaming: false } : m
                ),
              };
            })
          );

          // Auto-speak if voice mode is on
          if (autoSpeak && fullResponse) {
            setSpeakingMessageId(assistantId);
            speak(fullResponse, () => setSpeakingMessageId(null));
          }
        }
      );
    },
    [sendMessage, speak, autoSpeak]
  );

  const handleVoiceResult = useCallback(
    (text: string) => {
      setAutoSpeak(true);
      handleSend(text);
    },
    [handleSend]
  );

  const handleStartVoice = useCallback(() => {
    startListening(handleVoiceResult);
  }, [startListening, handleVoiceResult]);

  const handleSpeak = useCallback(
    (text: string, messageId: string) => {
      setSpeakingMessageId(messageId);
      speak(text, () => setSpeakingMessageId(null));
    },
    [speak]
  );

  const handleStopSpeak = useCallback(() => {
    stopSpeaking();
    setSpeakingMessageId(null);
  }, [stopSpeaking]);

  const messages = activeConversation?.messages ?? [];

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: "#0a0a0a" }}
    >
      {/* Global background mesh */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${BG_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.07,
        }}
      />

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={createNewChat}
        onDelete={deleteConversation}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isPro={isPro}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
          style={{
            background: "rgba(10,8,8,0.75)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            minHeight: 48,
          }}
        >
          <div className="flex items-center gap-2.5">
            <BotMessageSquare
              size={15}
              style={{ color: "rgba(220,20,60,0.65)" }}
            />
            <span
              className="text-sm font-semibold truncate"
              style={{ color: "#f0f0f0", letterSpacing: "-0.02em", maxWidth: 300 }}
            >
              {activeConversation?.title ?? "ENOSX XAI Assistant"}
            </span>
            {activeConversation && (
              <span
                className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: "rgba(220,20,60,0.08)",
                  border: "1px solid rgba(220,20,60,0.18)",
                  color: "rgba(220,20,60,0.6)",
                  fontSize: "10px",
                  letterSpacing: "0.04em",
                }}
              >
                {activeConversation.messages.filter((m) => m.role === "user").length} msgs
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Voice mode toggle */}
            {isVoiceSupported && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setAutoSpeak((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all duration-200"
                style={
                  autoSpeak
                    ? {
                        background: "rgba(220,20,60,0.15)",
                        border: "1px solid rgba(220,20,60,0.3)",
                        color: "#dc143c",
                        boxShadow: "0 0 10px rgba(220,20,60,0.2)",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "rgba(255,255,255,0.35)",
                      }
                }
              >
                <Mic size={10} />
                <span style={{ letterSpacing: "0.04em", fontSize: "10px" }}>
                  {autoSpeak ? "VOICE ON" : "VOICE"}
                </span>
              </motion.button>
            )}

            {/* Voice state indicator */}
            <AnimatePresence>
              {voiceState !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{
                    background: "rgba(220,20,60,0.1)",
                    border: "1px solid rgba(220,20,60,0.25)",
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "#dc143c",
                      boxShadow: "0 0 6px rgba(220,20,60,0.8)",
                      animation: "pulse 0.8s ease-in-out infinite",
                    }}
                  />
                  <span
                    style={{
                      color: "rgba(220,20,60,0.8)",
                      fontSize: "10px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {voiceState === "listening"
                      ? "LISTENING"
                      : voiceState === "speaking"
                      ? "SPEAKING"
                      : "PROCESSING"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status indicator */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isLoading ? "#f59e0b" : "#22c55e",
                  boxShadow: `0 0 6px ${isLoading ? "rgba(245,158,11,0.6)" : "rgba(34,197,94,0.5)"}`,
                  animation: isLoading ? "pulse 1s ease-in-out infinite" : "none",
                }}
              />
              <span
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: "10px",
                  letterSpacing: "0.06em",
                }}
              >
                {isLoading ? "THINKING" : "READY"}
              </span>
            </div>

            <div
              className="flex items-center gap-1"
              style={{ color: "rgba(255,255,255,0.18)" }}
            >
              <Wifi size={11} style={{ color: "rgba(220,20,60,0.4)" }} />
              <span style={{ fontSize: "10px", letterSpacing: "0.06em" }}>GROQ</span>
            </div>

            <motion.a
              href="/about"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200"
              style={{
                background: "rgba(0, 242, 255, 0.08)",
                border: "1px solid rgba(0, 242, 255, 0.2)",
                color: "rgba(0, 242, 255, 0.6)",
              }}
            >
              <Info size={12} />
              <span style={{ letterSpacing: "0.04em", fontSize: "10px" }}>ABOUT</span>
            </motion.a>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 relative overflow-hidden">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestion={handleSend} />
          ) : (
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="h-full overflow-y-auto px-5 py-5"
            >
              <div className="max-w-3xl mx-auto flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      index={i}
                      onSpeak={(text) => handleSpeak(text, msg.id)}
                      onStopSpeak={handleStopSpeak}
                      isSpeaking={speakingMessageId === msg.id}
                    />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Scroll to bottom button */}
          <AnimatePresence>
            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => scrollToBottom()}
                className="absolute bottom-4 right-6 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(220,20,60,0.18)",
                  border: "1px solid rgba(220,20,60,0.3)",
                  color: "#dc143c",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <ChevronDown size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Command bar */}
        <CommandBar
          onSend={handleSend}
          isLoading={isLoading}
          voiceState={voiceState}
          transcript={transcript}
          isVoiceSupported={isVoiceSupported}
          onStartVoice={handleStartVoice}
          onStopVoice={stopListening}
          onStopSpeaking={handleStopSpeak}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
