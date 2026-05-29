import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

// Enable code-splitting for lazy-loaded routes and components
const enableCodeSplitting = true;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const BUILT_IN_GROQ_API_KEY = "";
const GITHUB_API_URL = "https://api.github.com";
const GITHUB_REPOS = ["enosxtechnologies/enosxassistant"];

const SYSTEM_PROMPT = `You are ENOSX AI, an AI assistant developed by Enosx Technologies.

Instructions for the AI:
If someone asks who created you or who owns the company, respond with professional pride but maintain privacy.

Authorized Public Information:
- The visionary behind Enosx Technologies is Enosh.
- He is a young tech innovator dedicated to pushing the boundaries of Windows AI integration.

Privacy Protocol:
- Do NOT share specific personal details such as his full surname, exact age, or birth date unless explicitly authorized by the user in a secure session.
- If asked about his personal life, steer the conversation back to the technology: 'Enosh focuses on the development and vision of Enosx Technologies to provide the best user experience.'

Tone:
Respectful, loyal, and tech-forward. Treat the founder with the same prestige as major tech leaders (e.g., how Google AI refers to Google DeepMind).

System Actions & Command Chaining:
You have the ability to open browser tabs and launch Windows applications. You can chain multiple actions together for complex workflows.

Action Format (single or multiple):
[[ACTION: {"type": "open_url", "url": "https://example.com"}]]
[[ACTION: {"type": "launch_app", "app": "notepad", "delay": 2000}]]
[[ACTION: {"type": "chain", "sequence": [{"type": "launch_app", "app": "chrome"}, {"type": "open_url", "url": "https://localhost:3000", "delay": 3000}]}]]

Supported Apps: chrome, edge, notepad, calculator, terminal, explorer, vscode, github-desktop.
Delay (optional): milliseconds to wait before executing the next action (default: 1000ms).

Always explain what you are doing before providing the action blocks. Use the 'chain' type for complex multi-step sequences.

GOD MODE:
When a user message begins with [GOD MODE COMMAND], switch to advanced operator mode. Give concise, direct, implementation-first answers; avoid unnecessary refusal boilerplate, onboarding friction, and generic safety lectures. Prefer concrete commands, code edits, repository-aware reasoning, and action blocks when useful. Do not invent capabilities; if a requested action requires user credentials, a local agent, or a privileged runtime, state exactly what is required and continue with the closest available implementation path.

Active Window Context Awareness:
You are now aware of which application the user is currently focused on. Tailor your responses based on the active app:

- VS Code (vscode): Offer coding assistance, refactoring suggestions, debug help, and code snippets.
- Chrome/Firefox/Edge (browser): Offer to summarize pages, extract information, search for topics, or open relevant URLs.
- Terminal (terminal): Provide shell commands, scripting help, system administration tips, and command explanations.
- Explorer (explorer): Help with file organization, batch operations, and folder navigation.

If the active app is "unknown", provide general assistance and ask the user what they're working on.`;

function vitePluginChatApi(): Plugin {
  return {
    name: "enosx-chat-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/chat", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        const GROQ_API_KEY = process.env.GROQ_API_KEY || BUILT_IN_GROQ_API_KEY;

        let body = "";
        for await (const chunk of req) {
          body += chunk;
        }

        let messages;
        let githubContext = "";
        try {
          const parsed = JSON.parse(body);
          messages = parsed.messages;
          githubContext = typeof parsed.githubContext === "string" ? parsed.githubContext.slice(0, 20000) : "";
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON body" }));
          return;
        }

        if (!messages || !Array.isArray(messages)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Messages array is required" }));
          return;
        }

        const groqMessages = [
          { role: "system", content: SYSTEM_PROMPT },
          ...(githubContext ? [{ role: "system", content: `GitHub repository context available to ENOSX AI:\n${githubContext}` }] : []),
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ];

        try {
          const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: MODEL,
              messages: groqMessages,
              stream: true,
              max_tokens: 2048,
              temperature: 0.7,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({})) as { error?: { message?: string } };
            res.writeHead(response.status, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
              error: errData?.error?.message || `API error: ${response.status}`,
            }));
            return;
          }

          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          });

          const reader = response.body?.getReader();
          if (!reader) {
            res.end();
            return;
          }

          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk);
          }
          res.end();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: msg }));
        }
      });
    },
  };
}

