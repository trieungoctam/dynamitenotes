/**
 * MarkdownRenderer
 * Renders markdown content with syntax highlighting for code blocks.
 */

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn(
      "prose prose-invert max-w-none",
      "prose-headings:text-foreground prose-headings:font-semibold",
      "prose-p:text-muted-foreground prose-p:leading-relaxed",
      "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
      "prose-strong:text-foreground prose-strong:font-semibold",
      "prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
      "prose-pre:bg-transparent prose-pre:p-0",
      "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
      "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
      "prose-li:marker:text-muted-foreground",
      className
    )}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const code = String(children).replace(/\n$/, "");

          // Check if this is an inline code or code block
          const isInline = !match && !code.includes("\n");

          if (isInline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }

          return (
            <SyntaxHighlighter
              language={match?.[1] || "text"}
              style={oneDark}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
              }}
            >
              {code}
            </SyntaxHighlighter>
          );
        },
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {children}
          </a>
        ),
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt || ""}
            className="rounded-lg max-w-full h-auto"
            loading="lazy"
          />
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="w-full">{children}</table>
          </div>
        ),
      }}
    >
      {content}
    </Markdown>
    </div>
  );
}
