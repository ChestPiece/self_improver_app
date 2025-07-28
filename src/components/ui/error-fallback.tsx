import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  WifiOff,
  ServerCrash,
  Shield,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  variant?: "page" | "component" | "inline";
  title?: string;
  description?: string;
  showDetails?: boolean;
  className?: string;
}

export function ErrorFallback({
  error,
  resetError,
  variant = "component",
  title,
  description,
  showDetails = false,
  className,
}: ErrorFallbackProps) {
  const getErrorInfo = (error?: Error) => {
    if (!error) {
      return {
        icon: AlertTriangle,
        title: title || "Something went wrong",
        description: description || "An unexpected error occurred",
        suggestion: "Please try again later",
      };
    }

    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("fetch")) {
      return {
        icon: WifiOff,
        title: "Connection Error",
        description: "Unable to connect to the server",
        suggestion: "Check your internet connection and try again",
      };
    }

    if (message.includes("unauthorized") || message.includes("forbidden")) {
      return {
        icon: Shield,
        title: "Access Denied",
        description: "You don't have permission to access this resource",
        suggestion: "Please log in and try again",
      };
    }

    if (message.includes("server") || message.includes("500")) {
      return {
        icon: ServerCrash,
        title: "Server Error",
        description: "Our servers are experiencing issues",
        suggestion:
          "We're working to fix this. Please try again in a few minutes",
      };
    }

    return {
      icon: Bug,
      title: title || "Unexpected Error",
      description: description || error.message || "Something went wrong",
      suggestion: "Please report this issue if it persists",
    };
  };

  const errorInfo = getErrorInfo(error);
  const Icon = errorInfo.icon;

  if (variant === "inline") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "flex items-center gap-2 p-2 rounded-md bg-destructive/10 text-destructive text-sm",
          className
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{errorInfo.description}</span>
        {resetError && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetError}
            className="h-6 w-6 p-0 hover:bg-destructive/20"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </motion.div>
    );
  }

  if (variant === "page") {
    return (
      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center min-h-[50vh] p-8",
          className
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 max-w-md"
        >
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.5,
              times: [0, 0.2, 0.4, 0.6, 1],
            }}
            className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center"
          >
            <Icon className="h-10 w-10 text-destructive" />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {errorInfo.title}
            </h1>
            <p className="text-muted-foreground">{errorInfo.description}</p>
            <p className="text-sm text-muted-foreground">
              {errorInfo.suggestion}
            </p>
          </div>

          {showDetails && error && (
            <motion.details
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-left"
            >
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Show Error Details
              </summary>
              <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-32">
                {error.stack}
              </pre>
            </motion.details>
          )}

          <div className="flex gap-3 justify-center">
            {resetError && (
              <Button onClick={resetError} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Default component variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("w-full", className)}
    >
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Icon className="h-5 w-5" />
            {errorInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {errorInfo.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {errorInfo.suggestion}
          </p>

          {showDetails && error && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Error Details
              </summary>
              <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-24">
                {error.stack}
              </pre>
            </details>
          )}

          {resetError && (
            <Button onClick={resetError} size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Specific error components for common scenarios
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorFallback
      variant="component"
      title="Connection Lost"
      description="Unable to connect to the server"
      resetError={onRetry}
      error={new Error("Network error")}
    />
  );
}

export function NotFoundError({ resource = "page" }: { resource?: string }) {
  return (
    <ErrorFallback
      variant="page"
      title={`${
        resource.charAt(0).toUpperCase() + resource.slice(1)
      } Not Found`}
      description={`The ${resource} you're looking for doesn't exist or has been moved`}
    />
  );
}

export function LoadingError({
  onRetry,
  resource,
}: {
  onRetry?: () => void;
  resource?: string;
}) {
  return (
    <ErrorFallback
      variant="component"
      title="Loading Failed"
      description={`Failed to load ${resource || "data"}`}
      resetError={onRetry}
    />
  );
}
