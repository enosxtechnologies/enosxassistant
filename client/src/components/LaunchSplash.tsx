/**
 * Neo-Glass Corporate Ritualism launch splash.
 * Design reminder: keep the opening page cinematic, low-key, and ceremonial; the EX mark is a glowing glass object, while the “from Enosx Technologies” line is the human handwritten maker signature.
 */

import { motion } from "framer-motion";

const EX_LOGO_URL = "/hacking_mentor_splash.png";

const GLITCH_OVERLAY = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E";

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
            radial-gradient(circle at 20% 20%, rgba(0, 242, 255, 0.1), transparent 28%),
            radial-gradient(circle at 78% 72%, rgba(0, 242, 255, 0.12), transparent 34%),
            radial-gradient(circle at 50% 52%, rgba(0, 242, 255, 0.05), transparent 22%),
            linear-gradient(135deg, #02040a, #050a14);
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
          filter: drop-shadow(0 0 15px rgba(0, 242, 255, 0.2));
          border-radius: 24px;
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
          <motion.p 
            className="mt-1 text-[8px] font-mono text-cyan-400/40 uppercase tracking-[0.5em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5] }}
            transition={{ duration: 2, delay: 0.5 }}
          >
            Securing the Digital Frontier
          </motion.p>
        </motion.div>

        <motion.div
          className="relative w-full max-w-[50rem]"
          initial={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="absolute -inset-4 rounded-3xl bg-cyan-400/5 blur-2xl"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img
            src={EX_LOGO_URL}
            alt="ENOSX Ethical Hacking Mentor Splash"
            className="ex-launch-logo relative mx-auto block w-full select-none object-cover shadow-2xl border border-cyan-400/10"
            draggable={false}
          />
        </motion.div>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col items-center gap-2">
            <p className="ex-launch-display text-[10px] uppercase text-cyan-400/40 tracking-[0.6em]">
              System Status: Optimal
            </p>
            <motion.div 
              className="flex justify-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <div className="h-1 w-8 rounded-full bg-cyan-400/20 overflow-hidden">
                <motion.div 
                  className="h-full bg-cyan-400"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
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
