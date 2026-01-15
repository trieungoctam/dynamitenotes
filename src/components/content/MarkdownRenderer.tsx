/**
 * MarkdownRenderer - Enhanced with dynamic theme & better styling
 * Components object is memoized to prevent infinite re-renders
 */

import React, { useMemo, useState } from "react";
import Markdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MermaidDiagram, PlantUMLDiagram, DiagramErrorBoundary } from "./diagrams";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Detect theme from document
  const isDark = useMemo(() => {
    return document.documentElement.classList.contains("dark");
  }, []);

  const codeTheme = isDark ? vscDarkPlus : vs;

  // Memoize components to prevent react-markdown from re-rendering on every parent render
  const components = useMemo<Components>(() => ({
    // Code blocks with syntax highlighting
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const code = String(children).replace(/\n$/, "");
      const language = match?.[1] || "";
      const isInline = !match && !code.includes("\n");

      // Inline code
      if (isInline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      // Mermaid diagrams
      if (language === "mermaid") {
        return (
          <DiagramErrorBoundary>
            <MermaidDiagram chart={code} theme={isDark ? "dark" : "default"} />
          </DiagramErrorBoundary>
        );
      }

      // PlantUML diagrams
      if (language === "plantuml") {
        return (
          <DiagramErrorBoundary>
            <PlantUMLDiagram source={code} format="svg" />
          </DiagramErrorBoundary>
        );
      }

      // Regular code blocks with syntax highlighting
      return (
        <CodeBlock
          language={language || "text"}
          code={code}
          theme={codeTheme}
        />
      );
    },

    // Links
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        {children}
      </a>
    ),

    // Images with responsive container
    img: ({ src, alt }) => (
      <>
        <img
          src={src}
          alt={alt || ""}
          className="my-6 rounded-lg max-w-full h-auto"
          loading="lazy"
        />
        {alt && (
          <span className="block text-sm text-center text-muted-foreground">
            {alt}
          </span>
        )}
      </>
    ),

    // Tables with responsive wrapper
    table: ({ children }) => (
      <div className="my-6 w-full overflow-x-auto rounded-lg border">
        <table className="w-full">{children}</table>
      </div>
    ),

    // Table header
    thead: ({ children }) => (
      <thead className="bg-muted [&_tr]:border-b">
        {children}
      </thead>
    ),

    // Table body with hover states
    tbody: ({ children }) => (
      <tbody className="[&_tr:last-child]:border-0">
        {children}
      </tbody>
    ),

    // Table row with hover
    tr: ({ children }) => (
      <tr className="border-b transition-colors hover:bg-muted/50">
        {children}
      </tr>
    ),

    // Table header cell
    th: ({ children, align }) => (
      <th className={cn(
        "h-12 px-4 font-medium text-muted-foreground [&[align=center]]:text-center [&[align=right]]:text-right",
        align === "center" && "text-center",
        align === "right" && "text-right"
      )}>
        {children}
      </th>
    ),

    // Table data cell
    td: ({ children, align }) => (
      <td className={cn(
        "p-4 [&[align=center]]:text-center [&[align=right]]:text-right",
        align === "center" && "text-center",
        align === "right" && "text-right"
      )}>
        {children}
      </td>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-outside ml-6 mb-4 space-y-1">
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol className="list-decimal list-outside ml-6 mb-4 space-y-1">
        {children}
      </ol>
    ),

    // List items
    li: ({ children }) => (
      <li className="text-muted-foreground">{children}</li>
    ),

    // Horizontal rule
    hr: () => (
      <hr className="my-8 border-t" />
    ),
  }), [isDark, codeTheme]);

  return (
    <div className={cn("markdown-content max-w-none", className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
}

/**
 * CodeBlock component with syntax highlighting and copy button
 */
interface CodeBlockProps {
  language: string;
  code: string;
  theme: any;
}

function CodeBlock({ language, code, theme }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="group relative my-6">
      {/* Language label */}
      <div className="absolute top-3 right-3 z-10">
        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
          {language}
        </span>
      </div>

      {/* Copy button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-3 right-16 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>

      {/* Syntax highlighted code */}
      <SyntaxHighlighter
        language={language}
        style={theme}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          background: "hsl(var(--muted))",
        }}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
