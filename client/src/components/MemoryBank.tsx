/*
 * ENOSX XAI — MemoryBank UI
 * A glassy, bento-style component to visualize what the AI remembers.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Trash2, Plus, Calendar, Tag } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { MemoryEntry } from "@/hooks/useMemoryBank";

interface MemoryBankProps {
  memories: MemoryEntry[];
  onRemove: (id: string) => void;
  onAdd: (category: MemoryEntry["category"], content: string) => void;
}

export default function MemoryBank({ memories, onRemove, onAdd }: MemoryBankProps) {
  const { config } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold tracking-wider uppercase" style={{ color: config.text }}>
            Memory Bank
          </h3>
        </div>
        <span className="text-[10px] opacity-50 font-mono" style={{ color: config.text }}>
          {memories.length} ENTRIES
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {memories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center border border-dashed rounded-2xl bg-white/[0.02]"
              style={{ borderColor: "rgba(0,242,255,0.1)" }}
            >
              <div className="w-10 h-10 rounded-full bg-cyan-400/5 flex items-center justify-center mx-auto mb-3 border border-cyan-400/10">
                <Brain size={18} className="text-cyan-400/30" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-30" style={{ color: config.text }}>Core Empty</p>
            </motion.div>
          ) : (
            memories.map((memory) => (
              <motion.div
                key={memory.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-2xl border group relative overflow-hidden transition-all duration-300 hover:border-cyan-400/30"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.05)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                        style={{ 
                          background: memory.category === 'preference' ? 'rgba(34,197,94,0.1)' : 
                                      memory.category === 'project' ? 'rgba(59,130,246,0.1)' : 
                                      memory.category === 'skill' ? 'rgba(0,242,255,0.1)' :
                                      memory.category === 'agent' ? 'rgba(236,72,153,0.1)' :
                                      'rgba(168,85,247,0.1)',
                          color: memory.category === 'preference' ? '#22c55e' : 
                                 memory.category === 'project' ? '#3b82f6' : 
                                 memory.category === 'skill' ? '#00f2ff' :
                                 memory.category === 'agent' ? '#ec4899' :
                                 '#a855f7'
                        }}
                      >
                        {memory.category}
                      </span>
                      <span className="text-[9px] opacity-30 flex items-center gap-1">
                        <Calendar size={8} />
                        {memory.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: config.text }}>
                      {memory.content}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(memory.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-md transition-all"
                  >
                    <Trash2 size={12} className="text-red-500/60" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
