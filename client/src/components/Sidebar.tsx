/*
 * Assistant — Sidebar
 * Glassmorphism acrylic panel with smooth slide animation
 * Features: conversation list, new chat, delete, collapse toggle
 */

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, MessageSquare, ChevronLeft, ChevronRight, Zap, Crown } from "lucide-react";
import { Conversation } from "@/lib/types";
import { useTheme } from "@/contexts/ThemeContext";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  isPro?: boolean;
  children?: React.ReactNode;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  collapsed,
  onToggle,
  isPro = false,
  children,
}: SidebarProps) {
  const { config } = useTheme();

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 52 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex-shrink-0 flex flex-col h-full overflow-hidden"
      style={{
        background: `rgba(${config.accentRgb}, 0.04)`,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: `1px solid rgba(${config.accentRgb}, 0.12)`,
        boxShadow: `inset -1px 0 0 rgba(${config.accentRgb}, 0.06)`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-3 py-3 flex-shrink-0"
        style={{
          borderBottom: `1px solid rgba(${config.accentRgb}, 0.08)`,
          minHeight: 48,
        }}
      >
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              {/* Pulsing orb logo */}
              <div className="relative flex-shrink-0">
                <motion.div
                  animate={{
                    boxShadow: [
                      `0 0 8px rgba(${config.accentRgb}, 0.4)`,
                      `0 0 18px rgba(${config.accentRgb}, 0.7)`,
                      `0 0 8px rgba(${config.accentRgb}, 0.4)`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle, rgba(${config.accentRgb},0.9) 0%, rgba(${config.accentRgb},0.4) 100%)`,
                  }}
                >
                  <Zap size={12} style={{ color: "#fff" }} />
                </motion.div>
              </div>
              <span
                className="text-sm font-bold truncate"
                style={{ color: config.text, letterSpacing: "-0.02em" }}
              >
                ASSISTANT
              </span>
              {isPro && (
                <span
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs flex-shrink-0"
                  style={{
                    background: `rgba(${config.accentRgb}, 0.15)`,
                    border: `1px solid rgba(${config.accentRgb}, 0.3)`,
                    color: config.accent,
                    fontSize: "9px",
                    letterSpacing: "0.04em",
                  }}
                >
                  <Crown size={8} />
                  PRO
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggle}
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200"
          style={{
            background: `rgba(${config.accentRgb}, 0.06)`,
            border: `1px solid rgba(${config.accentRgb}, 0.12)`,
            color: config.textMuted,
            marginLeft: collapsed ? "auto" : "4px",
          }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </motion.button>
      </div>

      {/* New Chat Button */}
      <div className="px-2 py-2 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNew}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-200"
          style={{
            background: `rgba(${config.accentRgb}, 0.1)`,
            border: `1px solid rgba(${config.accentRgb}, 0.2)`,
            color: config.accent,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
          title="New Chat"
        >
          <Plus size={14} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xs font-medium overflow-hidden whitespace-nowrap"
                style={{ letterSpacing: "0.03em" }}
              >
                New Chat
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {conversations.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="group relative"
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(conv.id)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all duration-200"
                style={
                  activeId === conv.id
                    ? {
                        background: `rgba(${config.accentRgb}, 0.14)`,
                        border: `1px solid rgba(${config.accentRgb}, 0.28)`,
                        color: config.text,
                        boxShadow: `0 0 12px rgba(${config.accentRgb}, 0.1)`,
                      }
                    : {
                        background: "transparent",
                        border: "1px solid transparent",
                        color: config.textMuted,
                      }
                }
                title={conv.title}
              >
                <MessageSquare
                  size={13}
                  style={{
                    color: activeId === conv.id ? config.accent : config.textMuted,
                    flexShrink: 0,
                  }}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs truncate flex-1 min-w-0"
                      style={{ letterSpacing: "0.01em" }}
                    >
                      {conv.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Delete button */}
              {!collapsed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1, scale: 1.1 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150"
                  style={{
                    background: "rgba(220,20,60,0.12)",
                    color: "rgba(220,20,60,0.7)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  title="Delete"
                >
                  <Trash2 size={10} />
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {conversations.length === 0 && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
            style={{ color: config.textMuted }}
          >
            <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs opacity-50">No conversations yet</p>
          </motion.div>
        )}
      </div>

      {/* Custom Children (Memory Bank) */}
      {!collapsed && children}

      {/* Footer */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 py-2.5 flex-shrink-0"
            style={{ borderTop: `1px solid rgba(${config.accentRgb}, 0.08)` }}
          >
            <p
              className="text-xs"
              style={{ color: config.textMuted, letterSpacing: "0.04em", fontSize: "10px" }}
            >
              SECURE SYSTEM · ACTIVE
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
