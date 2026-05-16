/*
 * ENOSX XAI — GodModeTerminal With Chat Tab
 * Full-screen developer terminal with working Chat Tab and AI integration
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldAlert,
  Cpu,
  Database,
  Users,
  Zap,
  Brain,
  Terminal,
  Settings,
  Activity,
  Lock,
  Globe,
  Terminal as TerminalIcon,
  PlusCircle,
  Mic,
  MicOff,
  Send,
  MessageSquare,
  TrendingUp,
  Heart,
  Target,
  Lightbulb,
} from "lucide-react";
import { MemoryEntry } from "@/hooks/useMemoryBank";
import { useEnoshLearning } from "@/contexts/EnoshLearningContext";
import { useAI } from "@/hooks/useAI";
import MemoryBank from "./MemoryBank";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "system" | "error" | "predictive";
  content: string;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface GodModeTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (command: string) => Promise<string>;
  memories: MemoryEntry[];
  onAddMemory: (category: MemoryEntry["category"], content: string, metadata?: any) => void;
  onRemoveMemory: (id: string) => void;
  voiceState?: string;
  transcript?: string;
  onStartVoice?: () => void;
  onStopVoice?: () => void;
  onStopSpeaking?: () => void;
  isLoading?: boolean;
}

export default function GodModeTerminalWithChat({
  isOpen,
  onClose,
  onExecute,
  memories,
  onAddMemory,
  onRemoveMemory,
  voiceState = "idle",
  transcript = "",
  onStartVoice,
  onStopVoice,
  onStopSpeaking,
  isLoading: isGlobalLoading = false,
}: GodModeTerminalProps) {
  const { profile, recordInteraction, addPersonalFact, addGoal, getEnoshInsights, generateAdaptiveSuggestions } =
    useEnoshLearning();
  const { sendMessage, isLoading: aiLoading } = useAI();

  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: "init",
      type: "system",
      content: "ENOSX Secure Kernel v4.2.0-stable loaded.",
      timestamp: new Date(),
    },
    {
      id: "auth",
      type: "system",
      content: "Authentication successful. Welcome, Root User Enosh.",
      timestamp: new Date(),
    },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to ENOSX GOD MODE AI Chat. I'm here to help you with any questions or tasks. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<"terminal" | "system" | "memory" | "security" | "network" | "chat">("terminal");
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    disk: Math.random() * 100,
    uptime: "42d 15h 32m",
    processes: Math.floor(Math.random() * 500) + 100,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Sync transcript to input
  useEffect(() => {
    if (transcript) {
      if (activeTab === "chat") {
        setChatInput(transcript);
      } else {
        setInput(transcript);
      }
    }
  }, [transcript, activeTab]);

  // Update system metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        uptime: "42d 15h 32m",
        processes: Math.floor(Math.random() * 500) + 100,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const addLine = useCallback((type: TerminalLine["type"], content: string) => {
    setHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        type,
        content,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const addChatMessage = useCallback((role: "user" | "assistant", content: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Predictive Workflow Logic
  useEffect(() => {
    if (isOpen && history.length === 2) {
      const suggestions = generateAdaptiveSuggestions();
      if (suggestions.length > 0) {
        setTimeout(() => {
          addLine("predictive", `[PROACTIVE SUGGESTION] ${suggestions[0]}`);
        }, 1000);
      }
    }
  }, [isOpen, addLine, generateAdaptiveSuggestions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (activeTab === "chat") {
          chatInputRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 500);
    }
  }, [isOpen, activeTab]);

  // Handle Chat Tab AI Communication
  const handleChatSubmit = async (e: React.FormEvent | string) => {
    if (typeof e !== "string") e.preventDefault();
    const msg = typeof e === "string" ? e : chatInput.trim();
    if (!msg) return;

    const startTime = Date.now();
    addChatMessage("user", msg);
    if (typeof e !== "string") setChatInput("");

    setIsExecuting(true);
    try {
      let fullResponse = "";

      // Call AI with proper message format
      await sendMessage(
        [{ id: "1", role: "user", content: msg, timestamp: new Date() }],
        (chunk) => {
          fullResponse += chunk;
        },
        () => {
          addChatMessage("assistant", fullResponse);
          recordInteraction(`chat: ${msg}`, Date.now() - startTime, true);
          setIsExecuting(false);
        }
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Chat failed";
      addChatMessage("assistant", `Error: ${errorMsg}`);
      recordInteraction(`chat: ${msg}`, Date.now() - startTime, false);
      setIsExecuting(false);
    }
  };

  const handleCommand = async (e: React.FormEvent | string) => {
    if (typeof e !== "string") e.preventDefault();
    const cmd = typeof e === "string" ? e : input.trim();
    if (!cmd) return;

    const startTime = Date.now();
    addLine("input", cmd);
    if (typeof e !== "string") setInput("");

    const cmdLower = cmd.toLowerCase();
    let success = true;

    // 1. DYNAMIC SKILLS ENGINE
    if (cmdLower.startsWith("skill add ")) {
      const content = cmd.substring(10).trim();
      if (content) {
        onAddMemory("skill", content);
        addLine("system", `NEW SKILL ACQUIRED: "${content}"`);
        addPersonalFact(`Learned skill: ${content}`);
      }
      return;
    }

    // 2. MULTI-AGENT ORCHESTRATION
    if (cmdLower.startsWith("spawn ")) {
      const agentName = cmd.substring(6).trim();
      if (agentName) {
        onAddMemory("agent", `Persona: ${agentName}`);
        addLine("system", `AGENT DEPLOYED: ${agentName.toUpperCase()} is now monitoring this session.`);
      }
      return;
    }

    // 3. SYSTEM OVERRIDES
    if (cmdLower.startsWith("greeting ")) {
      const newGreeting = cmd.substring(9).trim();
      if (newGreeting) {
        onAddMemory("system", `GREETING_OVERRIDE: ${newGreeting}`);
        addLine("system", `SYSTEM GREETING UPDATED: "${newGreeting}"`);
      }
      return;
    }

    // 4. AI CHAT OVERRIDE
    if (cmdLower.startsWith("chat ")) {
      const chatMsg = cmd.substring(5).trim();
      if (chatMsg) {
        setIsExecuting(true);
        try {
          const result = await onExecute(chatMsg);
          addLine("output", result);
          recordInteraction(cmd, Date.now() - startTime, true);
        } catch (err) {
          addLine("error", err instanceof Error ? err.message : "Chat failed");
          recordInteraction(cmd, Date.now() - startTime, false);
          success = false;
        } finally {
          setIsExecuting(false);
        }
      }
      return;
    }

    // 5. PERSONAL FACT LOGGING
    if (cmdLower.startsWith("fact ")) {
      const fact = cmd.substring(5).trim();
      if (fact) {
        addPersonalFact(fact, 75);
        onAddMemory("fact", fact);
        addLine("system", `PERSONAL FACT RECORDED: "${fact}"`);
      }
      return;
    }

    // 6. GOAL TRACKING
    if (cmdLower.startsWith("goal ")) {
      const goal = cmd.substring(5).trim();
      if (goal) {
        addGoal(goal);
        onAddMemory("preference", `Goal: ${goal}`);
        addLine("system", `GOAL ADDED: "${goal}"`);
      }
      return;
    }

    // 7. ENOSH INSIGHTS
    if (cmdLower === "insights" || cmdLower === "profile") {
      const insights = getEnoshInsights();
      addLine("output", insights);
      return;
    }

    // 8. CLEAR TERMINAL
    if (cmdLower === "clear") {
      setHistory([{ id: "clear-" + Date.now(), type: "system", content: "Terminal buffer cleared. Secure session active.", timestamp: new Date() }]);
      return;
    }

    // 9. EXIT
    if (cmdLower === "exit") {
      onClose();
      return;
    }

    // 10. MEMORY OPERATIONS
    if (cmdLower.startsWith("memo ")) {
      const content = cmd.substring(5).trim();
      if (content) {
        onAddMemory("fact", content);
        addLine("system", `Memory logged to core: "${content}"`);
      }
      return;
    }

    if (cmdLower === "ls memo") {
      if (memories.length === 0) {
        addLine("system", "No memory entries found in core.");
      } else {
        addLine("system", `Listing ${memories.length} active core entries:`);
        memories.forEach((m, i) => {
          addLine("system", `${i + 1}. [${m.category.toUpperCase()}] ${m.content}`);
        });
      }
      return;
    }

    // Default: execute as AI command
    setIsExecuting(true);
    try {
      const result = await onExecute(cmd);
      addLine("output", result);
      recordInteraction(cmd, Date.now() - startTime, true);
    } catch (err) {
      addLine("error", err instanceof Error ? err.message : "Command failed");
      recordInteraction(cmd, Date.now() - startTime, false);
      success = false;
    } finally {
      setIsExecuting(false);
    }
  };

  const quickActions = [
    { label: "AI Chat", cmd: "chat ", icon: <MessageSquare size={14} /> },
    { label: "Add Skill", cmd: "skill add ", icon: <PlusCircle size={14} /> },
    { label: "Spawn Agent", cmd: "spawn ", icon: <Users size={14} /> },
    { label: "Set Greeting", cmd: "greeting ", icon: <Settings size={14} /> },
    { label: "Log Memo", cmd: "memo ", icon: <Brain size={14} /> },
    { label: "Add Goal", cmd: "goal ", icon: <Target size={14} /> },
    { label: "Add Fact", cmd: "fact ", icon: <Lightbulb size={14} /> },
    { label: "List Memos", cmd: "ls memo", icon: <Database size={14} /> },
    { label: "Clear", cmd: "clear", icon: <TerminalIcon size={14} /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "chat":
        return (
          <div className="flex flex-col h-full">
            {/* Chat Messages */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0, 242, 255, 0.2) transparent" }}
            >
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/30"
                        : "bg-white/5 text-white/80 border border-white/10"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-50 mt-1 block">{msg.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              {isExecuting && (
                <div className="flex justify-start">
                  <div className="bg-white/5 text-white/60 px-4 py-3 rounded-lg border border-white/10">
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>
                      AI is thinking...
                    </motion.span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t bg-black/40" style={{ borderColor: "rgba(0, 242, 255, 0.15)" }}>
              <form onSubmit={handleChatSubmit} className="relative flex items-center">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={voiceState === "listening" ? "Listening..." : "Ask me anything..."}
                  className="w-full bg-white/5 border border-white/10 focus:border-cyan-400/50 rounded-2xl py-4 pl-6 pr-32 outline-none font-mono text-white transition-all placeholder:text-white/10"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                />
                <div className="absolute right-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (voiceState === "speaking") onStopSpeaking?.();
                      else if (voiceState === "listening") onStopVoice?.();
                      else onStartVoice?.();
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      voiceState === "listening"
                        ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,242,255,0.5)]"
                        : "bg-white/5 text-white/40 hover:text-cyan-400"
                    }`}
                  >
                    {voiceState === "listening" ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isExecuting || aiLoading}
                    className={`p-2 rounded-xl transition-all ${
                      chatInput.trim() ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,242,255,0.5)]" : "bg-white/5 text-white/20"
                    }`}
                  >
                    {isExecuting || aiLoading ? <Cpu size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case "system":
        return (
          <div className="space-y-4 p-8 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-bold">CPU</span>
                  <span className="text-white/60 text-sm">{systemMetrics.cpu.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${systemMetrics.cpu}%` }}
                    className="h-full bg-cyan-400"
                  />
                </div>
              </div>
              <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-bold">MEMORY</span>
                  <span className="text-white/60 text-sm">{systemMetrics.memory.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${systemMetrics.memory}%` }}
                    className="h-full bg-cyan-400"
                  />
                </div>
              </div>
              <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-bold">DISK</span>
                  <span className="text-white/60 text-sm">{systemMetrics.disk.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${systemMetrics.disk}%` }}
                    className="h-full bg-cyan-400"
                  />
                </div>
              </div>
              <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-bold">PROCESSES</span>
                  <span className="text-white/60 text-sm">{systemMetrics.processes}</span>
                </div>
                <div className="text-white/40 text-xs">Active processes running</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-cyan-400 text-xs font-bold mb-3">SYSTEM INFO</div>
              <div className="space-y-2 text-white/60 text-xs font-mono">
                <div>Uptime: {systemMetrics.uptime}</div>
                <div>Kernel: Linux 5.15.0-ENOSX</div>
                <div>Architecture: x86_64</div>
                <div>Load Average: {(systemMetrics.cpu / 100).toFixed(2)}</div>
              </div>
            </div>
          </div>
        );

      case "memory":
        return (
          <div className="space-y-4 p-8 overflow-y-auto">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-cyan-400 text-xs font-bold mb-3">MEMORY BANK</div>
              <MemoryBank memories={memories} onRemove={onRemoveMemory} onAdd={onAddMemory} />
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-4 p-8 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={14} className="text-green-400" />
                  <span className="text-green-400 text-xs font-bold">ENCRYPTION</span>
                </div>
                <span className="text-white/60 text-sm">AES-256 Active</span>
              </div>
              <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert size={14} className="text-green-400" />
                  <span className="text-green-400 text-xs font-bold">FIREWALL</span>
                </div>
                <span className="text-white/60 text-sm">Enabled</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-cyan-400 text-xs font-bold mb-3">SECURITY STATUS</div>
              <div className="space-y-2 text-white/60 text-xs">
                <div>✓ SSL/TLS: Active</div>
                <div>✓ Authentication: Verified</div>
                <div>✓ Session: Secure</div>
                <div>✓ Threat Level: LOW</div>
                <div>✓ Last Scan: 2 minutes ago</div>
              </div>
            </div>
          </div>
        );

      case "network":
        return (
          <div className="space-y-4 p-8 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={14} className="text-blue-400" />
                  <span className="text-blue-400 text-xs font-bold">PING</span>
                </div>
                <span className="text-white/60 text-sm">{Math.floor(Math.random() * 50) + 10}ms</span>
              </div>
              <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-blue-400" />
                  <span className="text-blue-400 text-xs font-bold">BANDWIDTH</span>
                </div>
                <span className="text-white/60 text-sm">{Math.floor(Math.random() * 100) + 50}Mbps</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-cyan-400 text-xs font-bold mb-3">NETWORK INFO</div>
              <div className="space-y-2 text-white/60 text-xs font-mono">
                <div>IP Address: 192.168.1.100</div>
                <div>Gateway: 192.168.1.1</div>
                <div>DNS: 8.8.8.8, 8.8.4.4</div>
                <div>Connection: Ethernet (1Gbps)</div>
                <div>Status: Connected</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-filter backdrop-blur-3xl flex items-center justify-center p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-7xl h-full max-h-[900px] rounded-3xl border flex flex-col overflow-hidden shadow-[0_0_80px_rgba(0,242,255,0.2)]"
            style={{ borderColor: "rgba(0, 242, 255, 0.3)", background: "rgba(5, 5, 5, 0.9)" }}
          >
            {/* Terminal Header */}
            <div className="p-5 border-b flex items-center justify-between bg-black/60" style={{ borderColor: "rgba(0, 242, 255, 0.15)" }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                  <ShieldAlert size={22} className="text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xs font-black tracking-[0.4em] text-cyan-400 uppercase">ENOSX GOD MODE</h2>
                  <p className="text-[10px] text-cyan-400/40 font-mono">KERNEL_VERSION: 4.2.0-STABLE // ROOT_ACCESS: GRANTED</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 flex-wrap justify-center max-w-2xl">
                {["terminal", "chat", "system", "memory", "security", "network"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                      activeTab === tab ? "bg-cyan-400 text-black" : "text-white/40 hover:text-white"
                    }`}
                  >
                    {tab === "terminal" && <Terminal size={12} />}
                    {tab === "chat" && <MessageSquare size={12} />}
                    {tab === "system" && <Activity size={12} />}
                    {tab === "memory" && <Database size={12} />}
                    {tab === "security" && <Lock size={12} />}
                    {tab === "network" && <Globe size={12} />}
                    <span className="hidden sm:inline">{tab}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-[10px] text-cyan-400/60 font-mono">
                    <Users size={12} />
                    <span>AGENTS: {memories.filter((m) => m.category === "agent").length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-cyan-400/60 font-mono">
                    <Zap size={12} />
                    <span>SKILLS: {memories.filter((m) => m.category === "skill").length}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 rounded-xl transition-all text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/30"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left Sidebar: Quick Actions */}
              <div className="w-20 md:w-64 border-r bg-black/40 flex flex-col p-4 gap-2" style={{ borderColor: "rgba(0, 242, 255, 0.1)" }}>
                <span className="hidden md:block text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2 px-2">Quick Actions</span>
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      if (action.cmd.endsWith(" ")) {
                        setInput(action.cmd);
                        inputRef.current?.focus();
                      } else {
                        handleCommand(action.cmd);
                      }
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-cyan-400/10 text-white/60 hover:text-cyan-400 transition-all border border-transparent hover:border-cyan-400/20 group"
                  >
                    <span className="group-hover:scale-110 transition-transform">{action.icon}</span>
                    <span className="hidden md:block text-xs font-medium">{action.label}</span>
                  </button>
                ))}
                <div className="mt-auto p-4 rounded-2xl bg-cyan-400/5 border border-cyan-400/10 hidden md:block">
                  <div className="flex items-center gap-2 text-cyan-400 mb-2">
                    <Lock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Security Status</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: ["20%", "80%", "40%", "90%"] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="h-full bg-cyan-400"
                      />
                    </div>
                    <span className="text-[8px] text-cyan-400/40 font-mono uppercase">Encrypted Tunnel: Active</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-w-0 bg-black/20">
                {/* Content Area */}
                {activeTab === "terminal" ? (
                  <>
                    {/* Terminal Output */}
                    <div
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto p-8 font-mono text-sm space-y-3"
                      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0, 242, 255, 0.2) transparent" }}
                    >
                      {history.map((line) => (
                        <div key={line.id} className="flex gap-4 group">
                          <span className="opacity-20 select-none text-xs mt-1 group-hover:opacity-40 transition-opacity">
                            {line.timestamp.toLocaleTimeString([], { hour12: false })}
                          </span>
                          <div className="flex-1">
                            <div
                              className={`px-3 py-1.5 rounded-lg inline-block ${
                                line.type === "input"
                                  ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                                  : line.type === "error"
                                  ? "bg-red-400/10 text-red-400 border border-red-400/20"
                                  : line.type === "system"
                                  ? "text-white/30 italic"
                                  : line.type === "predictive"
                                  ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-bold"
                                  : "text-white/80"
                              }`}
                            >
                              {line.type === "input" && <span className="mr-2 opacity-50">$</span>}
                              {line.content}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isExecuting && (
                        <div className="flex gap-4 items-center">
                          <span className="opacity-20 select-none text-xs">{new Date().toLocaleTimeString([], { hour12: false })}</span>
                          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-cyan-400/5 border border-cyan-400/10">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                              <Cpu size={14} className="text-cyan-400" />
                            </motion.div>
                            <motion.span
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="text-cyan-400 text-xs font-bold tracking-widest uppercase"
                            >
                              Executing Subroutine...
                            </motion.span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Terminal Input Form */}
                    <div className="p-6 border-t bg-black/40" style={{ borderColor: "rgba(0, 242, 255, 0.15)" }}>
                      <form onSubmit={handleCommand} className="relative flex items-center">
                        <div className="absolute left-4 flex items-center gap-2 pointer-events-none">
                          <span className="text-cyan-400 font-black text-xs">ENOSX</span>
                          <span className="text-white/20 text-xs">❯</span>
                        </div>
                        <input
                          ref={inputRef}
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={voiceState === "listening" ? "Listening..." : "Enter command or override code..."}
                          className="w-full bg-white/5 border border-white/10 focus:border-cyan-400/50 rounded-2xl py-4 pl-24 pr-32 outline-none font-mono text-white transition-all placeholder:text-white/10"
                          autoFocus
                          spellCheck={false}
                          autoComplete="off"
                        />
                        <div className="absolute right-4 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (voiceState === "speaking") onStopSpeaking?.();
                              else if (voiceState === "listening") onStopVoice?.();
                              else onStartVoice?.();
                            }}
                            className={`p-2 rounded-xl transition-all ${
                              voiceState === "listening"
                                ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,242,255,0.5)]"
                                : "bg-white/5 text-white/40 hover:text-cyan-400"
                            }`}
                          >
                            {voiceState === "listening" ? <MicOff size={18} /> : <Mic size={18} />}
                          </button>
                          <button
                            type="submit"
                            disabled={!input.trim() || isExecuting || isGlobalLoading}
                            className={`p-2 rounded-xl transition-all ${
                              input.trim() ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,242,255,0.5)]" : "bg-white/5 text-white/20"
                            }`}
                          >
                            {isExecuting || isGlobalLoading ? <Cpu size={18} className="animate-spin" /> : <Send size={18} />}
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                ) : (
                  renderTabContent()
                )}
              </div>

              {/* Right Side Panel: Memory Bank */}
              <div className="hidden lg:flex w-96 border-l flex-col bg-black/40" style={{ borderColor: "rgba(0, 242, 255, 0.1)" }}>
                <div className="p-6 border-b" style={{ borderColor: "rgba(0, 242, 255, 0.1)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-cyan-400">
                      <Database size={20} />
                      <span className="text-xs font-black tracking-[0.2em] uppercase">Core Memory</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/20">{memories.length} ENTRIES</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (memories.length / 50) * 100)}%` }}
                      className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.5)]"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <MemoryBank memories={memories} onRemove={onRemoveMemory} onAdd={onAddMemory} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
