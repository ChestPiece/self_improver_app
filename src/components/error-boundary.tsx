"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Mail,
  ExternalLink,
} from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    resetError: () => void;
    errorId: string;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  showDetails?: boolean;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring only in development
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Error Boundary Caught Error");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Here you would typically send to an error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
    };

    // In production, send to your error tracking service:
    // await errorTrackingService.report(errorReport);
    if (process.env.NODE_ENV === "development") {
      console.warn("Error reported:", errorReport);
    }
  };

  private resetError = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Max retry attempts reached");
      }
      return;
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
    }));

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      window.clearTimeout(this.retryTimeoutId);
    }

    // Auto-reset retry count after 30 seconds
    this.retryTimeoutId = window.setTimeout(() => {
      this.setState({ retryCount: 0 });
    }, 30000);
  };

  private handleReportIssue = () => {
    const { error, errorId } = this.state;

    const subject = encodeURIComponent(
      `Bug Report: ${error?.message || "Unknown Error"}`
    );
    const body = encodeURIComponent(`
Error ID: ${errorId}
Error Message: ${error?.message || "Unknown"}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
[Your description here]

Stack Trace:
${error?.stack || "Not available"}
    `);

    // Replace with your support email
    const mailtoUrl = `mailto:support@selfimprover.app?subject=${subject}&body=${body}`;
    window.open(mailtoUrl);
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      window.clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const { hasError, error, errorId, retryCount } = this.state;
    const {
      children,
      fallback: Fallback,
      maxRetries = 3,
      showDetails = false,
    } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (Fallback) {
        return (
          <Fallback
            error={error}
            resetError={this.resetError}
            errorId={errorId || "unknown"}
          />
        );
      }

      // Enhanced default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            <Card className="border-destructive/20 shadow-xl">
              <CardHeader className="text-center pb-4">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    times: [0, 0.2, 0.4, 0.6, 1],
                  }}
                  className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4"
                >
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                </motion.div>

                <CardTitle className="text-2xl font-bold text-destructive">
                  Oops! Something went wrong
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  We're sorry for the inconvenience. An unexpected error has
                  occurred.
                </p>

                {errorId && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Error ID:{" "}
                      <code className="font-mono text-xs">{errorId}</code>
                    </p>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Error Details */}
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 0.3 }}
                  >
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
                        <Bug className="h-4 w-4" />
                        Technical Details
                      </summary>
                      <div className="mt-3 p-4 bg-muted rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Message:</strong> {error.message}
                          </div>
                          {error.stack && (
                            <div>
                              <strong>Stack Trace:</strong>
                              <pre className="mt-1 text-xs overflow-auto max-h-32 bg-background p-2 rounded border">
                                {error.stack}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={this.resetError}
                    disabled={retryCount >= maxRetries}
                    className="flex-1 gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {retryCount >= maxRetries
                      ? "Max retries reached"
                      : "Try Again"}
                    {retryCount > 0 && ` (${retryCount}/${maxRetries})`}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/")}
                    className="flex-1 gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>
                </div>

                {/* Additional Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.handleReportIssue}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    Report Issue
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Page
                  </Button>
                </div>

                {/* Retry Info */}
                {retryCount > 0 && retryCount < maxRetries && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg"
                  >
                    You have {maxRetries - retryCount} attempt
                    {maxRetries - retryCount !== 1 ? "s" : ""} remaining. Retry
                    count will reset in 30 seconds.
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    return <>{children}</>;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
}

// Hook for manual error reporting
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || "unknown context"}:`, error);

    // You can integrate with error reporting service here
    // errorTrackingService.captureException(error, { context });
  }, []);

  return handleError;
}

// Async error boundary for handling promise rejections
export function AsyncErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      // You can show a toast notification here instead of throwing
      // throw new Error(`Unhandled promise rejection: ${event.reason}`);
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  return <>{children}</>;
}

export default ErrorBoundary;
