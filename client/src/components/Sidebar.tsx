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
  collapsed?: boolean;
  onToggle?: () => void;
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
  collapsed = true,
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

  // Force collapsed state for the always-small mode
  const isCollapsed = true;

  return (
    <motion.aside
      initial={false}
      animate={{ width: 64 }}
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
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-[0_0_15px_rgba(124,111,247,0.5)] mx-auto"
             style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)' }}>
          EX
        </div>
      </div>

      <div className="px-2.5 py-3 flex-shrink-0 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={item.onClick}
              className="w-full flex items-center justify-center px-2.5 py-2.5 rounded-2xl transition-all duration-200"
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
              }}
              title={item.label}
            >
              <Icon size={16} className="flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 pb-2 space-y-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {conversations.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              className="group relative"
            >
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onSelect(conv.id)}
                className="w-full flex items-center justify-center px-2.5 py-2.5 rounded-xl text-left transition-all duration-200"
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
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
