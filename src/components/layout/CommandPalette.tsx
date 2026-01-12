import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, FileText, Package, BookOpen, Play, 
  Clock, Sparkles, ArrowRight, X 
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    {
      id: "home",
      label: "Go to README",
      description: "Return to home",
      icon: <FileText className="w-4 h-4" />,
      action: () => navigate("/"),
      category: "Navigation",
    },
    {
      id: "packages",
      label: "Browse Packages",
      description: "Explore all knowledge areas",
      icon: <Package className="w-4 h-4" />,
      action: () => navigate("/packages"),
      category: "Navigation",
    },
    {
      id: "docs",
      label: "Open Docs",
      description: "Playbooks & templates",
      icon: <BookOpen className="w-4 h-4" />,
      action: () => navigate("/docs"),
      category: "Navigation",
    },
    {
      id: "playground",
      label: "Launch Playground",
      description: "Interactive tools",
      icon: <Play className="w-4 h-4" />,
      action: () => navigate("/playground"),
      category: "Navigation",
    },
    {
      id: "changelog",
      label: "View Changelog",
      description: "Latest updates",
      icon: <Clock className="w-4 h-4" />,
      action: () => navigate("/changelog"),
      category: "Navigation",
    },
    {
      id: "ai-pm",
      label: "AI-First PM",
      description: "Package: AI-first product thinking",
      icon: <Sparkles className="w-4 h-4" />,
      action: () => navigate("/packages/ai-first-pm"),
      category: "Packages",
    },
    {
      id: "experiments",
      label: "Experiments",
      description: "Package: A/B testing & iteration",
      icon: <Package className="w-4 h-4" />,
      action: () => navigate("/packages/experiments"),
      category: "Packages",
    },
    {
      id: "prompts",
      label: "Prompts",
      description: "Package: Prompt patterns & eval",
      icon: <Package className="w-4 h-4" />,
      action: () => navigate("/packages/prompts"),
      category: "Packages",
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(query.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div className="command-palette" onClick={onClose}>
      <div
        className="w-full max-w-xl mx-4 glass rounded-2xl shadow-2xl overflow-hidden animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, packages, docs..."
            className="command-input"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {Object.entries(groupedCommands).map(([category, items]) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {category}
              </div>
              {items.map((cmd) => {
                flatIndex++;
                const isSelected = flatIndex === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className={`${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                      {cmd.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{cmd.label}</div>
                      {cmd.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {cmd.description}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
