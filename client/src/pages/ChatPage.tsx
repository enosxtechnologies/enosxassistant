/*
 * ENOSX XAI Assistant — ChatPage (Enhanced)
 * Design: "Crimson Matrix" — Cyberpunk Glassmorphism
 * Layout: Left floating acrylic sidebar + right bento chat area + floating pill command bar
 *
 * Enhancements:
 * 1. Smooth animations (Framer Motion spring physics everywhere)
 * 2. Glassmorphism / Acrylic Blur (backdrop-filter on all panels)
 * 3. Floating assistant UI (draggable, snap-to-edge capable)
 * 4. Voice visualization (real-time FFT audio bars)
 * 5. Typing + AI "Thinking" feedback (animated dots, streaming cursor)
 * 6. Dark Mode + Theme Engine (5 themes: Dark, Light, Neon, Cyberpunk, Minimal)
 * 7. Animated orb avatar (reacts to voice/loading state)
 * 8. Sound design (subtle Web Audio API tones)
 * 9. Transparency + always-visible top bar
 * 10. Performance optimized (300ms max animations, memoized callbacks)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import MessageBubble from "@/components/MessageBubble";
import CommandBar from "@/components/CommandBar";
import WelcomeScreen from "@/components/WelcomeScreen";
import FloatingOrb from "@/components/FloatingOrb";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import CommandChainProgress from "@/components/CommandChainProgress";
import ContextIndicator from "@/components/ContextIndicator";
import AppAwareSuggestions from "@/components/AppAwareSuggestions";
import FileDropZone from "@/components/FileDropZone";
import FileContextBadge from "@/components/FileContextBadge";
import ClipboardBadge from "@/components/ClipboardBadge";
import ContextualActionBar from "@/components/ContextualActionBar";
import GodModeTerminal from "@/components/GodModeTerminal";
import CircuitDoor from "@/components/CircuitDoor";
import { useGroq } from "@/hooks/useGroq";
import { useVoice } from "@/hooks/useVoice";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useSystemActions } from "@/hooks/useSystemActions";
import { useCommandChain } from "@/hooks/useCommandChain";
import { useContextAwareMessages } from "@/hooks/useContextAwareMessages";
import { useActiveWindow } from "@/contexts/WindowContext";
import { useFileContext } from "@/hooks/useFileContext";
import { useClipboardListener } from "@/hooks/useClipboardListener";
import { useGodMode } from "@/hooks/useGodMode";
import { Conversation, Message } from "@/lib/types";
import { useTheme } from "@/contexts/ThemeContext";
import { Wifi, ChevronDown, Mic, Info, Volume2, VolumeX } from "lucide-react";

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
  const { config } = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPro] = useState(false);

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

  const { play: playSound, setEnabled: setSoundFn } = useSoundEffects();
  const { executeAction } = useSystemActions();
  const { progress } = useCommandChain();
  const { enrichMessageWithContext } = useContextAwareMessages();
  const { activeWindow } = useActiveWindow();
  const { fileContext, loadFile, clearFile, getFileContextMessage } = useFileContext();
  const {
    copiedText,
    isVisible: clipboardVisible,
    dismiss: dismissClipboard,
    consume: consumeClipboard,
  } = useClipboardListener();

  // GOD MODE state
  const [isGodModeActive, setIsGodModeActive] = useState(false);
  const [showGodTerminal, setShowGodTerminal] = useState(false);

  const triggerGodMode = useCallback(() => {
    if (isGodModeActive) return;
    setIsGodModeActive(true);
    playSound("godMode"); // High-tech system override sound
    
    // Voice greeting for Enosh
    setTimeout(() => {
      speak("Greetings, Enosh. How may I assist you today?");
    }, 1500);
  }, [isGodModeActive, playSound, speak]);

  useGodMode(triggerGodMode);

  const handleGodModeAnimationComplete = useCallback(() => {
    if (isGodModeActive) {
      setShowGodTerminal(true);
    }
  }, [isGodModeActive]);

  const executeGodCommand = useCallback(async (command: string) => {
    // Forward command to AI for processing
    const prompt = `[GOD MODE COMMAND] ${command}`;
    await handleSend(prompt);
    return "Command executed via ENOSX Core.";
  }, [handleSend]);

  // Sync sound enabled state
  useEffect(() => {
    setSoundFn(soundEnabled);
  }, [soundEnabled, setSoundFn]);

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
      playSound("error");
    }
  }, [error, playSound]);

  const createNewChat = useCallback(() => {
    const conv = createConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    playSound("click");
  }, [playSound]);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        setActiveId(null);
      }
      playSound("click");
    },
    [activeId, playSound]
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
        await new Promise((r) => setTimeout(r, 0));
      }

      const targetConvId = convId;

      // Append file context if available
      let messageContent = text;
      if (fileContext.isLoaded) {
        messageContent += getFileContextMessage();
      }

      const userMessage: Message = {
        id: nanoid(),
        role: "user",
        content: messageContent,
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

      const currentMessages =
        conversationsRef.current.find((c) => c.id === targetConvId)?.messages ?? [];

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

      playSound("send");

      // Clear file context after sending
      if (fileContext.isLoaded) {
        clearFile();
      }

      const allMessages = [...currentMessages, userMessage];
      const contextEnrichedMessages = enrichMessageWithContext(allMessages, activeWindow);
      let fullResponse = "";

      await sendMessage(
        contextEnrichedMessages,
        (chunk) => {
          fullResponse += chunk;
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== targetConvId) return c;
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId ? { ...m, content: fullResponse } : m
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
          playSound("receive");
          
          // Execute any system actions found in the response
          executeAction(fullResponse);

          if (autoSpeak && fullResponse) {
            setSpeakingMessageId(assistantId);
            speak(fullResponse, () => setSpeakingMessageId(null));
          }
        }
      );
    },
    [sendMessage, speak, autoSpeak, playSound]
  );

  const handleVoiceResult = useCallback(
    (text: string) => {
      setAutoSpeak(true);
      handleSend(text);
    },
    [handleSend]
  );

  const handleStartVoice = useCallback(() => {
    playSound("listenStart");
    startListening(handleVoiceResult);
  }, [startListening, handleVoiceResult, playSound]);

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
    playSound("listenStop");
  }, [stopSpeaking, playSound]);

  // Summarize clipboard content via AI — defined after handleSend
  const handleClipboardSummarize = useCallback(
    async (text: string) => {
      const prompt = `Please summarize the following text concisely:\n\n${text}`;
      await handleSend(prompt);
    },
    [handleSend]
  );

  const messages = activeConversation?.messages ?? [];

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: config.bg, transition: "background 0.4s ease" }}
    >
      {/* Global background mesh */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${BG_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
        }}
      />

      {/* Ambient glow orbs */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "-20%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${config.accentRgb},0.06) 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: "-20%",
          left: "10%",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${config.accentRgb},0.04) 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* File Drop Zone */}
      <FileDropZone onFileSelected={loadFile} isActive={true} />

      {/* Command Chain Progress Indicator */}
      <CommandChainProgress progress={progress} />

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
      <motion.div
        className="flex-1 flex flex-col min-w-0 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Top bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
          style={{
            background: `rgba(${config.accentRgb === "220,20,60" ? "10,8,8" : "0,0,0"},0.75)`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: `1px solid rgba(${config.accentRgb},0.08)`,
            minHeight: 48,
          }}
        >
          {/* Left: orb + title */}
          <div className="flex items-center gap-2.5">
            <FloatingOrb
              voiceState={voiceState}
              isLoading={isLoading}
              size={28}
            />
            <span
              className="text-sm font-semibold truncate"
              style={{
                color: config.text,
                letterSpacing: "-0.02em",
                maxWidth: 300,
                transition: "color 0.3s ease",
              }}
            >
              {activeConversation?.title ?? "ENOSX XAI Assistant"}
            </span>
            {activeConversation && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: `rgba(${config.accentRgb},0.08)`,
                  border: `1px solid rgba(${config.accentRgb},0.18)`,
                  color: `rgba(${config.accentRgb},0.7)`,
                  fontSize: "10px",
                  letterSpacing: "0.04em",
                }}
              >
                {activeConversation.messages.filter((m) => m.role === "user").length} msgs
              </motion.span>
            )}
          </div>

          {/* Center: Context Indicator */}
          <ContextIndicator />

          {/* Right: controls */}
          <div className="flex items-center gap-2">
            {/* Theme switcher */}
            <ThemeSwitcher />

            {/* Sound toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSoundEnabled((v) => !v)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                background: soundEnabled
                  ? `rgba(${config.accentRgb},0.1)`
                  : "rgba(255,255,255,0.04)",
                border: soundEnabled
                  ? `1px solid rgba(${config.accentRgb},0.25)`
                  : "1px solid rgba(255,255,255,0.07)",
                color: soundEnabled ? config.accent : config.textMuted,
              }}
              title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {soundEnabled ? <Volume2 size={11} /> : <VolumeX size={11} />}
            </motion.button>

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
                        background: `rgba(${config.accentRgb},0.15)`,
                        border: `1px solid rgba(${config.accentRgb},0.3)`,
                        color: config.accent,
                        boxShadow: `0 0 10px rgba(${config.accentRgb},0.2)`,
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: config.textMuted,
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
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{
                    background: `rgba(${config.accentRgb},0.1)`,
                    border: `1px solid rgba(${config.accentRgb},0.25)`,
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: config.accent,
                      boxShadow: `0 0 6px ${config.accent}`,
                    }}
                  />
                  <span
                    style={{
                      color: config.accent,
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
              <motion.div
                animate={{
                  scale: isLoading ? [1, 1.3, 1] : 1,
                  opacity: isLoading ? [1, 0.6, 1] : 1,
                }}
                transition={
                  isLoading
                    ? { duration: 1, repeat: Infinity }
                    : { duration: 0.3 }
                }
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isLoading ? "#f59e0b" : "#22c55e",
                  boxShadow: `0 0 6px ${isLoading ? "rgba(245,158,11,0.6)" : "rgba(34,197,94,0.5)"}`,
                }}
              />
              <span
                style={{
                  color: config.textMuted,
                  fontSize: "10px",
                  letterSpacing: "0.06em",
                }}
              >
                {isLoading ? "THINKING" : "READY"}
              </span>
            </div>

            <div
              className="flex items-center gap-1"
              style={{ color: config.textMuted }}
            >
              <Wifi size={11} style={{ color: `rgba(${config.accentRgb},0.5)` }} />
              <span style={{ fontSize: "10px", letterSpacing: "0.06em" }}>GROQ</span>
            </div>

            <motion.a
              href="/about"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200"
              style={{
                background: "rgba(0, 242, 255, 0.07)",
                border: "1px solid rgba(0, 242, 255, 0.18)",
                color: "rgba(0, 242, 255, 0.6)",
              }}
            >
              <Info size={12} />
              <span style={{ letterSpacing: "0.04em", fontSize: "10px" }}>ABOUT</span>
            </motion.a>
          </div>
        </motion.div>

        {/* Messages area */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <div className="h-full flex flex-col">
                  <div className="px-5 pt-5">
                    <AppAwareSuggestions onSuggestionClick={handleSend} />
                  </div>
                  <div className="flex-1">
                    <WelcomeScreen onSuggestion={handleSend} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto px-5 py-5"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: `rgba(${config.accentRgb},0.2) transparent`,
                }}
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll to bottom button */}
          <AnimatePresence>
            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scrollToBottom()}
                className="absolute bottom-4 right-6 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: `rgba(${config.accentRgb},0.18)`,
                  border: `1px solid rgba(${config.accentRgb},0.3)`,
                  color: config.accent,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <ChevronDown size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* File Context Badge */}
        {fileContext.isLoaded && (
          <div className="px-5 pb-2">
            <FileContextBadge fileContext={fileContext} onClear={clearFile} />
          </div>
        )}

        {/* Contextual Action Bar — context-aware quick-action buttons */}
        <div className="px-5 pt-2">
          <ContextualActionBar onAction={handleSend} />
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
      </motion.div>

      {/* Clipboard Badge — glowing Enosx icon when text is copied */}
      <ClipboardBadge
        copiedText={copiedText}
        isVisible={clipboardVisible}
        onDismiss={dismissClipboard}
        onConsume={consumeClipboard}
        onSummarize={handleClipboardSummarize}
      />

      {/* GOD MODE — Transition Doors */}
      <CircuitDoor 
        isActive={isGodModeActive} 
        onAnimationComplete={handleGodModeAnimationComplete} 
      />

      {/* GOD MODE — Developer Terminal */}
      <GodModeTerminal
        isOpen={showGodTerminal}
        onClose={() => {
          setShowGodTerminal(false);
          setIsGodModeActive(false);
        }}
        onExecute={executeGodCommand}
      />
    </div>
  );
}
