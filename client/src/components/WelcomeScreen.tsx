/*
 * ENOSX AI — WelcomeScreen
 * Animated welcome with floating orb avatar, suggestion chips
 * Features: breathing orb, staggered fade-in, glassmorphism cards
 */

import { motion } from "framer-motion";
import { Zap, Code, Globe, Brain, Cpu, Sparkles } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useWallpaper } from "@/contexts/WallpaperContext";

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
  const { settings: wallpaperSettings } = useWallpaper();

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
      <div className="max-w-2xl w-full flex flex-col items-center gap-8">
        {/* Glass EX Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-24 h-24 mb-4 flex items-center justify-center rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(124,111,247,0.3)] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <span className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            EX
          </span>
          <motion.div
            animate={{ left: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center"
        >
          <h2
            className="text-4xl font-semibold tracking-tight mb-3"
            style={{ color: config.text }}
          >
            What can I help with?
          </h2>
          <p
            className="text-base opacity-50 max-w-lg mx-auto leading-relaxed"
            style={{ color: config.textMuted }}
          >
            Ask me anything — I can see your Windows screen, open apps, write code, manage files, and more.
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
                background: `rgba(12,12,16,${wallpaperSettings.panelOpacity * 0.6})`,
                border: `1px solid rgba(${config.accentRgb}, 0.12)`,
                backdropFilter: `blur(${wallpaperSettings.blurAmount}px)`,
                WebkitBackdropFilter: `blur(${wallpaperSettings.blurAmount}px)`,
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

        {/* Footer Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col items-center gap-1"
        >
          <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold">from</span>
          <span 
            className="text-2xl text-white/60"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Enosx Technologies
          </span>
        </motion.div>
      </div>
    </div>
  );
}
