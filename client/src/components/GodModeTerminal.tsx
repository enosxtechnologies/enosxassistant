/*
 * ENOSX XAI — GodModeTerminal
 * A full-screen, high-security developer terminal for system overrides
 * and high-end cyberpunk styling.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Cpu, Database, Users, Zap, Brain, Terminal, Settings, Activity, Lock, Globe, Terminal as TerminalIcon, PlusCircle } from "lucide-react";
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
}

export default function GodModeTerminal({ 
  isOpen, 
  onClose, 
  onExecute,
  memories,
  onAddMemory,
  onRemoveMemory
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
    { label: "Add Skill", cmd: "skill add ", icon: <PlusCircle size={14} /> },
    { label: "Spawn Agent", cmd: "spawn ", icon: <Users size={14} /> },
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
            className="w-full max-w-7xl h-full max-h-[900px] rounded-3xl border flex flex-col overflow-hidden shadow-[0_0_120px_rgba(0,242,255,0.15)] relative"
            style={{ borderColor: "rgba(0, 242, 255, 0.25)", background: "rgba(2, 4, 8, 0.95)" }}
          >
            {/* Background Scanning Line */}
            <motion.div 
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-cyan-400/10 z-0 pointer-events-none blur-[1px]"
            />
            
            {/* Terminal Header */}
            <div className="p-5 border-b flex items-center justify-between bg-black/40 backdrop-blur-md z-10" style={{ borderColor: "rgba(0, 242, 255, 0.15)" }}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"
                  />
                  <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/30 relative z-10">
                    <ShieldAlert size={24} className="text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-[0.5em] text-cyan-400 uppercase drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">ENOSX GOD MODE</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[9px] text-cyan-400/50 font-mono uppercase tracking-widest">Kernel v4.2.0-STABLE</p>
                    <div className="w-1 h-1 rounded-full bg-cyan-400/30" />
                    <p className="text-[9px] text-emerald-400/70 font-mono uppercase tracking-widest animate-pulse">Root Access: Verified</p>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-1 bg-black/60 p-1.5 rounded-2xl border border-cyan-400/20 shadow-[inset_0_0_20px_rgba(0,242,255,0.05)]">
                {(['terminal', 'system', 'network'] as const).map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 flex items-center gap-2.5 overflow-hidden group ${activeTab === tab ? 'text-black' : 'text-cyan-400/40 hover:text-cyan-400'}`}
                  >
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="activeTab" 
                        className="absolute inset-0 bg-cyan-400 shadow-[0_0_20px_rgba(0,242,255,0.4)]" 
                        transition={{ type: "spring", bounce: 0.15, duration: 0.6 }} 
                      />
                    )}
                    {tab === 'terminal' && <Terminal size={14} className="relative z-10" />}
                    {tab === 'system' && <Activity size={14} className="relative z-10" />}
                    {tab === 'network' && <Globe size={14} className="relative z-10" />}
                    <span className="relative z-10">{tab}</span>
                    {activeTab !== tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-cyan-400/0 group-hover:bg-cyan-400/30 transition-all" />
                    )}
                  </button>
                ))}
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
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-cyan-400/10">
                    <motion.div 
                      animate={{ 
                        width: ["20%", "80%", "40%", "90%", "60%", "95%"],
                        backgroundColor: ["rgba(0,242,255,0.5)", "rgba(0,242,255,0.8)", "rgba(0,242,255,0.5)"]
                      }} 
                      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} 
                      className="h-full shadow-[0_0_10px_rgba(0,242,255,0.5)]"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[8px] text-cyan-400/40 font-mono uppercase tracking-tighter">Encrypted Tunnel</span>
                    <span className="text-[8px] text-emerald-400/60 font-mono uppercase">Active</span>
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
                          className={`px-4 py-2 rounded-xl inline-block backdrop-blur-sm transition-all duration-300 hover:translate-x-1 ${
                            line.type === "input" ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,242,255,0.05)]" :
                            line.type === "error" ? "bg-red-400/10 text-red-400 border border-red-400/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]" :
                            line.type === "system" ? "text-white/30 italic border border-transparent" :
                            line.type === "predictive" ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 font-bold shadow-[0_0_15px_rgba(250,204,21,0.05)]" :
                            "text-white/80 bg-white/5 border border-white/10"
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
                      placeholder="Enter command or override code..."
                      className="w-full bg-white/5 border border-white/10 focus:border-cyan-400/50 rounded-2xl py-4 pl-24 pr-12 outline-none font-mono text-white transition-all placeholder:text-white/10"
                      autoFocus
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <div className="absolute right-4 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-cyan-400 animate-ping' : 'bg-white/10'}`} />
                      <Settings size={16} className="text-white/20" />
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
