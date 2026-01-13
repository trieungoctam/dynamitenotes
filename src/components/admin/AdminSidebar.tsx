/**
 * AdminSidebar - Navigation sidebar for admin panel
 */

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Lightbulb,
  BookOpen,
  Image,
  User,
  Info,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Posts", href: "/admin/posts", icon: <FileText className="w-4 h-4" /> },
  { label: "Insights", href: "/admin/insights", icon: <Lightbulb className="w-4 h-4" /> },
  { label: "Series", href: "/admin/series", icon: <BookOpen className="w-4 h-4" /> },
  { label: "Photos", href: "/admin/photos", icon: <Image className="w-4 h-4" /> },
  { label: "Resume", href: "/admin/resume", icon: <User className="w-4 h-4" /> },
  { label: "About", href: "/admin/about", icon: <Info className="w-4 h-4" /> },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          View Site
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
