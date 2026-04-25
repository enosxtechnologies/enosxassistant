/*
 * ENOSX XAI — CommandBar
 * Floating pill command bar with voice visualization, micro-interactions
 * Features: auto-resize textarea, voice input, animated send button, glassmorphism
 *
 * Voice interaction now uses the "Pulse" orb overlay:
 *   Cyan/Blue  → Listening
 *   Purple/Pink → Processing
 *   White Sparkle → Completed
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Square, Loader2 } from "lucide-react";
import { VoiceState } from "@/lib/types";
import { useTheme } from "@/contexts/ThemeContext";
import VoiceVisualizer from "./VoiceVisualizer";
import PulseOrb from "./PulseOrb";
import ScreenshotCapture from "./ScreenshotCapture";

interface CommandBarProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  voiceState: VoiceState;
  transcript: string;
  isVoiceSupported: boolean;
  onStartVoice: () => void;
  onStopVoice: () => void;
  onStopSpeaking: () => void;
  onScreenshot?: (imageData: string) => void;
  disabled?: boolean;
}

export default function CommandBar({
  onSend,
  isLoading,
  voiceState,
  transcript,
  isVoiceSupported,
  onStartVoice,
  onStopVoice,
  onStopSpeaking,
  onScreenshot,
  disabled = false,
}: CommandBarProps) {
  const { config } = useTheme();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isListening = voiceState === "listening";
  const isSpeaking = voiceState === "speaking";
  const isProcessing = voiceState === "processing";
  const voiceActive = isListening || isSpeaking || isProcessing;

  // Sync transcript to input
  useEffect(() => {
    if (transcript) {
      setValue(transcript);
    }
  }, [transcript]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, [value]);

  const handleSend = useCallback(() => {
    const text = value.trim();
    if (!text || disabled || isLoading) return;
    onSend(text);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, isLoading, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceClick = () => {
    if (isSpeaking) {
      onStopSpeaking();
    } else if (isListening) {
      onStopVoice();
    } else {
      onStartVoice();
    }
  };

  const canSend = value.trim().length > 0 && !disabled && !isLoading;

  return (
    <>
      {/* ── Pulse Orb full-screen overlay (voice active) ── */}
      <AnimatePresence>
        {voiceActive && (
          <motion.div
            key="pulse-orb-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            style={{
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
            // Clicking the backdrop stops voice
            onClick={voiceActive ? handleVoiceClick : undefined}
          >
            {/* Stop-click hint */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute top-8 text-xs text-white"
              style={{ letterSpacing: "0.08em" }}
            >
              Tap anywhere to stop
            </motion.p>

            {/* The morphing sphere */}
            <PulseOrb
              voiceState={voiceState}
              isLoading={isLoading}
              size={220}
              onClick={handleVoiceClick}
            />

            {/* Compact frequency bar below the orb */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 w-72 h-12"
              onClick={(e) => e.stopPropagation()}
            >
              <VoiceVisualizer
                isActive={voiceActive}
                isListening={isListening}
                color={isListening ? "#00f2ff" : isProcessing ? "#a855f7" : "#c084fc"}
                accentRgb={
                  isListening ? "0,242,255" : isProcessing ? "168,85,247" : "192,132,252"
                }
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main command bar ── */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          {/* Main input container */}
          <motion.div
            animate={
              isListening
                ? {
                    boxShadow: [
                      `0 0 0 0 rgba(0,242,255, 0)`,
                      `0 0 0 3px rgba(0,242,255, 0.35)`,
                      `0 0 0 0 rgba(0,242,255, 0)`,
                    ],
                  }
                : {
                    boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
                  }
            }
            transition={
              isListening
                ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 }
            }
            className="flex items-end gap-2 rounded-2xl px-4 py-3"
            style={{
              background: config.surface,
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: `1px solid rgba(${config.accentRgb}, ${isListening ? "0.4" : "0.15"})`,
              transition: "border-color 0.3s ease",
            }}
          >
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? "Listening..."
                  : isSpeaking
                  ? "Speaking..."
                  : "Ask ENOSX AI anything..."
              }
              rows={1}
              disabled={disabled && !isListening}
              className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
              style={{
                color: config.text,
                caretColor: config.accent,
                maxHeight: 140,
                fontFamily: "inherit",
              }}
            />

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
              {/* Screenshot button */}
              {onScreenshot && (
                <ScreenshotCapture
                  onCapture={onScreenshot}
                  isLoading={isLoading}
                />
              )}

              {/* Voice button */}
              {isVoiceSupported && (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleVoiceClick}
                  className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={
                    isListening || isSpeaking
                      ? {
                          background: `rgba(${config.accentRgb}, 0.2)`,
                          border: `1px solid rgba(${config.accentRgb}, 0.4)`,
                          color: config.accent,
                        }
                      : {
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: config.textMuted,
                        }
                  }
                  title={isListening ? "Stop listening" : isSpeaking ? "Stop speaking" : "Voice input"}
                >
                  {/* Pulse ring when listening */}
                  {isListening && (
                    <motion.div
                      animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-xl"
                      style={{ border: `2px solid rgba(0,242,255, 0.5)` }}
                    />
                  )}
                  {isSpeaking ? (
                    <Square size={12} />
                  ) : isListening ? (
                    <MicOff size={13} />
                  ) : (
                    <Mic size={13} />
                  )}
                </motion.button>
              )}

              {/* Send button */}
              <motion.button
                whileHover={canSend ? { scale: 1.08 } : {}}
                whileTap={canSend ? { scale: 0.92 } : {}}
                onClick={handleSend}
                disabled={!canSend}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                style={
                  canSend
                    ? {
                        background: `rgba(${config.accentRgb}, 0.85)`,
                        border: `1px solid rgba(${config.accentRgb}, 0.6)`,
                        color: "#fff",
                        boxShadow: `0 4px 12px rgba(${config.accentRgb}, 0.3)`,
                      }
                    : isLoading
                    ? {
                        background: `rgba(${config.accentRgb}, 0.12)`,
                        border: `1px solid rgba(${config.accentRgb}, 0.2)`,
                        color: config.accent,
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: config.textMuted,
                        cursor: "not-allowed",
                      }
                }
                title="Send"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 size={13} />
                  </motion.div>
                ) : (
                  <Send size={13} />
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Hint text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-1.5"
            style={{ color: config.textMuted, fontSize: "10px", letterSpacing: "0.04em" }}
          >
            {isListening
              ? "Speak now — tap orb or mic to stop"
              : "Enter to send · Shift+Enter for new line"}
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
