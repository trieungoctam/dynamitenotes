import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { CommandPalette } from "@/components/layout/CommandPalette";
import Index from "./pages/Index";
import Packages from "./pages/Packages";
import Changelog from "./pages/Changelog";
import Playground from "./pages/Playground";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [commandOpen, setCommandOpen] = useState(false);

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <TopNav onOpenCommand={() => setCommandOpen(true)} />
            <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
            <div className="pt-14">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/packages/:packageId" element={<Packages />} />
                <Route path="/packages/:packageId/:itemId" element={<Packages />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/docs/:docId" element={<Docs />} />
                <Route path="/playground" element={<Playground />} />
                <Route path="/playground/:playgroundId" element={<Playground />} />
                <Route path="/changelog" element={<Changelog />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
