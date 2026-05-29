/**
 * WallpaperPicker — Slide-in panel for customizing the background wallpaper,
 * blur amount, panel opacity, and wallpaper opacity.
 * Manus-style clean design with glassmorphism panels.
 */
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Image,
  Sliders,
  RotateCcw,
  Upload,
  Link,
  Check,
} from "lucide-react";
import { useWallpaper, WALLPAPER_PRESETS } from "@/contexts/WallpaperContext";
import { useTheme } from "@/contexts/ThemeContext";

interface WallpaperPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
  accentRgb,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  displayValue: string;
  accentRgb: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
          {label}
        </span>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-md"
          style={{
            background: `rgba(${accentRgb},0.12)`,
            color: `rgba(${accentRgb},0.9)`,
            border: `1px solid rgba(${accentRgb},0.2)`,
          }}
        >
          {displayValue}
        </span>
      </div>
      <div className="relative h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, rgba(${accentRgb},0.6), rgba(${accentRgb},1))`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function WallpaperPicker({ isOpen, onClose }: WallpaperPickerProps) {
  const { config } = useTheme();
  const {
    settings,
    setPreset,
    setCustomUrl,
    setBlurAmount,
    setPanelOpacity,
    setWallpaperOpacity,
    resetToDefaults,
  } = useWallpaper();

  const [tab, setTab] = useState<"wallpaper" | "effects">("wallpaper");
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (url) setCustomUrl(url);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setCustomUrl(urlInput.trim());
      setUrlInput("");
      setShowUrlInput(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width: 340,
              background: `rgba(12,12,16,${settings.panelOpacity})`,
              backdropFilter: `blur(${settings.blurAmount}px)`,
              WebkitBackdropFilter: `blur(${settings.blurAmount}px)`,
              borderLeft: `1px solid rgba(${config.accentRgb},0.15)`,
              boxShadow: `-8px 0 40px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `rgba(${config.accentRgb},0.15)` }}
                >
                  <Image size={14} style={{ color: config.accent }} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                    Appearance
                  </div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Wallpaper &amp; effects
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex gap-1 px-4 py-3 flex-shrink-0"
              style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}
            >
              {(["wallpaper", "effects"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                  style={{
                    background: tab === t ? `rgba(${config.accentRgb},0.15)` : "transparent",
                    color: tab === t ? config.accent : "rgba(255,255,255,0.4)",
                    border: tab === t ? `1px solid rgba(${config.accentRgb},0.25)` : "1px solid transparent",
                  }}
                >
                  {t === "wallpaper" ? <Image size={12} /> : <Sliders size={12} />}
                  {t}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {tab === "wallpaper" && (
                <>
                  {/* Upload / URL buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all hover:bg-white/10"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      <Upload size={12} />
                      Upload Image
                    </button>
                    <button
                      onClick={() => setShowUrlInput((v) => !v)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all hover:bg-white/10"
                      style={{
                        background: showUrlInput ? `rgba(${config.accentRgb},0.1)` : "rgba(255,255,255,0.05)",
                        border: showUrlInput ? `1px solid rgba(${config.accentRgb},0.25)` : "1px solid rgba(255,255,255,0.1)",
                        color: showUrlInput ? config.accent : "rgba(255,255,255,0.7)",
                      }}
                    >
                      <Link size={12} />
                      Paste URL
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* URL input */}
                  <AnimatePresence>
                    {showUrlInput && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: `1px solid rgba(${config.accentRgb},0.2)`,
                              color: "rgba(255,255,255,0.9)",
                            }}
                          />
                          <button
                            onClick={handleUrlSubmit}
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `rgba(${config.accentRgb},0.2)`,
                              color: config.accent,
                            }}
                          >
                            <Check size={13} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Preset grid */}
                  <div>
                    <div className="text-xs font-medium mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                      PRESETS
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {WALLPAPER_PRESETS.map((preset) => {
                        const isActive = settings.activePresetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => setPreset(preset.id)}
                            className="relative rounded-xl overflow-hidden transition-all"
                            style={{
                              aspectRatio: "16/10",
                              border: isActive
                                ? `2px solid ${config.accent}`
                                : "2px solid rgba(255,255,255,0.08)",
                              boxShadow: isActive ? `0 0 12px rgba(${config.accentRgb},0.4)` : "none",
                            }}
                          >
                            {preset.id === "none" ? (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.04)" }}
                              >
                                <X size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                              </div>
                            ) : (
                              <img
                                src={preset.thumbnail}
                                alt={preset.label}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            )}
                            {isActive && (
                              <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ background: `rgba(${config.accentRgb},0.25)` }}
                              >
                                <Check size={14} style={{ color: "#fff" }} />
                              </div>
                            )}
                            <div
                              className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-center"
                              style={{
                                background: "rgba(0,0,0,0.55)",
                                fontSize: "9px",
                                color: "rgba(255,255,255,0.8)",
                                letterSpacing: "0.03em",
                              }}
                            >
                              {preset.label}
                            </div>
                          </button>
                        );
                      })}

                      {/* Custom preset tile */}
                      {settings.activePresetId === "custom" && settings.customUrl && (
                        <button
                          className="relative rounded-xl overflow-hidden transition-all"
                          style={{
                            aspectRatio: "16/10",
                            border: `2px solid ${config.accent}`,
                            boxShadow: `0 0 12px rgba(${config.accentRgb},0.4)`,
                          }}
                        >
                          <img
                            src={settings.customUrl}
                            alt="Custom"
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ background: `rgba(${config.accentRgb},0.25)` }}
                          >
                            <Check size={14} style={{ color: "#fff" }} />
                          </div>
                          <div
                            className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-center"
                            style={{
                              background: "rgba(0,0,0,0.55)",
                              fontSize: "9px",
                              color: "rgba(255,255,255,0.8)",
                            }}
                          >
                            Custom
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {tab === "effects" && (
                <div className="space-y-6">
                  <div
                    className="p-3 rounded-xl text-xs"
                    style={{
                      background: `rgba(${config.accentRgb},0.06)`,
                      border: `1px solid rgba(${config.accentRgb},0.12)`,
                      color: "rgba(255,255,255,0.45)",
                      lineHeight: 1.6,
                    }}
                  >
                    Adjust the visual effects applied to panels and the background wallpaper.
                  </div>

                  <Slider
                    label="Backdrop Blur"
                    value={settings.blurAmount}
                    min={0}
                    max={40}
                    step={1}
                    onChange={setBlurAmount}
                    displayValue={`${settings.blurAmount}px`}
                    accentRgb={config.accentRgb}
                  />

                  <Slider
                    label="Panel Transparency"
                    value={settings.panelOpacity}
                    min={0.1}
                    max={1}
                    step={0.01}
                    onChange={setPanelOpacity}
                    displayValue={`${Math.round(settings.panelOpacity * 100)}%`}
                    accentRgb={config.accentRgb}
                  />

                  <Slider
                    label="Wallpaper Brightness"
                    value={settings.wallpaperOpacity}
                    min={0.1}
                    max={1}
                    step={0.01}
                    onChange={setWallpaperOpacity}
                    displayValue={`${Math.round(settings.wallpaperOpacity * 100)}%`}
                    accentRgb={config.accentRgb}
                  />

                  {/* Preview card */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                      PREVIEW
                    </div>
                    <div
                      className="rounded-xl p-4 text-xs"
                      style={{
                        background: `rgba(12,12,16,${settings.panelOpacity})`,
                        backdropFilter: `blur(${settings.blurAmount}px)`,
                        WebkitBackdropFilter: `blur(${settings.blurAmount}px)`,
                        border: `1px solid rgba(${config.accentRgb},0.15)`,
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      <div className="font-semibold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>
                        Panel Preview
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.5)" }}>
                        This is how your panels will look with the current settings.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderTop: `1px solid rgba(255,255,255,0.06)` }}
            >
              <button
                onClick={resetToDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <RotateCcw size={11} />
                Reset
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: `rgba(${config.accentRgb},0.15)`,
                  border: `1px solid rgba(${config.accentRgb},0.3)`,
                  color: config.accent,
                }}
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
