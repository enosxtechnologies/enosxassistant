/*
 * ENOSX XAI — useGodMode
 * Custom hook to detect the "GOD MODE" key sequence: Ctrl + E + X + C.
 * When the sequence is matched, it triggers the callback.
 */
import { useEffect, useRef, useCallback } from "react";

export function useGodMode(onTrigger: () => void) {
  // Track currently pressed keys
  const pressedKeys = useRef<Set<string>>(new Set());
  
  // The required sequence: Control + E + X + C
  // Note: We use lowercase 'e', 'x', 'c' as e.key returns lowercase unless Shift is held
  const REQUIRED_KEYS = ["Control", "e", "x", "c"];

  const checkSequence = useCallback(() => {
    const isControl = pressedKeys.current.has("Control");
    const isE = pressedKeys.current.has("e") || pressedKeys.current.has("E");
    const isX = pressedKeys.current.has("x") || pressedKeys.current.has("X");
    const isC = pressedKeys.current.has("c") || pressedKeys.current.has("C");

    if (isControl && isE && isX && isC) {
      onTrigger();
      // Clear after trigger to prevent multiple activations
      pressedKeys.current.clear();
    }
  }, [onTrigger]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      pressedKeys.current.add(e.key);
      checkSequence();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key);
    };

    // Also clear keys if window loses focus to prevent stuck keys
    const handleBlur = () => {
      pressedKeys.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [checkSequence]);
}
