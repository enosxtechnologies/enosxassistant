/*
 * ENOSX XAI — AutoContextIndicator
 * Visual feedback for real-time app scanning.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Zap, RefreshCw, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { AutoContextData } from "@/hooks/useAutoContext";

interface AutoContextIndicatorProps {
  data: AutoContextData;
}

export default function AutoContextIndicator({ data }: AutoContextIndicatorProps) {
  const { config } = useTheme();

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="relative">
        {data.isScanning ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw size={12} className="text-cyan-400" />
          </motion.div>
        ) : (
          <CheckCircle2 size={12} className="text-green-400" />
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-[9px] font-bold tracking-widest uppercase opacity-40" style={{ color: config.text }}>
          {data.isScanning ? "Scanning Context" : "Context Ingested"}
        </span>
        <span className="text-[10px] font-medium" style={{ color: config.text }}>
          {data.appType.toUpperCase()} {data.isScanning ? "..." : "Active"}
        </span>
      </div>

      {data.isScanning && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 20 }}
          className="h-[1px] bg-cyan-400"
        />
      )}
    </div>
  );
}
