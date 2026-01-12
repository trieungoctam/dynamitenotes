import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Command, GitBranch, Menu, X } from "lucide-react";

interface TopNavProps {
  onOpenCommand: () => void;
}

const navItems = [
  { label: "Readme", path: "/" },
  { label: "Packages", path: "/packages" },
  { label: "Docs", path: "/docs" },
  { label: "Playground", path: "/playground" },
  { label: "Changelog", path: "/changelog" },
];

export function TopNav({ onOpenCommand }: TopNavProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-border/50">
      <div className="container flex items-center justify-between h-14 px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <GitBranch className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-mono text-xs text-muted-foreground">tuan/</span>
            <span className="font-semibold text-sm -mt-1">ai-first-pm</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCommand}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface-elevated hover:bg-muted/50 transition-colors text-sm text-muted-foreground"
          >
            <Command className="w-3.5 h-3.5" />
            <span>Search...</span>
            <kbd className="ml-2 px-1.5 py-0.5 rounded bg-muted text-xs font-mono">⌘K</kbd>
          </button>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-surface-elevated animate-in">
          <nav className="container py-4 px-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                onOpenCommand();
              }}
              className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground"
            >
              <Command className="w-4 h-4" />
              <span>Quick search...</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
