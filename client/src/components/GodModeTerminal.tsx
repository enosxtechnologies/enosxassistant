/*
 * ENOSX XAI — GodModeTerminal
 * A full-screen, high-security developer terminal for system overrides
 * and high-end cyberpunk styling.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Cpu, Database, Users, Zap, Brain, Terminal, Settings, Activity, Lock, Globe, Terminal as TerminalIcon, PlusCircle, Mic, MicOff, Send, MessageSquare } from "lucide-react";
import { MemoryEntry } from "@/hooks/useMemoryBank";
import MemoryBank from "./MemoryBank";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "system" | "error" | "predictive";
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
  // Voice & Chat props
  voiceState?: string;
  transcript?: string;
  onStartVoice?: () => void;
  onStopVoice?: () => void;
  onStopSpeaking?: () => void;
  isLoading?: boolean;
}

export default function GodModeTerminal({ 
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
    }
  ]);
  const [input, setInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<"terminal" | "system" | "network">("terminal");

  // Sync transcript to input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Predictive Workflow Logic
  useEffect(() => {
    if (isOpen && history.length === 2) {
      const hour = new Date().getHours();
      let suggestion = "";
      if (hour >= 9 && hour <= 11) suggestion = "Enosh, it's morning. Shall I initialize your dev environment?";
      else if (hour >= 22 || hour <= 4) suggestion = "Late night session detected. Optimization mode recommended.";
      else suggestion = "System ready for deployment. What's the focus today?";

      setTimeout(() => {
        addLine("predictive", `[PROACTIVE SUGGESTION] ${suggestion}`);
      }, 1000);
    }
  }, [isOpen, addLine]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 500);
    }
  }, [isOpen]);

  const handleCommand = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const cmd = typeof e === 'string' ? e : input.trim();
    if (!cmd) return;

    addLine("input", cmd);
    if (typeof e !== 'string') setInput("");

    const cmdLower = cmd.toLowerCase();

    // 1. DYNAMIC SKILLS ENGINE
    if (cmdLower.startsWith("skill add ")) {
      const content = cmd.substring(10).trim();
      if (content) {
        onAddMemory("skill", content);
        addLine("system", `NEW SKILL ACQUIRED: "${content}"`);
        return;
      }
    }

    // 2. MULTI-AGENT ORCHESTRATION
    if (cmdLower.startsWith("spawn ")) {
      const agentName = cmd.substring(6).trim();
      if (agentName) {
        onAddMemory("agent", `Persona: ${agentName}`);
        addLine("system", `AGENT DEPLOYED: ${agentName.toUpperCase()} is now monitoring this session.`);
        return;
      }
    }

    // 3. SYSTEM OVERRIDES
    if (cmdLower.startsWith("greeting ")) {
      const newGreeting = cmd.substring(9).trim();
      if (newGreeting) {
        onAddMemory("system", `GREETING_OVERRIDE: ${newGreeting}`);
        addLine("system", `SYSTEM GREETING UPDATED: "${newGreeting}"`);
        return;
      }
    }

    // 4. AI CHAT OVERRIDE
    if (cmdLower.startsWith("chat ")) {
      const chatMsg = cmd.substring(5).trim();
      if (chatMsg) {
        setIsExecuting(true);
        try {
          const result = await onExecute(chatMsg);
          addLine("output", result);
        } catch (err) {
          addLine("error", err instanceof Error ? err.message : "Chat failed");
        } finally {
          setIsExecuting(false);
        }
        return;
      }
    }

    if (cmdLower === "clear") {
      setHistory([{ id: "clear-" + Date.now(), type: "system", content: "Terminal buffer cleared. Secure session active.", timestamp: new Date() }]);
      return;
    }

    if (cmdLower === "exit") {
      onClose();
      return;
    }

    if (cmdLower.startsWith("memo ")) {
      const content = cmd.substring(5).trim();
      if (content) {
        onAddMemory("fact", content);
        addLine("system", `Memory logged to core: "${content}"`);
        return;
      }
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

    setIsExecuting(true);
    try {
      const result = await onExecute(cmd);
      addLine("output", result);
    } catch (err) {
      addLine("error", err instanceof Error ? err.message : "Command failed");
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
    { label: "List Memos", cmd: "ls memo", icon: <Database size={14} /> },
    { label: "Clear", cmd: "clear", icon: <TerminalIcon size={14} /> },
  ];

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
              
              <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setActiveTab("terminal")}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'terminal' ? 'bg-cyan-400 text-black' : 'text-white/40 hover:text-white'}`}
                >
                  <Terminal size={14} /> Terminal
                </button>
                <button 
                  onClick={() => setActiveTab("system")}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'system' ? 'bg-cyan-400 text-black' : 'text-white/40 hover:text-white'}`}
                >
                  <Activity size={14} /> System
                </button>
                <button 
                  onClick={() => setActiveTab("network")}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'network' ? 'bg-cyan-400 text-black' : 'text-white/40 hover:text-white'}`}
                >
                  <Globe size={14} /> Network
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-[10px] text-cyan-400/60 font-mono">
                    <Users size={12} />
                    <span>AGENTS: {memories.filter(m => m.category === 'agent').length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-cyan-400/60 font-mono">
                    <Zap size={12} />
                    <span>SKILLS: {memories.filter(m => m.category === 'skill').length}</span>
                  </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 rounded-xl transition-all text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/30">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Main Layout Split View */}
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
                            line.type === "input" ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20" :
                            line.type === "error" ? "bg-red-400/10 text-red-400 border border-red-400/20" :
                            line.type === "system" ? "text-white/30 italic" :
                            line.type === "predictive" ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-bold" :
                            "text-white/80"
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
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Cpu size={14} className="text-cyan-400" />
                        </motion.div>
                        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} className="text-cyan-400 text-xs font-bold tracking-widest uppercase">Executing Subroutine...</motion.span>
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
                      placeholder={voiceState === 'listening' ? "Listening..." : "Enter command or override code..."}
                      className="w-full bg-white/5 border border-white/10 focus:border-cyan-400/50 rounded-2xl py-4 pl-24 pr-32 outline-none font-mono text-white transition-all placeholder:text-white/10"
                      autoFocus
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <div className="absolute right-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (voiceState === 'speaking') onStopSpeaking?.();
                          else if (voiceState === 'listening') onStopVoice?.();
                          else onStartVoice?.();
                        }}
                        className={`p-2 rounded-xl transition-all ${voiceState === 'listening' ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,242,255,0.5)]' : 'bg-white/5 text-white/40 hover:text-cyan-400'}`}
                      >
                        {voiceState === 'listening' ? <MicOff size={18} /> : <Mic size={18} />}
                      </button>
                      <button
                        type="submit"
                        disabled={!input.trim() || isExecuting || isGlobalLoading}
                        className={`p-2 rounded-xl transition-all ${input.trim() ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,242,255,0.5)]' : 'bg-white/5 text-white/20'}`}
                      >
                        {isExecuting || isGlobalLoading ? <Cpu size={18} className="animate-spin" /> : <Send size={18} />}
                      </button>
                    </div>
                  </form>
                </div>
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
