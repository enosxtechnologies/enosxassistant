import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ClipboardNotificationProps {
  clipboardData: string | null;
  onSummarize: (text: string) => void;
  onDismiss: () => void;
}

export default function ClipboardNotification({ clipboardData, onSummarize, onDismiss }: ClipboardNotificationProps) {
  const { config } = useTheme();

  return (
    <AnimatePresence>
      {clipboardData && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 right-6 z-50 flex items-center gap-3 p-3 rounded-xl border"
          style={{
            background: "rgba(10, 10, 10, 0.8)",
            backdropFilter: "blur(12px)",
            borderColor: `rgba(${config.accentRgb}, 0.3)`,
            boxShadow: `0 0 20px rgba(${config.accentRgb}, 0.2)`,
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Copied Text Detected</span>
              <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{clipboardData}</span>
            </div>
          </div>
          <button
            onClick={() => onSummarize(clipboardData)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white text-black hover:bg-gray-200 transition-colors"
          >
            SUMMARIZE
          </button>
          <button onClick={onDismiss} className="p-1 text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
