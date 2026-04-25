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

      if (actions.length === 1) {
        // Single action - execute directly
        const action = actions[0];
        try {
          if (action.type === "open_url") {
            if (!action.url) throw new Error("Missing URL");
            const newWindow = window.open(action.url, "_blank");
            if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
              toast.error("Popup blocked! Please allow popups for this site to open new tabs.", {
                duration: 6000,
                action: {
                  label: "How to fix?",
                  onClick: () => window.alert("Click the 'Pop-up blocked' icon in your browser's address bar and select 'Always allow pop-ups from this site'.")
                }
              });
            } else {
              toast.success(`Opening tab: ${action.url}`);
            }
          } else if (action.type === "launch_app") {
            if (!action.app) throw new Error("Missing app name");
            console.log(`LAUNCH_APP_INTENT: ${action.app}`);
            toast.info(`Launching: ${action.app}`);
          } else if (action.type === "search") {
            if (!action.query) throw new Error("Missing search query");
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(action.query)}`;
            const newWindow = window.open(searchUrl, "_blank");
            if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
              toast.error("Popup blocked! Please allow popups to see search results.");
            } else {
              toast.success(`Searching: ${action.query}`);
            }
          }
        } catch (e) {
          toast.error(`Action failed: ${e instanceof Error ? e.message : String(e)}`);
        }
      } else {
        // Multiple actions - use command chain
        toast.info(`Starting command chain with ${actions.length} steps...`);
        await executeChain(actions);
      }
      return actions;
    },
    [parseActions, executeChain]
  );

  return { executeAction };
}
