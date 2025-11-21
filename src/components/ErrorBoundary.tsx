'use client';

import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Error in ${this.props.componentName || 'component'}:`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-red-500/30 p-6">
          <div className="text-center">
            <h3 className="text-red-400 font-semibold mb-2">
              {this.props.componentName || 'Component'} Error
            </h3>
            <p className="text-slate-400 text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
