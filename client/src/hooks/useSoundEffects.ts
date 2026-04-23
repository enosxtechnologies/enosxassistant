/*
 * Assistant — useSoundEffects
 * Subtle UI sound effects using Web Audio API
 * Sounds: click, send, receive, listen-start, listen-stop, godMode
 */

import { useCallback, useRef } from "react";

type SoundType = "click" | "send" | "receive" | "listenStart" | "listenStop" | "error" | "godMode";

function createAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gainVal = 0.08,
  fadeOut = true,
  startTime?: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = startTime ?? ctx.currentTime;
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(gainVal, start);
  
  if (fadeOut) {
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  }
  
  osc.start(start);
  osc.stop(start + duration);
}

export function useSoundEffects() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  function getCtx(): AudioContext | null {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext();
    }
    if (ctxRef.current?.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  const play = useCallback((sound: SoundType) => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;

    try {
      switch (sound) {
        case "click":
          playTone(ctx, 800, 0.08, "sine", 0.05);
          break;

        case "send":
          playTone(ctx, 440, 0.12, "sine", 0.07);
          setTimeout(() => playTone(ctx, 660, 0.1, "sine", 0.05), 80);
          break;

        case "receive":
          playTone(ctx, 880, 0.18, "sine", 0.06);
          setTimeout(() => playTone(ctx, 1100, 0.15, "sine", 0.04), 100);
          break;

        case "listenStart":
          playTone(ctx, 600, 0.15, "sine", 0.08);
          setTimeout(() => playTone(ctx, 900, 0.12, "sine", 0.06), 100);
          break;

        case "listenStop":
          playTone(ctx, 900, 0.12, "sine", 0.06);
          setTimeout(() => playTone(ctx, 600, 0.15, "sine", 0.05), 80);
          break;

        case "error":
          playTone(ctx, 200, 0.2, "sawtooth", 0.04);
          break;

        case "godMode":
          // EPIC 2-SECOND SEQUENCE
          const now = ctx.currentTime;
          
          // 1. Deep cinematic impact (0s - 1.5s)
          playTone(ctx, 50, 1.5, "sine", 0.2, true, now);
          playTone(ctx, 100, 1.2, "sine", 0.1, true, now);
          
          // 2. Rising digital power-up sweep (0s - 1.2s)
          for (let i = 0; i < 12; i++) {
            const time = now + i * 0.1;
            const f = 150 + i * 120;
            playTone(ctx, f, 0.15, "square", 0.02, true, time);
          }
          
          // 3. High-frequency "data stream" texture (0.5s - 1.5s)
          for (let i = 0; i < 20; i++) {
            const time = now + 0.5 + i * 0.05;
            const f = 2000 + Math.random() * 1000;
            playTone(ctx, f, 0.04, "sine", 0.01, true, time);
          }
          
          // 4. Final resonant "Power On" chime (1.2s - 2.0s)
          const chimeTime = now + 1.2;
          playTone(ctx, 880, 0.8, "sine", 0.1, true, chimeTime);
          playTone(ctx, 1320, 0.7, "sine", 0.06, true, chimeTime + 0.1);
          playTone(ctx, 1760, 0.6, "sine", 0.04, true, chimeTime + 0.2);
          
          break;
      }
    } catch {
      // Silently fail if audio context is unavailable
    }
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    enabledRef.current = v;
  }, []);

  return { play, setEnabled };
}
