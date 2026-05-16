import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FounderModeProvider } from "./contexts/FounderModeContext";
import { WindowContextProvider } from "./contexts/WindowContext";
import { EnoshLearningProvider } from "./contexts/EnoshLearningContext";
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
          <EnoshLearningProvider>
            <WindowContextProvider>
            <TooltipProvider>
          <Toaster />
          <Router />
            </TooltipProvider>
            </WindowContextProvider>
          </EnoshLearningProvider>
        </FounderModeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
