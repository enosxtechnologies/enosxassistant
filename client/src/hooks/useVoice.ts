import { useState, useCallback, useRef, useEffect } from "react";
import { VoiceState } from "@/lib/types";

// Web Speech API type declarations
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => unknown) | null;
  onerror: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
}

interface ISpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export function useVoice() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      stopListening();
      stopSpeaking();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      if (!isSupported) return;

      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      const recognition: ISpeechRecognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setVoiceState("listening");
        setTranscript("");
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          onResult(finalTranscript.trim());
          setVoiceState("processing");
        }
      };

      recognition.onerror = () => {
        setVoiceState("idle");
        setTranscript("");
      };

      recognition.onend = () => {
        setVoiceState((prev) => (prev === "listening" ? "idle" : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [isSupported]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setVoiceState("idle");
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current) return;

    // Strip markdown for TTS
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "code block")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/>\s/g, "")
      .trim();

    // Skip empty text
    if (!cleanText) {
      onEnd?.();
      return;
    }

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Female AI assistant voice profile (Jarvis-like but feminine)
    utterance.rate = 1.0; // Natural speaking pace
    utterance.pitch = 1.15; // Slightly higher for feminine tone
    utterance.volume = 1;

    // Wait for voices to load
    const voices = synthRef.current.getVoices();
    
    // Prioritize premium female voices for a sophisticated AI assistant feel
    const preferredVoice = 
      // Microsoft premium female voices (best quality on Windows)
      voices.find(v => v.name.includes("Microsoft Zira")) ||
      voices.find(v => v.name.includes("Microsoft Eva")) ||
      voices.find(v => v.name.includes("Microsoft Aria")) ||
      // Google female voices
      voices.find(v => v.name.includes("Google US English") && !v.name.includes("Male")) ||
      // Apple female voices (macOS/iOS)
      voices.find(v => v.name.includes("Samantha")) ||
      voices.find(v => v.name.includes("Karen")) ||
      voices.find(v => v.name.includes("Victoria")) ||
      // Generic female voice fallbacks
      voices.find(v => v.name.toLowerCase().includes("female") && v.lang.startsWith("en")) ||
      voices.find(v => (v.name.includes("Fiona") || v.name.includes("Moira")) && v.lang.startsWith("en")) ||
      // Any English voice as last resort
      voices.find(v => v.lang === "en-US") ||
      voices.find(v => v.lang.startsWith("en"));
      
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setVoiceState("speaking");
    utterance.onend = () => {
      setVoiceState("idle");
      onEnd?.();
    };
    utterance.onerror = () => {
      setVoiceState("idle");
      onEnd?.();
    };

    setVoiceState("speaking");
    synthRef.current.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setVoiceState("idle");
  }, []);

  return {
    voiceState,
    transcript,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
