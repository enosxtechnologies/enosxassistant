import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FounderModeProvider } from "./contexts/FounderModeContext";
import { WindowContextProvider } from "./contexts/WindowContext";
import { WallpaperProvider } from "./contexts/WallpaperContext";
import ChatPage from "./pages/ChatPage";
import AboutPage from "./pages/AboutPage";
import SplashPage from "./components/SplashPage";
import { useState } from "react";

function Router() {
  const [showSplash, setShowSplash] = useState(true);
  if (showSplash) {
    return <SplashPage onComplete={() => setShowSplash(false)} />;
  }
  return (
    <Switch>
      <Route path={"/"} component={ChatPage} />
      <Route path={"/about"} component={AboutPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="manus">
        <WallpaperProvider>
          <FounderModeProvider>
            <WindowContextProvider>
              <TooltipProvider>
                <Toaster
                  theme="dark"
                  toastOptions={{
                    style: {
                      background: "rgba(18,18,24,0.95)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      color: "#f0f0f4",
                      backdropFilter: "blur(20px)",
                    },
                  }}
                />
                <Router />
              </TooltipProvider>
            </WindowContextProvider>
          </FounderModeProvider>
        </WallpaperProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
