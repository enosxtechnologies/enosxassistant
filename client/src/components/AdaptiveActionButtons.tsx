import { motion } from "framer-motion";
import { Bug, FileText, BookOpen, Terminal, Palette, Database } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useActiveWindow, type AppType } from "@/contexts/WindowContext";

interface AdaptiveActionButtonsProps {
  onActionClick: (action: string) => void;
}

export default function AdaptiveActionButtons({ onActionClick }: AdaptiveActionButtonsProps) {
  const { config } = useTheme();
  const { activeWindow } = useActiveWindow();

  if (!activeWindow.isDetected) return null;

  const actionMap: Partial<Record<AppType, { id: string; label: string; icon: React.ReactNode; color: string }[]>> = {
    vscode: [
      { id: "debug_code", label: "Debug", icon: <Bug size={14} />, color: "#ef4444" },
      { id: "refactor_code", label: "Refactor", icon: <FileText size={14} />, color: "#22c55e" },
    ],
    chrome: [
      { id: "summarize_page", label: "Summarize", icon: <BookOpen size={14} />, color: "#4285F4" },
      { id: "extract_info", label: "Extract Info", icon: <FileText size={14} />, color: "#fbbf24" },
    ],
    terminal: [
      { id: "explain_command", label: "Explain", icon: <Terminal size={14} />, color: "#00A4EF" },
    ],
    figma: [
      { id: "review_design", label: "Review", icon: <Palette size={14} />, color: "#F24E1E" },
    ],
    notion: [
      { id: "organize_notes", label: "Organize", icon: <Database size={14} />, color: "#888888" },
    ],
  };

  const actions = actionMap[activeWindow.appType] || [];

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {actions.map((action) => (
        <motion.button
          key={action.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onActionClick(action.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{
            background: `rgba(${config.accentRgb}, 0.1)`,
            border: `1px solid rgba(${config.accentRgb}, 0.2)`,
            color: action.color,
            backdropFilter: "blur(8px)",
          }}
        >
          {action.icon}
          {action.label}
        </motion.button>
      ))}
    </div>
  );
}
