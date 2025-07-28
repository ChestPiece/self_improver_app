"use client";

import React from "react";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Target,
  Calendar,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ErrorBoundary from "@/components/error-boundary";

interface FeatureErrorFallbackProps {
  error: Error;
  resetError: () => void;
  featureName: string;
  featureIcon: React.ReactNode;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function FeatureErrorFallback({
  error,
  resetError,
  featureName,
  featureIcon,
  description,
  actionLabel = "Go to Dashboard",
  onAction,
}: FeatureErrorFallbackProps) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="flex items-center justify-center p-8 min-h-[400px]">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
            {featureIcon}
          </div>
          <CardTitle className="text-lg">
            {featureName} Temporarily Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{description}</AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={resetError} size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={handleAction}
              size="sm"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              {actionLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Goals Feature Error Boundary
export function GoalsErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <FeatureErrorFallback
          error={error}
          resetError={resetError}
          featureName="Goals"
          featureIcon={<Target className="h-6 w-6 text-destructive" />}
          description="There was an issue loading your goals. This might be temporary - please try again."
          onAction={() => window.location.reload()}
          actionLabel="Refresh Page"
        />
      )}
      onError={(error, errorInfo) => {
        console.error("Goals Error:", error, errorInfo);
        // Could send to error tracking service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Habits Feature Error Boundary
export function HabitsErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <FeatureErrorFallback
          error={error}
          resetError={resetError}
          featureName="Habits"
          featureIcon={<Calendar className="h-6 w-6 text-destructive" />}
          description="We're having trouble loading your habits. Your data is safe - please try again."
          onAction={() => window.location.reload()}
          actionLabel="Refresh Page"
        />
      )}
      onError={(error, errorInfo) => {
        console.error("Habits Error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Practices Feature Error Boundary
export function PracticesErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <FeatureErrorFallback
          error={error}
          resetError={resetError}
          featureName="Practices"
          featureIcon={<Activity className="h-6 w-6 text-destructive" />}
          description="The practice library couldn't load properly. Please try refreshing the page."
          onAction={() => window.location.reload()}
          actionLabel="Refresh Page"
        />
      )}
      onError={(error, errorInfo) => {
        console.error("Practices Error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Data Loading Error Boundary (for async operations)
export function DataErrorBoundary({
  children,
  fallbackMessage = "We're having trouble loading your data right now.",
}: {
  children: React.ReactNode;
  fallbackMessage?: string;
}) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="p-6 text-center">
          <Alert className="max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              {fallbackMessage}
            </AlertDescription>
          </Alert>
          <Button
            onClick={resetError}
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Form Error Boundary (for form submissions)
export function FormErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <Alert className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            There was an issue with the form. Please refresh the page and try
            again.
            <Button
              onClick={resetError}
              variant="outline"
              size="sm"
              className="ml-2 gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </Button>
          </AlertDescription>
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
