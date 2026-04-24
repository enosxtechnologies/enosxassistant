/*
 * ENOSX XAI — useSoundEffects
 * Subtle UI sound effects using Web Audio API
 * Sounds: click, send, receive, listen-start, listen-stop
 * All sounds are synthesized — no external files needed
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
  fadeOut = true
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(gainVal, ctx.currentTime);
  if (fadeOut) {
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  }
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
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
          // Soft tick
          playTone(ctx, 800, 0.08, "sine", 0.05);
          break;

        case "send":
          // Rising two-tone whoosh
          playTone(ctx, 440, 0.12, "sine", 0.07);
          setTimeout(() => playTone(ctx, 660, 0.1, "sine", 0.05), 80);
          break;

        case "receive":
          // Soft chime
          playTone(ctx, 880, 0.18, "sine", 0.06);
          setTimeout(() => playTone(ctx, 1100, 0.15, "sine", 0.04), 100);
          break;

        case "listenStart":
          // Activation beep
          playTone(ctx, 600, 0.15, "sine", 0.08);
          setTimeout(() => playTone(ctx, 900, 0.12, "sine", 0.06), 100);
          break;

        case "listenStop":
          // Deactivation descend
          playTone(ctx, 900, 0.12, "sine", 0.06);
          setTimeout(() => playTone(ctx, 600, 0.15, "sine", 0.05), 80);
          break;

        case "error":
          // Low buzz
          playTone(ctx, 200, 0.2, "sawtooth", 0.04);
          break;

        case "godMode":
          // Cinematic 5-phase GOD MODE sequence (2.0s)
          // Phase 1: Deep bass rumble (0-400ms)
          playTone(ctx, 40, 1.5, "sine", 0.2, true);
          playTone(ctx, 60, 1.2, "triangle", 0.1, true);

          // Phase 2: Rising digital sweep with harmonics (200-800ms)
          for (let i = 0; i < 12; i++) {
            setTimeout(() => {
              playTone(ctx, 150 + i * 120, 0.15, "square", 0.04 - i * 0.002, true);
              if (i % 3 === 0) playTone(ctx, 300 + i * 200, 0.1, "sine", 0.02, true);
            }, 200 + i * 50);
          }

          // Phase 3: Power surge pulse (800-1200ms)
          setTimeout(() => {
            playTone(ctx, 80, 0.4, "sawtooth", 0.12, true);
            playTone(ctx, 120, 0.3, "sine", 0.08, true);
          }, 800);

          // Phase 4: Activation chime sequence (1200-1600ms)
          setTimeout(() => {
            const chimes = [880, 1100, 1320, 1760];
            chimes.forEach((freq, idx) => {
              setTimeout(() => playTone(ctx, freq, 0.4, "sine", 0.07, true), idx * 100);
            });
          }, 1200);

          // Phase 5: Ethereal confirmation tones (1600-2000ms)
          setTimeout(() => {
            playTone(ctx, 2200, 0.8, "sine", 0.05, true);
            playTone(ctx, 2600, 0.6, "sine", 0.03, true);
          }, 1600);
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
