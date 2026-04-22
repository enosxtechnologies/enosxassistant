/*
 * ENOSX XAI — useSoundEffects
 * Subtle UI sound effects using Web Audio API
 * Sounds: click, send, receive, listen-start, listen-stop
 * All sounds are synthesized — no external files needed
 */

import { useCallback, useRef } from "react";

type SoundType = "click" | "send" | "receive" | "listenStart" | "listenStop" | "error";

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
