import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FounderModeProvider } from "./contexts/FounderModeContext";
import { WindowContextProvider } from "./contexts/WindowContext";
import ChatPage from "./pages/ChatPage";
import AboutPage from "./pages/AboutPage";

function Router() {
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
      <ThemeProvider defaultTheme="dark">
        <FounderModeProvider>
          <WindowContextProvider>
            <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(20, 10, 10, 0.95)",
                border: "1px solid rgba(220, 20, 60, 0.3)",
                color: "#f0f0f0",
                backdropFilter: "blur(20px)",
              },
            }}
          />
          <Router />
            </TooltipProvider>
          </WindowContextProvider>
        </FounderModeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
