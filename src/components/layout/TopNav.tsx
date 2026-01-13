import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface TopNavProps {
  onOpenCommand: () => void;
}

const navItems = [
  { label: "Blog", path: "/posts" },
  { label: "Photos", path: "/photos" },
  { label: "Resume", path: "/resume" },
  { label: "About", path: "/about" },
];

export function TopNav({ onOpenCommand }: TopNavProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20 px-6 md:px-8 lg:px-12">
        {/* Logo - Bold editorial style */}
        <Link
          to="/"
          className="group relative"
        >
          <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Dynamite
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
        </Link>

        {/* Desktop Nav - Minimal with hover underline */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group relative py-2"
              >
                <span
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {item.label}
                </span>
                {/* Animated underline */}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-foreground transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search button - Minimal icon */}
          <button
            onClick={onOpenCommand}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav - Full screen overlay */}
      <div
        className={`md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-xl transition-all duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="container h-full flex flex-col justify-center px-6 -mt-20">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="group py-4 border-b border-border/30"
                style={{
                  animationDelay: mobileOpen ? `${index * 50}ms` : "0ms",
                }}
              >
                <span
                  className={`text-3xl md:text-4xl font-bold tracking-tight transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-foreground group-hover:text-primary"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Mobile search */}
          <button
            onClick={() => {
              setMobileOpen(false);
              onOpenCommand();
            }}
            className="mt-8 flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="w-5 h-5" />
            <span className="text-lg">Search</span>
            <kbd className="ml-auto px-2 py-1 rounded bg-muted text-xs font-mono">⌘K</kbd>
          </button>
        </nav>
      </div>
    </header>
  );
}
