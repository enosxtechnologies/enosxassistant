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

      <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {memories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center border border-dashed rounded-xl"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              <p className="text-xs opacity-40" style={{ color: config.text }}>No memories stored yet.</p>
            </motion.div>
          ) : (
            memories.map((memory) => (
              <motion.div
                key={memory.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3 rounded-xl border group relative"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                        style={{ 
                          background: memory.category === 'preference' ? 'rgba(34,197,94,0.1)' : 
                                      memory.category === 'project' ? 'rgba(59,130,246,0.1)' : 
                                      'rgba(168,85,247,0.1)',
                          color: memory.category === 'preference' ? '#22c55e' : 
                                 memory.category === 'project' ? '#3b82f6' : 
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
