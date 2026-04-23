/*
 * ENOSX XAI — GodModeTerminal
 * A full-screen, high-security developer terminal for system overrides
 * and high-end cyberpunk styling.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Cpu, Database } from "lucide-react";
import { MemoryEntry } from "@/hooks/useMemoryBank";
import MemoryBank from "./MemoryBank";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "system" | "error";
  content: string;
  timestamp: Date;
}

interface GodModeTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (command: string) => Promise<string>;
  memories: MemoryEntry[];
  onAddMemory: (category: MemoryEntry["category"], content: string) => void;
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

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    addLine("input", cmd);
    setInput("");

    if (cmd.toLowerCase() === "clear") {
      setHistory([
        {
          id: "clear-" + Date.now(),
          type: "system",
          content: "Terminal buffer cleared. Secure session active.",
          timestamp: new Date(),
        }
      ]);
      return;
    }

    if (cmd.toLowerCase() === "exit") {
      onClose();
      return;
    }

    // Specialized Memory Commands
    if (cmd.toLowerCase().startsWith("memo ")) {
      const content = cmd.substring(5).trim();
      if (content) {
        onAddMemory("fact", content);
        addLine("system", `Memory logged to core: "${content}"`);
        return;
      }
    }

    if (cmd.toLowerCase() === "ls memo") {
      if (memories.length === 0) {
        addLine("system", "No memory entries found in core.");
      } else {
        addLine("system", `Listing ${memories.length} active memory entries:`);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-filter backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-6xl h-full max-h-[800px] rounded-2xl border flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.15)]"
            style={{ borderColor: "rgba(0, 242, 255, 0.2)", background: "rgba(10, 10, 10, 0.8)" }}
          >
            {/* Terminal Header */}
            <div className="p-4 border-b flex items-center justify-between bg-black/40" style={{ borderColor: "rgba(0, 242, 255, 0.1)" }}>
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-cyan-400 animate-pulse" />
                <span className="text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase">Secure Root Console</span>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Layout Split View */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col min-w-0">
                {/* Terminal Output */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-2"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0, 242, 255, 0.2) transparent" }}
                >
                  {history.map((line) => (
                    <div key={line.id} className="flex gap-3">
                      <span className="opacity-30 select-none">
                        [{line.timestamp.toLocaleTimeString([], { hour12: false })}]
                      </span>
                      <div className="flex-1">
                        <span 
                          className={
                            line.type === "input" ? "text-cyan-400" :
                            line.type === "error" ? "text-red-400" :
                            line.type === "system" ? "text-white/40 italic" :
                            "text-white/90"
                          }
                        >
                          {line.type === "input" && <span className="mr-2">$</span>}
                          {line.content}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isExecuting && (
                    <div className="flex gap-3 items-center">
                      <span className="opacity-30 select-none">
                        [{new Date().toLocaleTimeString([], { hour12: false })}]
                      </span>
                      <motion.div 
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-cyan-400"
                      >
                        Processing command...
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Terminal Input Form */}
                <form 
                  onSubmit={handleCommand}
                  className="p-4 border-t flex items-center gap-3"
                  style={{ borderColor: "rgba(0, 242, 255, 0.2)", background: "rgba(0, 242, 255, 0.02)" }}
                >
                  <span className="text-cyan-400 font-bold font-mono">enosh@enosx:~$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-mono text-white"
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <Cpu size={16} className={isExecuting ? "animate-pulse text-cyan-400" : "text-white/20"} />
                </form>
              </div>

              {/* Right Side Panel: Memory Bank */}
              <div 
                className="w-80 border-l p-4 overflow-y-auto bg-black/20"
                style={{ borderColor: "rgba(0, 242, 255, 0.1)" }}
              >
                <div className="mb-6 flex items-center gap-2 text-cyan-400">
                  <Database size={16} />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Core Memory Bank</span>
                </div>
                <MemoryBank 
                  memories={memories} 
                  onRemove={onRemoveMemory} 
                  onAdd={onAddMemory} 
                />
                <div className="mt-8 p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/10">
                  <p className="text-[9px] text-cyan-400/60 leading-relaxed font-mono">
                    COMMANDS:<br/>
                    - memo [text]: Add new fact<br/>
                    - ls memo: List entries<br/>
                    - clear: Reset terminal<br/>
                    - exit: Close GOD MODE
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
