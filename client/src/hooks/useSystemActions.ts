import { useCallback } from "react";
import { toast } from "sonner";
import { useCommandChain, type SystemAction } from "./useCommandChain";

export function useSystemActions() {
  const { executeChain } = useCommandChain();

  const parseActions = useCallback((text: string): SystemAction[] => {
    const actions: SystemAction[] = [];

    // Regex to find [[ACTION: {...}]]
    const actionRegex = /\[\[ACTION:\s*({.*?})\s*\]\]/g;
    let match;

    while ((match = actionRegex.exec(text)) !== null) {
      try {
        const action = JSON.parse(match[1]) as SystemAction;
        actions.push(action);
      } catch (e) {
        console.error("Failed to parse system action:", e);
      }
    }

    return actions;
  }, []);

  const executeAction = useCallback(
    async (text: string) => {
      const actions = parseActions(text);

      if (actions.length === 0) return [];

      toast.info(`Starting command chain with ${actions.length} steps...`);
      await executeChain(actions);
      return actions;
    },
    [parseActions, executeChain]
  );

  return { executeAction };
}
