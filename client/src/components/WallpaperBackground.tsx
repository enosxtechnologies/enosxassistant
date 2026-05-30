/**
 * WallpaperBackground — Renders animated spaceship wallpaper
 * with high-definition starfield and floating spaceships
 */
import { useWallpaper } from "@/contexts/WallpaperContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useRef } from "react";

export default function WallpaperBackground() {
  const { settings } = useWallpaper();
  const { config } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create stars
    const stars: { x: number; y: number; radius: number; opacity: number }[] = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }

    // Create spaceships
    const spaceships: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      angle: number;
      size: number;
    }[] = [];
    for (let i = 0; i < 5; i++) {
      spaceships.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        angle: Math.random() * Math.PI * 2,
        size: 20 + Math.random() * 15,
      });
    }

    const animate = () => {
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0a0a0e");
      gradient.addColorStop(0.5, "#121218");
      gradient.addColorStop(1, "#0f0f14");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Twinkle effect
        star.opacity += (Math.random() - 0.5) * 0.05;
        star.opacity = Math.max(0.1, Math.min(0.9, star.opacity));
      });

      // Draw and update spaceships
      spaceships.forEach((ship) => {
        // Update position
        ship.x += ship.vx;
        ship.y += ship.vy;
        ship.angle += 0.01;

        // Wrap around screen
        if (ship.x > canvas.width + 50) ship.x = -50;
        if (ship.x < -50) ship.x = canvas.width + 50;
        if (ship.y > canvas.height + 50) ship.y = -50;
        if (ship.y < -50) ship.y = canvas.height + 50;

        // Draw spaceship
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);

        // Ship body
        ctx.fillStyle = `rgba(100, 200, 255, 0.7)`;
        ctx.beginPath();
        ctx.moveTo(0, -ship.size / 2);
        ctx.lineTo(ship.size / 3, ship.size / 2);
        ctx.lineTo(0, ship.size / 3);
        ctx.lineTo(-ship.size / 3, ship.size / 2);
        ctx.closePath();
        ctx.fill();

        // Ship glow
        ctx.strokeStyle = `rgba(100, 200, 255, 0.4)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Engine glow
        ctx.fillStyle = `rgba(255, 150, 0, 0.8)`;
        ctx.beginPath();
        ctx.ellipse(0, ship.size / 2 + 5, ship.size / 6, ship.size / 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      {/* Canvas for animated spaceships */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: settings.wallpaperOpacity,
        }}
      />

      {/* Subtle color tint overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 70% 20%, rgba(100, 200, 255, 0.08) 0%, transparent 60%),
                       radial-gradient(ellipse at 20% 80%, rgba(255, 100, 200, 0.06) 0%, transparent 50%)`,
        }}
      />

      {/* Bottom fade for readability */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background: `linear-gradient(to top, #0a0a0e99, transparent)`,
        }}
      />
    </div>
  );
}
