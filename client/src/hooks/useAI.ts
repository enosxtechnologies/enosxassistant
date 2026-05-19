import { useGroq } from "./useGroq";

/**
 * useAI hook - A wrapper around useGroq to provide a consistent AI interface
 * across the application, especially for components like GodModeTerminalWithChat.
 */
export function useAI() {
  const { sendMessage, isLoading, error } = useGroq();

  return {
    sendMessage,
    isLoading,
    error,
  };
}
