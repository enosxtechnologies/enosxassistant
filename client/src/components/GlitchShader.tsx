/*
 * Glitch Shader Component
 * Experimental visual effect for Founder's Mode
 * Creates a "digital interference" effect during high-level processing
 */

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GlitchShaderProps {
  isActive: boolean;
  intensity?: number;
}

export default function GlitchShader({
  isActive,
  intensity = 1,
}: GlitchShaderProps) {
  const [glitchOffset, setGlitchOffset] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setGlitchOffset(Math.random() * 4 - 2);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      <style>{`
        @keyframes glitch-1 {
          0% { clip-path: polygon(0% 0%, 100% 0%, 100% 20%, 0% 20%); }
          20% { clip-path: polygon(0% 40%, 100% 40%, 100% 60%, 0% 60%); }
          40% { clip-path: polygon(0% 80%, 100% 80%, 100% 100%, 0% 100%); }
          60% { clip-path: polygon(0% 10%, 100% 10%, 100% 30%, 0% 30%); }
          80% { clip-path: polygon(0% 50%, 100% 50%, 100% 70%, 0% 70%); }
          100% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
        }

        @keyframes glitch-2 {
          0% { transform: translate(2px, -2px); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, 2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(1px, -1px); }
          100% { transform: translate(0, 0); }
        }

        .glitch-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          mix-blend-mode: screen;
          opacity: ${0.15 * intensity};
        }

        .glitch-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0, 242, 255, 0.5), transparent);
          animation: glitch-1 0.8s infinite;
        }

        .glitch-distortion {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9998;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 242, 255, 0.03),
            rgba(0, 242, 255, 0.03) 1px,
            transparent 1px,
            transparent 2px
          );
          animation: glitch-2 0.3s infinite;
          opacity: ${0.1 * intensity};
        }
      `}</style>

      <motion.div
        className="glitch-overlay"
        animate={{
          opacity: [0.1 * intensity, 0.2 * intensity, 0.1 * intensity],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="glitch-line"
            style={{
              top: `${Math.random() * 100}%`,
              animation: `glitch-1 ${0.6 + Math.random() * 0.4}s infinite`,
            }}
          />
        ))}
      </motion.div>

      <div className="glitch-distortion" />

      <motion.div
        className="fixed inset-0 pointer-events-none z-9997"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(0, 242, 255, 0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(255, 0, 127, 0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 20%, rgba(0, 242, 255, 0.05) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </>
  );
}
