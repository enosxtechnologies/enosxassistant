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
      recognition.maxAlternatives = 3; // Improved accuracy with multiple alternatives

      recognition.onstart = () => {
        setVoiceState("listening");
        setTranscript("");
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          // Use the most confident result (highest confidence score)
          let bestTranscript = result[0]?.transcript || "";
          let bestConfidence = result[0]?.confidence || 0;

          for (let j = 1; j < result.length; j++) {
            if (result[j]?.confidence > bestConfidence) {
              bestTranscript = result[j]?.transcript || "";
              bestConfidence = result[j]?.confidence || 0;
            }
          }

          if (result.isFinal) {
            finalTranscript += bestTranscript;
          } else {
            interimTranscript += bestTranscript;
          }
        }

        const displayText = (finalTranscript || interimTranscript).trim();
        setTranscript(displayText);

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

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Confident, tech-loving male AI voice profile
    utterance.rate = 1.0; 
    utterance.pitch = 0.85; // Lower pitch for a confident male voice
    utterance.volume = 1;

    const voices = synthRef.current.getVoices();
    
    // Prioritize confident male voices with multiple fallback options
    const preferredVoice = 
      voices.find(v => v.name.includes("Microsoft David")) ||
      voices.find(v => v.name.includes("Google US English Male")) ||
      voices.find(v => v.name.includes("Aaron")) ||
      voices.find(v => v.name.includes("Daniel")) ||
      voices.find(v => v.name.includes("Male") && v.lang === "en-US") ||
      voices.find(v => v.name.includes("Google US English")) ||
      voices.find(v => v.lang === "en-US" && !v.name.includes("Female")) ||
      voices.find(v => v.lang === "en-US");
      
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
