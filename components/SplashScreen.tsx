'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export default function SplashScreen({ onComplete, duration = 3500 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 80);
    const t2 = setTimeout(() => setPhase('exit'), duration - 800);
    const t3 = setTimeout(() => { onComplete?.(); }, duration);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [duration, onComplete]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Inter:wght@200;300;400;700&display=swap');

        /* ── Container ── */
        .sx-splash {
          position: fixed; inset: 0; z-index: 99999;
          background: #05050e;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          overflow: hidden;
          transition: opacity 0.85s cubic-bezier(0.4,0,0.2,1);
        }
        .sx-splash.enter { opacity: 0; }
        .sx-splash.show  { opacity: 1; }
        .sx-splash.exit  { opacity: 0; }

        /* ── Ambient background orbs ── */
        .sx-orb {
          position: absolute; border-radius: 50%;
          filter: blur(90px); pointer-events: none;
        }
        .sx-orb1 {
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(14,165,233,0.18), transparent 70%);
          top: -140px; left: -120px;
          animation: sxFloat 7s ease-in-out infinite;
        }
        .sx-orb2 {
          width: 360px; height: 360px;
          background: radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%);
          bottom: -100px; right: -80px;
          animation: sxFloat 7s ease-in-out infinite -3.5s;
        }
        .sx-orb3 {
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(34,211,238,0.12), transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%,-50%);
          animation: sxFloat 5s ease-in-out infinite -1.5s;
        }
        @keyframes sxFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-22px) scale(1.04); }
        }

        /* ── Logo wrapper ── */
        .sx-logo-wrap {
          position: relative;
          margin-bottom: 44px;
          animation: sxPop 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.15s both;
        }
        @keyframes sxPop {
          from { opacity:0; transform:scale(0.45); }
          to   { opacity:1; transform:scale(1); }
        }

        /* Pulse rings */
        .sx-ring {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(56,189,248,0.22);
          animation: sxRing 2.8s ease-in-out infinite;
        }
        .sx-ring1 { inset:-22px; animation-delay:0s; }
        .sx-ring2 { inset:-40px; animation-delay:0.45s; }
        .sx-ring3 { inset:-60px; animation-delay:0.9s; border-color:rgba(99,102,241,0.12); }
        @keyframes sxRing {
          0%,100% { opacity:0.25; transform:scale(1); }
          50%     { opacity:0.75; transform:scale(1.04); }
        }

        /* Glass disc */
        .sx-glass {
          width: 168px; height: 168px; border-radius: 50%;
          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.07) 0%,
            rgba(255,255,255,0.02) 60%,
            rgba(0,0,0,0.12) 100%
          );
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          position: relative;
          box-shadow:
            0 0 0 1px rgba(56,189,248,0.1),
            0 0 45px rgba(56,189,248,0.18),
            0 0 90px rgba(56,189,248,0.09),
            0 25px 60px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.14),
            inset 0 -1px 0 rgba(0,0,0,0.25);
          animation: sxGlow 3.2s ease-in-out infinite;
        }
        @keyframes sxGlow {
          0%,100% {
            box-shadow:
              0 0 0 1px rgba(56,189,248,0.10),
              0 0 45px rgba(56,189,248,0.18),
              0 0 90px rgba(56,189,248,0.09),
              0 25px 60px rgba(0,0,0,0.55),
              inset 0 1px 0 rgba(255,255,255,0.14);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(56,189,248,0.22),
              0 0 65px rgba(56,189,248,0.32),
              0 0 130px rgba(56,189,248,0.16),
              0 0 200px rgba(99,102,241,0.10),
              0 25px 60px rgba(0,0,0,0.55),
              inset 0 1px 0 rgba(255,255,255,0.20);
          }
        }

        /* Specular highlight inside glass */
        .sx-glass::before {
          content:'';
          position:absolute; top:10px; left:18px; right:18px; height:38%;
          background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 100%);
          border-radius: 50% 50% 0 0;
        }

        /* EX lettering */
        .sx-ex {
          font-family:'Inter',sans-serif;
          font-weight:700;
          font-size:58px;
          letter-spacing:-3px;
          line-height:1;
          background: linear-gradient(135deg,
            #e0f2fe 0%,
            #38bdf8 35%,
            #818cf8 70%,
            #c7d2fe 100%
          );
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
          filter:
            drop-shadow(0 0 18px rgba(56,189,248,0.65))
            drop-shadow(0 0 36px rgba(56,189,248,0.30));
          animation: sxTextPulse 3.2s ease-in-out infinite;
          position: relative; z-index:1;
        }
        @keyframes sxTextPulse {
          0%,100% {
            filter:
              drop-shadow(0 0 14px rgba(56,189,248,0.55))
              drop-shadow(0 0 28px rgba(56,189,248,0.22));
          }
          50% {
            filter:
              drop-shadow(0 0 28px rgba(56,189,248,0.95))
              drop-shadow(0 0 56px rgba(56,189,248,0.50))
              drop-shadow(0 0 90px rgba(99,102,241,0.35));
          }
        }

        /* ── Product label ── */
        .sx-name {
          font-family:'Inter',sans-serif; font-weight:200;
          font-size:20px; letter-spacing:10px;
          color:rgba(255,255,255,0.82);
          text-transform:uppercase;
          animation: sxUp 1s ease 0.55s both;
          margin-bottom:8px;
        }
        .sx-tagline {
          font-family:'Inter',sans-serif; font-weight:300;
          font-size:12px; letter-spacing:4px;
          color:rgba(56,189,248,0.55);
          text-transform:uppercase;
          animation: sxUp 1s ease 0.75s both;
        }
        @keyframes sxUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── Loading dots ── */
        .sx-dots {
          display:flex; gap:7px;
          margin-top:52px;
          animation: sxUp 1s ease 1s both;
        }
        .sx-dot {
          width:5px; height:5px; border-radius:50%;
          background:rgba(56,189,248,0.55);
          animation: sxBounce 1.3s ease-in-out infinite;
        }
        .sx-dot:nth-child(2){ animation-delay:0.15s; }
        .sx-dot:nth-child(3){ animation-delay:0.30s; }
        @keyframes sxBounce {
          0%,100% { opacity:0.28; transform:scale(0.75); }
          50%     { opacity:1;    transform:scale(1.25); background:rgba(99,102,241,0.9); }
        }

        /* ── Signature ── */
        .sx-sig-wrap {
          position:absolute; bottom:48px;
          left:50%; transform:translateX(-50%);
          text-align:center;
          animation: sxUp 1.2s ease 1.15s both;
          white-space:nowrap;
        }
        .sx-sig-line {
          width:72px; height:1px; margin:0 auto 12px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
        }
        .sx-sig-text {
          font-family:'Dancing Script',cursive;
          font-size:21px; font-weight:700;
          color:rgba(255,255,255,0.48);
          letter-spacing:0.3px;
        }
      `}</style>

      <div className={`sx-splash ${phase}`}>
        {/* Ambient orbs */}
        <div className="sx-orb sx-orb1" />
        <div className="sx-orb sx-orb2" />
        <div className="sx-orb sx-orb3" />

        {/* Glass EX logo */}
        <div className="sx-logo-wrap">
          <div className="sx-ring sx-ring1" />
          <div className="sx-ring sx-ring2" />
          <div className="sx-ring sx-ring3" />
          <div className="sx-glass">
            <span className="sx-ex">EX</span>
          </div>
        </div>

        {/* Product identity */}
        <div className="sx-name">Enosx AI</div>
        <div className="sx-tagline">Advanced Windows Assistant</div>

        {/* Loader dots */}
        <div className="sx-dots">
          <div className="sx-dot" />
          <div className="sx-dot" />
          <div className="sx-dot" />
        </div>

        {/* Signature */}
        <div className="sx-sig-wrap">
          <div className="sx-sig-line" />
          <span className="sx-sig-text">from Enosx Technologies</span>
        </div>
      </div>
    </>
  );
}
