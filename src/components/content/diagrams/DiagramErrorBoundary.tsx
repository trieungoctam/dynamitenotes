/**
 * DiagramErrorBoundary Component
 *
 * Error boundary for diagram components.
 * Catches rendering errors and displays fallback UI.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class DiagramErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Diagram rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="my-6 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Diagram unavailable
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
