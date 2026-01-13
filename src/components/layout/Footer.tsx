/**
 * Footer Component
 * Site-wide footer with navigation and social links.
 */

import { Link } from "react-router-dom";
import { Github, Twitter, Rss } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 py-8 mt-auto">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} Dynamite Notes. Build. Ship. Learn. Repeat.
          </p>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link
              to="/about"
              className="hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              to="/resume"
              className="hover:text-foreground transition-colors"
            >
              Resume
            </Link>
            <a
              href="/rss.xml"
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              RSS
            </a>
          </nav>

          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="/rss.xml"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="RSS Feed"
            >
              <Rss className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
