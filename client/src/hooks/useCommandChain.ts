import { useCallback, useState } from "react";
import { toast } from "sonner";

export interface SystemAction {
  type: "open_url" | "launch_app" | "chain" | "delay" | "search" | "create_file" | "write_file" | "read_file" | "delete_file" | "run_command" | "screenshot" | "volume_control" | "brightness_control";
  url?: string;
  app?: string;
  query?: string;
  delay?: number;
  sequence?: SystemAction[];
  path?: string;
  content?: string;
  command?: string;
  level?: number;
}

export interface ChainProgress {
  totalSteps: number;
  currentStep: number;
  currentAction: SystemAction | null;
  isExecuting: boolean;
  completedActions: SystemAction[];
  failedActions: { action: SystemAction; error: string }[];
}

export function useCommandChain() {
  const [progress, setProgress] = useState<ChainProgress>({
    totalSteps: 0,
    currentStep: 0,
    currentAction: null,
    isExecuting: false,
    completedActions: [],
    failedActions: [],
  });

  const executeAction = useCallback(async (action: SystemAction): Promise<boolean> => {
    try {
      if (action.type === "open_url") {
        if (!action.url) throw new Error("Missing URL");
        window.open(action.url, "_blank");
        toast.success(`Opening: ${action.url}`);
        return true;
      } else if (action.type === "launch_app") {
        if (!action.app) throw new Error("Missing app name");
        console.log(`LAUNCH_APP_INTENT: ${action.app}`);
        toast.info(`Launching: ${action.app}`);
        return true;
      } else if (action.type === "delay") {
        const delayMs = action.delay || 1000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return true;
      } else if (action.type === "create_file") {
        if (!action.path) throw new Error("Missing file path");
        // In a browser environment, direct file system access is not possible.
        // This would typically interact with a backend API that has file system access.
        // For now, we'll simulate success and log the action.
        console.log(`CREATE_FILE_INTENT: ${action.path}`);
        toast.success(`Creating file: ${action.path}`);
        return true;
      } else if (action.type === "write_file") {
        if (!action.path) throw new Error("Missing file path");
        if (action.content === undefined) throw new Error("Missing content");
        console.log(`WRITE_FILE_INTENT: ${action.path} with content: ${action.content}`);
        toast.success(`Writing to file: ${action.path}`);
        return true;
      } else if (action.type === "read_file") {
        if (!action.path) throw new Error("Missing file path");
        console.log(`READ_FILE_INTENT: ${action.path}`);
        toast.success(`Reading file: ${action.path}`);
        // In a real scenario, this would return file content.
        // For simulation, we'll just indicate success.
        return true;
      } else if (action.type === "delete_file") {
        if (!action.path) throw new Error("Missing file path");
        console.log(`DELETE_FILE_INTENT: ${action.path}`);
        toast.success(`Deleting file: ${action.path}`);
        return true;
      } else if (action.type === "run_command") {
        if (!action.command) throw new Error("Missing command");
        console.log(`RUN_COMMAND_INTENT: ${action.command}`);
        toast.success(`Running command: ${action.command}`);
        return true;
      } else if (action.type === "screenshot") {
        console.log("SCREENSHOT_INTENT");
        toast.success("Capturing screenshot...");
        return true;
      } else if (action.type === "volume_control") {
        if (action.level === undefined) throw new Error("Missing volume level");
        console.log(`VOLUME_CONTROL_INTENT: ${action.level}`);
        toast.success(`Setting volume to ${action.level}%`);
        return true;
      } else if (action.type === "brightness_control") {
        if (action.level === undefined) throw new Error("Missing brightness level");
        console.log(`BRIGHTNESS_CONTROL_INTENT: ${action.level}`);
        toast.success(`Setting brightness to ${action.level}%`);
        return true;
      }
      return false;
    } catch (error) {
      toast.error(`Action failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }, []);

  const executeChain = useCallback(
    async (actions: SystemAction[]) => {
      setProgress({
        totalSteps: actions.length,
        currentStep: 0,
        currentAction: null,
        isExecuting: true,
        completedActions: [],
        failedActions: [],
      });

      const completed: SystemAction[] = [];
      const failed: { action: SystemAction; error: string }[] = [];

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];

        // Update progress
        setProgress((prev) => ({
          ...prev,
          currentStep: i + 1,
          currentAction: action,
        }));

        try {
          if (action.type === "chain" && action.sequence) {
            // Recursively execute nested chain
            await executeChain(action.sequence);
          } else {
            // Execute single action
            const success = await executeAction(action);
            if (success) {
              completed.push(action);
            } else {
              failed.push({ action, error: "Action returned false" });
            }
          }

          // Apply delay if specified
          if (action.delay) {
            await new Promise((resolve) => setTimeout(resolve, action.delay));
          } else if (i < actions.length - 1) {
            // Default 1 second delay between actions
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          failed.push({
            action,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Final progress update
      setProgress((prev) => ({
        ...prev,
        isExecuting: false,
        completedActions: completed,
        failedActions: failed,
      }));

      // Summary toast
      if (failed.length === 0) {
        toast.success(`✓ All ${actions.length} actions completed successfully!`);
      } else {
        toast.warning(
          `⚠ Completed ${completed.length}/${actions.length} actions. ${failed.length} failed.`
        );
      }

      return { completed, failed };
    },
    [executeAction]
  );

  return {
    progress,
    executeAction,
    executeChain,
  };
}
