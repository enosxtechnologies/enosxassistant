/*
 * Assistant — ChatPage
 * Design: Cyberpunk Glassmorphism
 * Layout: Left floating acrylic sidebar + right bento chat area + floating pill command bar
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
import AutoContextIndicator from "@/components/AutoContextIndicator";
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
import { useMemoryBank } from "@/hooks/useMemoryBank";
import { useAutoContext } from "@/hooks/useAutoContext";
import { Conversation, Message } from "@/lib/types";
import { useTheme } from "@/contexts/ThemeContext";
import { Wifi, ChevronDown, Mic, Info, Volume2, VolumeX } from "lucide-react";

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
  const { activeWindow, isSwitching } = useActiveWindow();
  const { fileContext, clearFile, getFileContextMessage } = useFileContext();
  const {
    copiedText,
    isVisible: clipboardVisible,
    dismiss: dismissClipboard,
    consume: consumeClipboard,
  } = useClipboardListener();

  // Memory & Auto-Context Hooks
  const { memories, addMemory, removeMemory, getMemoryContext } = useMemoryBank();
  const { autoContext, getAutoContextMessage } = useAutoContext();

  // GOD MODE state
  const [isGodModeActive, setIsGodModeActive] = useState(false);
  const [showGodTerminal, setShowGodTerminal] = useState(false);

  const triggerGodMode = useCallback(() => {
    if (isGodModeActive) return;
    setIsGodModeActive(true);
    playSound("godMode");
    
    setTimeout(() => {
      speak("System override initialized. How may I assist you?");
    }, 1500);
  }, [isGodModeActive, playSound, speak]);

  useGodMode(triggerGodMode);

  const handleGodModeAnimationComplete = useCallback(() => {
    if (isGodModeActive) {
      setShowGodTerminal(true);
    }
  }, [isGodModeActive]);

  const executeGodCommand = useCallback(async (command: string) => {
    const prompt = `[GOD MODE COMMAND] ${command}`;
    await handleSend(prompt);
    return "Command executed via System Core.";
  }, []);

  // Sync sound enabled state
  useEffect(() => {
    setSoundFn(soundEnabled);
  }, [soundEnabled, setSoundFn]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const messages = activeConversation?.messages ?? [];

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    if (messages.length) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  };

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

      if (!convId) {
        const conv = createConversation();
        conv.title = generateTitle(text);
        setConversations((prev) => [conv, ...prev]);
        setActiveId(conv.id);
        convId = conv.id;
        await new Promise((r) => setTimeout(r, 0));
      }

      const targetConvId = convId;
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

      if (fileContext.isLoaded) {
        clearFile();
      }

      const memoryContext = getMemoryContext();
      const autoAppContext = getAutoContextMessage();
      
      const enrichedUserMessage = {
        ...userMessage,
        content: userMessage.content + memoryContext + autoAppContext
      };

      const contextEnrichedMessages = enrichMessageWithContext([...currentMessages, enrichedUserMessage], activeWindow);
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
        async (completeText) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== targetConvId) return c;
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId ? { ...m, content: completeText, isStreaming: false } : m
                ),
              };
            })
          );
          playSound("receive");
          
          if (autoSpeak) {
            handleSpeak(completeText, assistantId);
          }
          
          await executeAction(completeText);
        }
      );
    },
    [activeWindow, autoSpeak, clearFile, enrichMessageWithContext, executeAction, fileContext.isLoaded, getAutoContextMessage, getFileContextMessage, getMemoryContext, playSound, sendMessage]
  );

  const handleSpeak = useCallback(
    (text: string, messageId: string) => {
      setSpeakingMessageId(messageId);
      speak(text, () => {
        setSpeakingMessageId(null);
      });
    },
    [speak]
  );

  const handleStopSpeak = useCallback(() => {
    stopSpeaking();
    setSpeakingMessageId(null);
  }, [stopSpeaking]);

  const handleStartVoice = useCallback(() => {
    handleStopSpeak();
    playSound("listenStart");
    startListening((text) => {
      handleSend(text);
    });
  }, [handleSend, handleStopSpeak, playSound, startListening]);

  const handleClipboardSummarize = useCallback(() => {
    if (copiedText) {
      handleSend(`Summarize this copied text: ${copiedText}`);
      consumeClipboard();
    }
  }, [copiedText, consumeClipboard, handleSend]);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden relative"
      style={{ backgroundColor: config.bg }}
    >
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={createNewChat}
        onDelete={deleteConversation}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <motion.div
        animate={{ 
          scale: (isSwitching || activeWindow.isMinimized) ? 0.85 : 1,
          opacity: (isSwitching || activeWindow.isMinimized) ? 0.7 : 1,
          borderRadius: (isSwitching || activeWindow.isMinimized) ? "24px" : "0px",
          y: (isSwitching || activeWindow.isMinimized) ? 20 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col relative min-w-0 glass-panel overflow-hidden"
        style={{
          borderLeft: `1px solid rgba(${config.accentRgb}, 0.1)`,
          boxShadow: (isSwitching || activeWindow.isMinimized) ? `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(${config.accentRgb}, 0.2)` : "none"
        }}
      >
        {/* Switching/Minimized Overlay Label */}
        <AnimatePresence>
          {(isSwitching || activeWindow.isMinimized) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-white/80 uppercase">
                {isSwitching ? `Switching to ${activeWindow.appName}...` : `Focus: ${activeWindow.appName}`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top bar */}
        <motion.div
          className="h-14 flex items-center justify-between px-6 flex-shrink-0 z-10"
          style={{ borderBottom: `1px solid rgba(${config.accentRgb}, 0.08)` }}
        >
          <div className="flex items-center gap-4">
            <FloatingOrb voiceState={voiceState} isLoading={isLoading} />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight" style={{ color: config.text }}>
                {activeConversation?.title || "New Conversation"}
              </span>
              <ContextIndicator activeWindow={activeWindow} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: soundEnabled ? config.accent : config.textMuted,
              }}
              title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {soundEnabled ? <Volume2 size={11} /> : <VolumeX size={11} />}
            </motion.button>

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

            <AnimatePresence>
              {voiceState !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 10 }}
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
                    style={{ background: config.accent }}
                  />
                  <span style={{ color: config.accent, fontSize: "10px", letterSpacing: "0.06em" }}>
                    {voiceState.toUpperCase()}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <AutoContextIndicator data={autoContext} />

            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: isLoading ? "#f59e0b" : "#22c55e" }}
              />
              <span style={{ color: config.textMuted, fontSize: "10px", letterSpacing: "0.06em" }}>
                {isLoading ? "THINKING" : "READY"}
              </span>
            </div>

            <div className="flex items-center gap-1" style={{ color: config.textMuted }}>
              <Wifi size={11} />
              <span style={{ fontSize: "10px", letterSpacing: "0.06em" }}>GROQ</span>
            </div>
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
                className="h-full flex flex-col"
              >
                <div className="px-5 pt-5">
                  <AppAwareSuggestions onSuggestionClick={handleSend} />
                </div>
                <div className="flex-1">
                  <WelcomeScreen onSuggestion={handleSend} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto px-5 py-5 scrollbar-thin"
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

          <AnimatePresence>
            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => scrollToBottom()}
                className="absolute bottom-4 right-6 w-8 h-8 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10"
                style={{ color: config.accent }}
              >
                <ChevronDown size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <CommandChainProgress progress={progress} />

        <div className="px-5 pt-2">
          <ContextualActionBar onAction={handleSend} />
        </div>

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

      <ClipboardBadge
        copiedText={copiedText}
        isVisible={clipboardVisible}
        onDismiss={dismissClipboard}
        onConsume={consumeClipboard}
        onSummarize={handleClipboardSummarize}
      />

      <CircuitDoor 
        isActive={isGodModeActive} 
        onAnimationComplete={handleGodModeAnimationComplete} 
      />

      <GodModeTerminal
        isOpen={showGodTerminal}
        onClose={() => {
          setShowGodTerminal(false);
          setIsGodModeActive(false);
        }}
        onExecute={executeGodCommand}
        memories={memories}
        onAddMemory={addMemory}
        onRemoveMemory={removeMemory}
      />
    </div>
  );
}
