/**
 * Neo-Glass Corporate Ritualism launch splash.
 * Design reminder: keep the opening page cinematic, low-key, and ceremonial; the EX mark is a glowing glass object, while the “from Enosx Technologies” line is the human handwritten maker signature.
 */

import { motion } from "framer-motion";

const EX_LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663607664316/2uPer27yLAeEX6GEKFYHir/ex-glass-logo-wide-5A34YpjqXNUDGUwKtW47vj.webp";

interface LaunchSplashProps {
  onComplete: () => void;
}

export default function LaunchSplash({ onComplete }: LaunchSplashProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#02040a] text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.015, filter: "blur(10px)" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={(definition) => {
        if (definition && typeof definition === "object" && "opacity" in definition) {
          return;
        }
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Montserrat:wght@300;400;500;700&family=Parisienne&display=swap');

        .ex-launch-grain {
          background-image:
            radial-gradient(circle at 20% 20%, rgba(68, 183, 255, 0.13), transparent 28%),
            radial-gradient(circle at 78% 72%, rgba(0, 105, 255, 0.16), transparent 34%),
            radial-gradient(circle at 50% 52%, rgba(255, 255, 255, 0.08), transparent 22%),
            linear-gradient(135deg, rgba(0,0,0,0.85), rgba(2,7,18,0.94));
        }

        .ex-launch-grain::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.23;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E");
          mix-blend-mode: screen;
        }

        .ex-launch-logo {
          filter: drop-shadow(0 0 28px rgba(80, 196, 255, 0.55)) drop-shadow(0 0 94px rgba(43, 130, 255, 0.34));
        }

        .ex-launch-signature {
          font-family: 'Parisienne', cursive;
          text-shadow: 0 0 22px rgba(255, 255, 255, 0.22), 0 0 42px rgba(72, 189, 255, 0.14);
        }

        .ex-launch-technical {
          font-family: 'Montserrat', system-ui, sans-serif;
          letter-spacing: 0.34em;
        }

        .ex-launch-display {
          font-family: 'Cinzel', Georgia, serif;
          letter-spacing: 0.22em;
        }
      `}</style>

      <div className="ex-launch-grain absolute inset-0" />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/10"
        initial={{ opacity: 0, rotate: 0, scale: 0.82 }}
        animate={{ opacity: [0, 0.72, 0.4], rotate: 360, scale: 1 }}
        transition={{ duration: 5.4, ease: "linear" }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[25rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-sky-300/10"
        initial={{ opacity: 0, rotate: -10, scale: 0.7 }}
        animate={{ opacity: [0, 0.85, 0.35], rotate: 8, scale: 1 }}
        transition={{ duration: 3.8, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="ex-launch-technical text-[10px] uppercase text-cyan-100/50 md:text-xs">
            Enosx Intelligent Systems
          </p>
        </motion.div>

        <motion.div
          className="relative w-full max-w-[42rem]"
          initial={{ opacity: 0, y: 26, scale: 0.92, filter: "blur(18px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.55, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="absolute -inset-10 rounded-[44%] bg-cyan-400/10 blur-3xl"
            animate={{ opacity: [0.28, 0.62, 0.28], scale: [0.96, 1.05, 0.96] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img
            src={EX_LOGO_URL}
            alt="Glowing glass EX logo"
            className="ex-launch-logo relative mx-auto block w-full select-none object-contain"
            draggable={false}
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.div
          className="mt-2 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="ex-launch-display text-xs uppercase text-white/55 md:text-sm">
            XAI Assistant
          </p>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-center md:bottom-14"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto mb-3 h-px w-28 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <p className="ex-launch-signature whitespace-nowrap text-3xl text-white/72 md:text-4xl">
          from Enosx Technologies
        </p>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 1, 0.25] }}
        transition={{ duration: 3.15, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={onComplete}
      />
    </motion.div>
  );
}
