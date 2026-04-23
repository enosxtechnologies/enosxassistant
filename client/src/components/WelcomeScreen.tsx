/*
 * ENOSX XAI — WelcomeScreen
 * Animated welcome with floating orb avatar, suggestion chips
 * Features: breathing orb, staggered fade-in, glassmorphism cards
 */

import { motion } from "framer-motion";
import { Zap, Code, Globe, Brain, Cpu, Sparkles } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

const SUGGESTIONS = [
  { icon: Code, text: "Write a React component for a glassmorphism card" },
  { icon: Globe, text: "Explain how WebSockets work in simple terms" },
  { icon: Brain, text: "What are the best practices for AI prompt engineering?" },
  { icon: Cpu, text: "Help me optimize this JavaScript function for performance" },
  { icon: Sparkles, text: "Design a modern dark UI color palette" },
  { icon: Zap, text: "Create a Python script to automate file organization" },
];

export default function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  const { config } = useTheme();

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
      <div className="max-w-2xl w-full flex flex-col items-center gap-8">
        {/* Animated orb avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative"
        >
          {/* Outer pulse ring */}
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(${config.accentRgb},0.3) 0%, transparent 70%)`,
            }}
          />
          {/* Middle ring */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.4, 0.1, 0.4],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(${config.accentRgb},0.2) 0%, transparent 70%)`,
            }}
          />
          {/* Core orb */}
          <motion.div
            animate={{
              boxShadow: [
                `0 0 20px rgba(${config.accentRgb},0.4), 0 0 60px rgba(${config.accentRgb},0.15)`,
                `0 0 40px rgba(${config.accentRgb},0.7), 0 0 80px rgba(${config.accentRgb},0.3)`,
                `0 0 20px rgba(${config.accentRgb},0.4), 0 0 60px rgba(${config.accentRgb},0.15)`,
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 35% 35%, rgba(${config.accentRgb},0.9) 0%, rgba(${config.accentRgb},0.4) 50%, rgba(${config.accentRgb},0.1) 100%)`,
              border: `1px solid rgba(${config.accentRgb},0.4)`,
            }}
          >
            {/* Inner glow */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent 60%, rgba(${config.accentRgb},0.6) 100%)`,
              }}
            />
            <Zap
              size={28}
              style={{ color: "#fff", position: "relative", zIndex: 1 }}
            />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center"
        >
          <h1
            className="text-3xl font-black mb-2"
            style={{
              background: `linear-gradient(135deg, ${config.text} 0%, ${config.accent} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.03em",
            }}
          >
            ENOSX XAI
          </h1>
          <p
            className="text-sm"
            style={{ color: config.textMuted, letterSpacing: "0.08em" }}
          >
            COMMAND INTELLIGENCE · BUILT BY ENOSH
          </p>
        </motion.div>

        {/* Suggestion grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.07, duration: 0.4 }}
              whileHover={{
                scale: 1.02,
                boxShadow: `0 8px 24px rgba(${config.accentRgb},0.15)`,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestion(s.text)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200"
              style={{
                background: `rgba(${config.accentRgb}, 0.05)`,
                border: `1px solid rgba(${config.accentRgb}, 0.12)`,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: `rgba(${config.accentRgb}, 0.1)`,
                  border: `1px solid rgba(${config.accentRgb}, 0.2)`,
                }}
              >
                <s.icon size={13} style={{ color: config.accent }} />
              </div>
              <span
                className="text-xs leading-relaxed"
                style={{ color: config.textMuted }}
              >
                {s.text}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs text-center"
          style={{ color: config.textMuted, opacity: 0.5, letterSpacing: "0.04em" }}
        >
          ENOSX TECHNOLOGIES · PROPRIETARY SYSTEM
        </motion.p>
      </div>
    </div>
  );
}
