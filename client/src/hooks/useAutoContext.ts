/*
 * ENOSX XAI — useAutoContext
 * Simulates real-time ingestion of application data (code snippets, browser URLs, etc.)
 * Provides an "Auto-Context" that updates dynamically based on the active window.
 */
import { useState, useEffect, useCallback } from "react";
import { useActiveWindow, type AppType } from "@/contexts/WindowContext";

export interface AutoContextData {
  appType: AppType;
  content: string;
  lastUpdated: Date;
  isScanning: boolean;
}

export function useAutoContext() {
  const { activeWindow } = useActiveWindow();
  const [autoContext, setAutoContext] = useState<AutoContextData>({
    appType: "unknown",
    content: "",
    lastUpdated: new Date(),
    isScanning: false,
  });

  const scanContext = useCallback(async (appType: AppType) => {
    setAutoContext(prev => ({ ...prev, isScanning: true }));
    
    // Simulate high-end "scanning" delay
    await new Promise(resolve => setTimeout(resolve, 800));

    let simulatedContent = "";
    switch (appType) {
      case "vscode":
        simulatedContent = "// Active File: App.tsx\n// Lines 10-45\nexport function MainComponent() {\n  const [state, setState] = useState(null);\n  // Suggestion: Consider using useReducer for complex state...";
        break;
      case "chrome":
      case "firefox":
      case "edge":
        simulatedContent = "Active URL: https://github.com/enosxtechnologies/enosxassistant\nPage Title: Enosx Assistant - Windows AI Integration\nContent Summary: Repository for the next-gen Windows AI assistant...";
        break;
      case "terminal":
        simulatedContent = "Last Command: git push origin main\nOutput: Enumerating objects: 21, done...\nStatus: Successfully pushed to remote.";
        break;
      default:
        simulatedContent = "General system focus detected. Ready for commands.";
    }

    setAutoContext({
      appType,
      content: simulatedContent,
      lastUpdated: new Date(),
      isScanning: false,
    });
  }, []);

  // Automatically scan when active window changes
  useEffect(() => {
    if (activeWindow.isDetected && activeWindow.appType !== "unknown") {
      scanContext(activeWindow.appType);
    }
  }, [activeWindow.appType, activeWindow.isDetected, scanContext]);

  const getAutoContextMessage = useCallback(() => {
    if (!autoContext.content) return "";
    return `\n\nREAL-TIME APP CONTEXT (${autoContext.appType.toUpperCase()}):\n${autoContext.content}\nUse this real-time data to provide highly specific and relevant assistance.`;
  }, [autoContext]);

  return {
    autoContext,
    scanContext,
    getAutoContextMessage
  };
}
