import React, { useState, useEffect } from "react";
import { BackgroundPicker } from "./BackgroundPicker";

interface GlobalLayoutProps {
  children: React.ReactNode;
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>("/lavender-field-optimized.webp");
  const [isLoaded, setIsLoaded] = useState(false);
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

  useEffect(() => {
    if (backgroundUrl) {
      const img = new Image();
      img.src = backgroundUrl;
      img.onload = () => setIsLoaded(true);
    }
  }, [backgroundUrl]);

  return (
    <div
      className="w-screen h-dvh overflow-hidden relative"
      style={{
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* Tiny placeholder for instant load */}
      {backgroundUrl === "/lavender-field-optimized.webp" && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/lavender-field-tiny.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(20px)",
          }}
        />
      )}

      {/* Main high-res wallpaper */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: backgroundUrl ? `url('${backgroundUrl}')` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />
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
