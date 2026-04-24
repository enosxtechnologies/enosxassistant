export const createAdaptiveActionHandler = (handleSend: (text: string) => void) => {
  return (action: string) => {
    const prompts: Record<string, string> = {
      debug_code: "Debug this code and explain any issues you find:",
      refactor_code: "Refactor this code for better performance and readability:",
      summarize_page: "Summarize the main points from this article:",
      extract_info: "Extract the key information from this page:",
      explain_command: "Explain this command and what it does:",
      review_design: "Review this design and provide feedback:",
      organize_notes: "Help me organize these notes:",
    };
    handleSend(prompts[action] || "Help me with this:");
  };
};

export const createClipboardSummarizeHandler = (handleSend: (text: string) => void) => {
  return (text: string) => {
    handleSend(`Please summarize this text:\n\n${text}`);
  };
};
