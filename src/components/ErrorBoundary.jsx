'use client';

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <div className="text-6xl">⚠️</div>
              <h1 className="text-3xl font-bold text-foreground">
                Oops! Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We're sorry for the inconvenience. An unexpected error has occurred.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-card border border-border rounded-lg p-4">
                <summary className="cursor-pointer font-semibold text-sm mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p className="font-mono text-destructive">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="overflow-auto text-xs bg-muted p-2 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Reload Page
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
