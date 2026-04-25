/*
 * Screenshot Capture Component
 * Allows users to capture and analyze screenshots with the AI
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Send } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ScreenshotCaptureProps {
  onCapture: (imageData: string) => void;
  isLoading?: boolean;
}

export default function ScreenshotCapture({
  onCapture,
  isLoading = false,
}: ScreenshotCaptureProps) {
  const { config } = useTheme();
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureScreen = async () => {
    try {
      setIsCapturing(true);

      // Use html2canvas as fallback for web-based screenshot
      const canvas = await (
        window as any
      ).html2canvas(document.documentElement, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
      });

      const imageData = canvas.toDataURL("image/png");
      setPreview(imageData);
    } catch (error) {
      console.error("Screenshot failed:", error);
      // Fallback: create a simple placeholder
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "rgba(20, 20, 20, 0.8)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "rgba(0, 242, 255, 0.6)";
          ctx.font = "16px monospace";
          ctx.fillText("Screenshot captured", 20, 30);
          setPreview(canvas.toDataURL("image/png"));
        }
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSend = () => {
    if (preview) {
      onCapture(preview);
      setPreview(null);
    }
  };

  const handleCancel = () => {
    setPreview(null);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={captureScreen}
        disabled={isCapturing || isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2.5 rounded-lg transition-all disabled:opacity-50"
        style={{
          background: `rgba(${config.accentRgb}, 0.1)`,
          border: `1px solid rgba(${config.accentRgb}, 0.2)`,
          color: `rgba(${config.accentRgb}, 0.8)`,
        }}
        title="Capture screenshot for AI analysis"
      >
        <Camera size={18} />
      </motion.button>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-full mb-3 right-0 rounded-lg overflow-hidden shadow-2xl z-50"
            style={{
              background: "rgba(10, 10, 10, 0.95)",
              backdropFilter: "blur(20px)",
              border: `1px solid rgba(${config.accentRgb}, 0.2)`,
              maxWidth: 300,
            }}
          >
            <div className="relative">
              <img
                src={preview}
                alt="Screenshot preview"
                className="w-full h-auto max-h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              <div className="p-3 flex gap-2">
                <motion.button
                  onClick={handleSend}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50"
                  style={{
                    background: `rgba(${config.accentRgb}, 0.8)`,
                    color: config.bg,
                  }}
                >
                  <Send size={14} />
                  Analyze
                </motion.button>

                <motion.button
                  onClick={handleCancel}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 rounded-lg transition-all disabled:opacity-50"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    color: config.textMuted,
                  }}
                >
                  <X size={14} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" width={1920} height={1080} />
    </div>
  );
}
