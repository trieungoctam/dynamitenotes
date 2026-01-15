/**
 * Diagram Components Index
 *
 * Exports diagram components directly.
 * Note: Lazy loading removed due to mermaid ES module Symbol.toStringTag conflicts.
 * Vite handles code splitting automatically, and mermaid is imported dynamically within components.
 */

export { MermaidDiagram } from "./MermaidDiagram";
export { PlantUMLDiagram } from "./PlantUMLDiagram";
export { DiagramErrorBoundary } from "./DiagramErrorBoundary";
