import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";

const mermaidTest = `# Mermaid Test

## Class Diagram

\`\`\`mermaid
classDiagram
    class Animal {
        +String name
        +eat()
        +sleep()
    }
    class Dog {
        +bark()
        +fetch()
    }
    Animal <|-- Dog
\`\`\`

## Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant System
    User->>System: Hello
    System-->>User: Hi!
\`\`\`
`;

export default function MermaidTest() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Mermaid Diagram Test</h1>
      <MarkdownRenderer content={mermaidTest} />
    </div>
  );
}
