/*
 * ENOSX AI — Sidebar
 * Clean command-center sidebar with focused navigation, function shortcuts, and conversation history.
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Crown,
  Github,
  Info,
  Sparkles,
  ShieldOff,
  TerminalSquare,
} from "lucide-react";
import { Conversation } from "@/lib/types";
import { useTheme } from "@/contexts/ThemeContext";
import { useWallpaper } from "@/contexts/WallpaperContext";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  onGitHubConnect?: () => void;
  onGodMode?: () => void;
  isPro?: boolean;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  collapsed,
  onToggle,
  onGitHubConnect,
  onGodMode,
  isPro = false,
}: SidebarProps) {
  const { config } = useTheme();
  const { settings } = useWallpaper();

  const navItems = [
    {
      label: "New Chat",
      description: "Start a fresh workspace",
      icon: Plus,
      onClick: onNew,
      accent: true,
    },
    {
      label: "GitHub Repos",
      description: "Connect repo intelligence",
      icon: Github,
      onClick: onGitHubConnect,
    },
    {
      label: "GOD MODE",
      description: "Advanced operator terminal",
      icon: ShieldOff,
      onClick: onGodMode,
      danger: true,
    },
    {
      label: "About ENOSX",
      description: "Vision, stack, and founder",
      icon: Info,
      onClick: () => { window.location.href = "/about"; },
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 292 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex-shrink-0 flex flex-col h-full overflow-hidden"
      style={{
        background: `linear-gradient(180deg, rgba(7,8,12,${settings.panelOpacity * 0.96}) 0%, rgba(12,12,18,${settings.panelOpacity * 0.9}) 100%)`,
        backdropFilter: `blur(${settings.blurAmount}px)`,
        WebkitBackdropFilter: `blur(${settings.blurAmount}px)`,
        borderRight: `1px solid rgba(${config.accentRgb}, 0.14)`,
        boxShadow: `inset -1px 0 0 rgba(${config.accentRgb}, 0.06), 18px 0 50px rgba(0,0,0,0.22)`,
      }}
    >
      <div
        className="flex items-center px-3 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid rgba(${config.accentRgb}, 0.08)`, minHeight: 72 }}
      >
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-w-0"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-[0_0_15px_rgba(124,111,247,0.5)]"
                    style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)' }}
                  >
                    EX
                  </div>
                  <span
                    className="text-lg font-bold tracking-tight leading-none"
                    style={{
                      color: config.text,
                    }}
                  >
                    EnosX <span style={{ color: '#7c6ff7' }}>AI</span>
                  </span>
                </div>
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
              </div>
              <p
                className="mt-1 text-[10px] uppercase"
                style={{ color: config.textMuted, letterSpacing: "0.16em" }}
              >
                Autonomous assistant console
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggle}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
          style={{
            background: `rgba(${config.accentRgb}, 0.08)`,
            border: `1px solid rgba(${config.accentRgb}, 0.16)`,
            color: config.textMuted,
            marginLeft: collapsed ? "auto" : "8px",
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </motion.button>
      </div>

      <div className="px-2.5 py-3 flex-shrink-0 space-y-1.5">
        {!collapsed && (
          <p
            className="px-2 pb-1 text-[10px] uppercase"
            style={{ color: config.textMuted, letterSpacing: "0.16em" }}
          >
            Functions
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.015, x: collapsed ? 0 : 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-2xl transition-all duration-200 text-left"
              style={{
                background: item.accent
                  ? `linear-gradient(135deg, rgba(${config.accentRgb}, 0.18), rgba(${config.accentRgb}, 0.07))`
                  : item.danger
                  ? "linear-gradient(135deg, rgba(220,20,60,0.13), rgba(220,20,60,0.04))"
                  : "rgba(255,255,255,0.035)",
                border: item.accent
                  ? `1px solid rgba(${config.accentRgb}, 0.26)`
                  : item.danger
                  ? "1px solid rgba(220,20,60,0.22)"
                  : "1px solid rgba(255,255,255,0.06)",
                color: item.accent ? config.accent : item.danger ? "#ff6b8a" : config.text,
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              title={item.label}
            >
              <Icon size={16} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="min-w-0 overflow-hidden"
                  >
                    <span className="block text-xs font-semibold whitespace-nowrap">{item.label}</span>
                    <span
                      className="block text-[10px] truncate"
                      style={{ color: config.textMuted, letterSpacing: "0.02em" }}
                    >
                      {item.description}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 pb-2 space-y-1 scrollbar-thin">
        {!collapsed && (
          <div className="flex items-center justify-between px-2 pt-2 pb-1">
            <p
              className="text-[10px] uppercase"
              style={{ color: config.textMuted, letterSpacing: "0.16em" }}
            >
              Chats
            </p>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                color: config.textMuted,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {conversations.length}
            </span>
          </div>
        )}
        <AnimatePresence initial={false}>
          {conversations.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
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
                  style={{ color: activeId === conv.id ? config.accent : config.textMuted, flexShrink: 0 }}
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

              {!collapsed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1, scale: 1.1 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150"
                  style={{ background: "rgba(220,20,60,0.12)", color: "rgba(220,20,60,0.7)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  title="Delete chat"
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
            <TerminalSquare size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs opacity-60">No chats yet. Start with a function above.</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-6 flex-shrink-0 flex flex-col items-center border-t border-white/5"
          >
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold mb-1">from</span>
            <span 
              className="text-xl text-white/60"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Enosx Technologies
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