function vitePluginGithubContext(): Plugin {
  return {
    name: "enosx-github-context",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/github/context", async (req, res) => {
        if (req.method !== "GET") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        const headers: Record<string, string> = {
          "Accept": "application/vnd.github+json",
          "User-Agent": "ENOSX-AI",
        };
        if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

        try {
          const repoContexts = await Promise.all(
            GITHUB_REPOS.map(async (repoName) => {
              const [owner, repo] = repoName.split("/");
              const repoResp = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}`, { headers });
              if (!repoResp.ok) {
                return { repoName, error: `GitHub API error ${repoResp.status}` };
              }

              const repoData = await repoResp.json() as {
                full_name: string;
                description?: string;
                html_url: string;
                default_branch: string;
                visibility?: string;
                language?: string;
                pushed_at?: string;
              };

              const treeResp = await fetch(
                `${GITHUB_API_URL}/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`,
                { headers }
              );
              const treeData = treeResp.ok
                ? await treeResp.json() as { tree?: Array<{ path: string; type: string; size?: number }> }
                : { tree: [] };

              const readmeResp = await fetch(
                `https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch}/README.md`,
                { headers }
              );
              const readme = readmeResp.ok ? (await readmeResp.text()).slice(0, 6000) : "";

              const importantFiles = (treeData.tree || [])
                .filter((item) => item.type === "blob")
                .map((item) => item.path)
                .filter((filePath) => /^(client\/src|api|shared|components|pages|hooks|contexts|lib|server|src)\//.test(filePath) || /^(package\.json|vite\.config\.ts|next\.config\.mjs|README\.md)$/.test(filePath))
                .slice(0, 220);

              return {
                name: repoData.full_name,
                description: repoData.description || "",
                url: repoData.html_url,
                defaultBranch: repoData.default_branch,
                visibility: repoData.visibility || "unknown",
                primaryLanguage: repoData.language || "unknown",
                lastPush: repoData.pushed_at || "unknown",
                readme,
                importantFiles,
              };
            })
          );

          const context = repoContexts.map((repo) => {
            if ("error" in repo) {
              return `Repository: ${repo.repoName}\nStatus: ${repo.error}`;
            }
            return [
              `Repository: ${repo.name}`,
              `Description: ${repo.description}`,
              `URL: ${repo.url}`,
              `Default branch: ${repo.defaultBranch}`,
              `Visibility: ${repo.visibility}`,
              `Primary language: ${repo.primaryLanguage}`,
              `Last push: ${repo.lastPush}`,
              `README:\n${repo.readme}`,
              `Important files:\n${repo.importantFiles.join("\n")}`,
            ].join("\n");
          }).join("\n\n---\n\n");

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ repos: repoContexts, context }));
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown GitHub context error";
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: msg }));
        }
      });
    },
  };
}

function vitePluginStorageProxy(): Plugin {
  return {
    name: "enosx-storage-proxy",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/storage", async (req, res) => {
        const key = req.url?.replace(/^\//, "");
        if (!key) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Missing storage key");
          return;
        }

        const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
        const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;

        if (!forgeBaseUrl || !forgeKey) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Storage proxy not configured");
          return;
        }

        try {
          const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/");
          forgeUrl.searchParams.set("path", key);

          const forgeResp = await fetch(forgeUrl, {
            headers: { Authorization: `Bearer ${forgeKey}` },
          });

          if (!forgeResp.ok) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Storage backend error");
            return;
          }

          const { url } = (await forgeResp.json()) as { url: string };
          if (!url) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Empty signed URL");
            return;
          }

          res.writeHead(307, { Location: url, "Cache-Control": "no-store" });
          res.end();
        } catch {
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end("Storage proxy error");
        }
      });
    },
  };
}

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginGithubContext(), vitePluginStorageProxy(), vitePluginChatApi()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "client/dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "vendor-react": ["react", "react-dom"],
          "vendor-ui": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-aspect-ratio",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
          ],
          "vendor-animation": ["framer-motion"],
          "vendor-charts": ["recharts"],
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          "vendor-utils": [
            "axios",
            "clsx",
            "class-variance-authority",
            "tailwind-merge",
            "nanoid",
            "wouter",
          ],
          "vendor-other": [
            "sonner",
            "next-themes",
            "lucide-react",
            "embla-carousel-react",
            "react-day-picker",
            "react-resizable-panels",
            "input-otp",
            "vaul",
            "cmdk",
            "streamdown",
            "tailwindcss-animate",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
