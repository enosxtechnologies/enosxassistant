/*
 * ENOSX XAI Assistant — ChatPage (Enhanced)
 * Design: "Crimson Matrix" — Cyberpunk Glassmorphism
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
import PulseOrb from "@/components/PulseOrb";
import AdaptiveActionButtons from "@/components/AdaptiveActionButtons";
import ClipboardNotification from "@/components/ClipboardNotification";
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
import GlitchShader from "@/components/GlitchShader";
import NeuralMesh from "@/components/NeuralMesh";
import { useGroq } from "@/hooks/useGroq";
import { useVoice } from "@/hooks/useVoice";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useSystemActions } from "@/hooks/useSystemActions";
import { useWebSearch } from "@/hooks/useWebSearch";
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
import { useCompactMode } from "@/hooks/useCompactMode";
import { ChevronDown, Info, Volume2, VolumeX, Minimize2, Maximize2, Wifi } from "lucide-react";
import { createAdaptiveActionHandler, createClipboardSummarizeHandler } from "./ChatPage_handlers";

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef<string | null>(null);
  const conversationsRef = useRef<Conversation[]>([]);

  // Keep refs in sync
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  const { sendMessage, isLoading, error } = useGroq();
  const { performSearch } = useWebSearch();
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
  const { enrichMessageWithContext, getContextInfo } = useContextAwareMessages();
  const { activeWindow } = useActiveWindow();
  const { fileContext, loadFile, clearFile, getFileContextMessage } = useFileContext();
  const {
    copiedText,
    isVisible: clipboardVisible,
    dismiss: dismissClipboard,
    consume: consumeClipboard,
  } = useClipboardListener();

  const { memories, addMemory, removeMemory, getMemoryContext } = useMemoryBank();
  const { autoContext, getAutoContextMessage } = useAutoContext();

  const [isGodModeActive, setIsGodModeActive] = useState(false);
  const [showGodTerminal, setShowGodTerminal] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  const { isCompactMode, toggleCompactMode } = useCompactMode();

  // handleSend defined early to avoid circular dependencies
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
      const contextInfo = getContextInfo(activeWindow);
      
      const enrichedUserMessage = {
        ...userMessage,
        content: userMessage.content + memoryContext + autoAppContext + contextInfo
      };

      const contextEnrichedMessages = enrichMessageWithContext([...currentMessages, enrichedUserMessage], activeWindow);
      let fullResponse = "";

      try {
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
            executeAction(fullResponse).then((actions) => {
              const searchAction = actions.find(a => a.type === 'search');
              if (searchAction && searchAction.query) {
                performSearch(searchAction.query).then((results) => {
                  const resultsText = results
                    .map((r, i) => `${i + 1}. **${r.title}**
   ${r.snippet}
   [Link](${r.url})`)
                    .join("

");
                  
                  const searchResultsMessage = `[SEARCH RESULTS for "${searchAction.query}"]:

${resultsText}

Based on these search results, please provide a comprehensive and detailed answer to the user's question.`;
                  
                  setTimeout(() => {
                    handleSend(searchResultsMessage);
                  }, 1000);
                });
              }
            });

            if (autoSpeak && fullResponse) {
              setSpeakingMessageId(assistantId);
              speak(fullResponse, () => setSpeakingMessageId(null));
            }
          }
        );
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch response";
        toast.error(errorMsg);
        
        // Remove the empty assistant message on error
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetConvId) return c;
            return {
              ...c,
              messages: c.messages.filter((m) => m.id !== assistantId),
            };
          })
        );
      }
    },
    [sendMessage, speak, autoSpeak, playSound, fileContext, getFileContextMessage, clearFile, getMemoryContext, getAutoContextMessage, enrichMessageWithContext, getContextInfo, activeWindow, executeAction]
  );

  const triggerGodMode = useCallback(() => {
    if (isGodModeActive) return;
    setIsGodModeActive(true);
    playSound("godMode");
    
    // Auto-transition to terminal after animation completes (3s total duration)
    setTimeout(() => {
      setIsGodModeActive(false);
      setShowGodTerminal(true);
      setShowGlitch(true);
      speak("Greetings, Enosh. How may I assist you today?");
    }, 3000);
  }, [isGodModeActive, playSound, speak]);

  useGodMode(triggerGodMode);

  const handleGodModeAnimationComplete = useCallback(() => {
    if (isGodModeActive) {
      setShowGodTerminal(true);
      setShowGlitch(true);
    }
  }, [isGodModeActive]);

  const handleScreenshot = useCallback(
    (imageData: string) => {
      const prompt = `[SCREENSHOT ANALYSIS]\n\nPlease analyze this screenshot and provide insights:\n\n<image>${imageData}</image>`;
      handleSend(prompt);
    },
    [handleSend]
  );

  const executeGodCommand = useCallback(async (command: string) => {
    const prompt = `[GOD MODE COMMAND] ${command}`;
    await handleSend(prompt);
    return "Command executed via ENOSX Core.";
  }, [handleSend]);

  useEffect(() => {
    setSoundFn(soundEnabled);
  }, [soundEnabled, setSoundFn]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

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

  const handleAdaptiveAction = useCallback(
    (action: string) => createAdaptiveActionHandler(handleSend)(action),
    [handleSend]
  );

  const handleClipboardSummarize = useCallback(
    async (text: string) => createClipboardSummarizeHandler(handleSend)(text),
    [handleSend]
  );

  const messages = activeConversation?.messages ?? [];

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${isCompactMode ? "rounded-3xl border-2 shadow-2xl" : ""}`}
      style={{ 
        background: config.bg, 
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        borderColor: isCompactMode ? `rgba(${config.accentRgb}, 0.3)` : "transparent"
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${BG_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
        }}
      />

      <FileDropZone onFileSelected={loadFile} isActive={true} />
      <CommandChainProgress progress={progress} />
      <ClipboardNotification
        clipboardData={copiedText}
        onSummarize={handleClipboardSummarize}
        onDismiss={dismissClipboard}
      />

      {!isCompactMode && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={createNewChat}
          onDelete={deleteConversation}
        />
      )}

      <main className="flex-1 flex flex-col relative">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-16 flex items-center justify-between px-6 z-10"
          style={{
            background: "rgba(10, 10, 10, 0.4)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <PulseOrb
              voiceState={voiceState}
              isLoading={isLoading}
              size={32}
            />
            <span
              className="text-sm font-semibold truncate"
              style={{
                color: config.text,
                letterSpacing: "-0.02em",
                maxWidth: isCompactMode ? 150 : 300,
                transition: "color 0.3s ease",
              }}
            >
              {activeConversation?.title ?? "ENOSX XAI Assistant"}
            </span>
            {!isCompactMode && activeConversation && (
              <div className="flex items-center gap-1 ml-2">
                <ContextIndicator />
                <AutoContextIndicator data={autoContext} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isCompactMode && (
              <div className="flex items-center gap-3 pr-4 border-r border-white/5">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-lg transition-all hover:bg-white/5"
                  style={{ color: soundEnabled ? `rgba(${config.accentRgb},0.8)` : config.textMuted }}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <ThemeSwitcher />
              </div>
            )}

            <button
              onClick={toggleCompactMode}
              className="p-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: config.textMuted }}
              title={isCompactMode ? "Standard Mode" : "Compact Mode"}
            >
              {isCompactMode ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>

            {!isCompactMode && (
              <>
                <div className="hidden md:flex flex-col items-end gap-0.5">
                  <span
                    className="font-black"
                    style={{
                      color: isLoading ? `rgba(${config.accentRgb},1)` : config.text,
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
              </>
            )}
          </div>
        </motion.div>

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
                    {!isCompactMode && (
                      <>
                        <AppAwareSuggestions onSuggestionClick={handleSend} />
                        <AdaptiveActionButtons onActionClick={handleAdaptiveAction} />
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <WelcomeScreen onSuggestion={handleSend} isCompact={isCompactMode} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col"
              >
                <div
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className={`flex-1 overflow-y-auto px-4 ${isCompactMode ? "" : "md:px-8"} py-6 scrollbar-thin`}
                >
                  <div className={`max-w-3xl mx-auto space-y-6 ${isCompactMode ? "px-2" : ""}`}>
                    {messages.map((m, idx) => (
                      <MessageBubble
                        key={m.id}
                        message={m}
                        index={idx}
                        onSpeak={() => handleSpeak(m.content, m.id)}
                        onStopSpeak={handleStopSpeak}
                        isSpeaking={speakingMessageId === m.id}
                      />
                    ))}
                    <div ref={messagesEndRef} className="h-4" />
                  </div>
                </div>

                <AnimatePresence>
                  {showScrollBtn && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={() => scrollToBottom()}
                      className="absolute bottom-4 right-8 p-2 rounded-full shadow-lg z-20 border"
                      style={{
                        background: "rgba(20, 20, 20, 0.8)",
                        backdropFilter: "blur(10px)",
                        borderColor: `rgba(${config.accentRgb}, 0.2)`,
                        color: config.text,
                      }}
                    >
                      <ChevronDown size={20} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`p-4 ${isCompactMode ? "pb-6" : "md:p-6"} z-20`}>
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute bottom-full left-0 right-0 mb-4 flex flex-col gap-2 pointer-events-none">
              <div className="pointer-events-auto">
                <FileContextBadge 
                  fileContext={fileContext} 
                  onClear={clearFile} 
                />
                {!isCompactMode && (
                  <>
                    <ClipboardBadge 
                      copiedText={copiedText}
                      isVisible={clipboardVisible}
                      onSummarize={handleClipboardSummarize}
                      onDismiss={dismissClipboard}
                      onConsume={consumeClipboard}
                    />
                    <ContextualActionBar 
                      onAction={handleAdaptiveAction}
                    />
                  </>
                )}
              </div>
            </div>
            
            <CommandBar
              onSend={handleSend}
              isLoading={isLoading}
              isVoiceSupported={isVoiceSupported}
              onStartVoice={handleStartVoice}
              onStopVoice={stopListening}
              onStopSpeaking={handleStopSpeak}
              onScreenshot={handleScreenshot}
              voiceState={voiceState}
              transcript={transcript}
            />
          </div>
        </div>

        <GlitchShader isActive={showGlitch} intensity={0.8} />
        <NeuralMesh isActive={isGodModeActive} complexity={0.7} color="rgba(0, 242, 255, 0.15)" />

        <AnimatePresence>
          {isGodModeActive && (
            <CircuitDoor 
              isActive={isGodModeActive} 
              onAnimationComplete={handleGodModeAnimationComplete}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showGodTerminal && (
            <GodModeTerminal 
              isOpen={showGodTerminal}
              onClose={() => {
                setShowGodTerminal(false);
                setIsGodModeActive(false);
                setShowGlitch(false);
              }}
              onExecute={executeGodCommand}
              memories={memories}
              onAddMemory={addMemory}
              onRemoveMemory={removeMemory}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
