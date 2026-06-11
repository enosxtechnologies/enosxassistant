/*
 * ENOSX AI — WelcomeScreen
 * Animated welcome with floating orb avatar
 * Features: breathing orb, staggered fade-in, glassmorphism cards
 */

import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useWallpaper } from "@/contexts/WallpaperContext";

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

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

        </motion.div>


      </div>
    </div>
  );
}
