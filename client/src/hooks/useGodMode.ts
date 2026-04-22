/*
 * ENOSX XAI — useGodMode
 * Custom hook to detect the "GOD MODE" key sequences.
 * 
 * Supported Sequences:
 * 1. Control + E + X + C
 * 2. Alt + E + X (Alternative)
 *
 * When either sequence is matched, it triggers the callback.
 */
import { useEffect, useRef, useCallback } from "react";

export function useGodMode(onTrigger: () => void) {
  // Track currently pressed keys
  const pressedKeys = useRef<Set<string>>(new Set());

  const checkSequence = useCallback(() => {
    // Helper to check if all keys in a set are pressed
    const hasKeys = (keys: string[]) => {
      return keys.every(key => 
        pressedKeys.current.has(key) || 
        pressedKeys.current.has(key.toLowerCase()) || 
        pressedKeys.current.has(key.toUpperCase())
      );
    };

    // Sequence 1: Control + E + X + C
    const sequence1 = hasKeys(["Control", "e", "x", "c"]);
    
    // Sequence 2: Alt + E + X
    const sequence2 = hasKeys(["Alt", "e", "x"]);

    if (sequence1 || sequence2) {
      onTrigger();
      // Clear after trigger to prevent multiple activations
      pressedKeys.current.clear();
    }
  }, [onTrigger]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use e.key for detection (case-sensitive, but handled in checkSequence)
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
