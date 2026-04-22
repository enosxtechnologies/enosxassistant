import { useCallback } from "react";
import { toast } from "sonner";

export function useSystemActions() {
  const executeAction = useCallback((text: string) => {
    // Regex to find [[ACTION: {...}]]
    const actionRegex = /\[\[ACTION:\s*({.*?})\s*\]\]/g;
    let match;

    while ((match = actionRegex.exec(text)) !== null) {
      try {
        const action = JSON.parse(match[1]);
        console.log("Executing system action:", action);

        if (action.type === "open_url") {
          window.open(action.url, "_blank");
          toast.success(`Opening tab: ${action.url}`);
        } else if (action.type === "launch_app") {
          // In a real desktop environment, this would call a native bridge (Electron)
          // For the web prototype, we simulate the intent
          toast.info(`Simulating launch of app: ${action.app}`);
          console.log(`LAUNCH_APP_INTENT: ${action.app}`);
        }
      } catch (e) {
        console.error("Failed to parse system action:", e);
      }
    }
  }, []);

  return { executeAction };
}
