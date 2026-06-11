import React, { useState, useEffect } from "react";
import { BackgroundPicker } from "./BackgroundPicker";

interface GlobalLayoutProps {
  children: React.ReactNode;
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>("/lavender-field-optimized.webp");
  const [blurIntensity, setBlurIntensity] = useState(0);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  // Expose settings handler globally for Sidebar
  React.useEffect(() => {
    (window as any).__openBackgroundPicker = () => setShowBackgroundPicker(true);
  }, []);

  // Expose settings state and handler for Sidebar
  React.useEffect(() => {
    (window as any).__showBackgroundPicker = setShowBackgroundPicker;
  }, []);

  // Load saved preferences on mount
  useEffect(() => {
    const saved = localStorage.getItem("enosx-background-prefs");
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        setBackgroundUrl(prefs.uploaded || "/lavender-field-optimized.webp");
        setBlurIntensity(prefs.blur || 0);
      } catch (e) {
        // Use defaults
      }
    }
  }, []);

  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{
        backgroundImage: backgroundUrl ? `url('${backgroundUrl}')` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Blurred overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backdropFilter: `blur(${blurIntensity}px)`,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Main content with relative z-index */}
      <div className="relative z-10 w-full h-full" data-settings-handler={true}>{children}</div>

      {/* Background Picker Modal */}
      <BackgroundPicker
        isOpen={showBackgroundPicker}
        onClose={() => setShowBackgroundPicker(false)}
        onBackgroundChange={(bg) => {
          setBackgroundUrl(bg.url || null);
          setBlurIntensity(bg.blur);
        }}
      />
    </div>
  );
}
