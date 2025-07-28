import { toast } from "sonner";

// Error types for better categorization
export enum ErrorType {
  NETWORK = "NETWORK",
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  SERVER = "SERVER",
  CLIENT = "CLIENT",
  UNKNOWN = "UNKNOWN",
}

// Standard error interface
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

// Create standardized error
export function createAppError(
  type: ErrorType,
  message: string,
  code?: string,
  details?: any
): AppError {
  return {
    type,
    message,
    code,
    details,
    timestamp: new Date(),
  };
}

// Parse error from different sources
export function parseError(error: any): AppError {
  // Handle network errors
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return createAppError(
      ErrorType.NETWORK,
      "Network connection issue. Please check your internet connection.",
      "NETWORK_ERROR",
      error
    );
  }

  // Handle Supabase errors
  if (error.code) {
    switch (error.code) {
      case "PGRST116":
        return createAppError(
          ErrorType.AUTHENTICATION,
          "Please log in to continue.",
          error.code,
          error
        );
      case "23505":
        return createAppError(
          ErrorType.VALIDATION,
          "This item already exists.",
          error.code,
          error
        );
      case "PGRST301":
        return createAppError(
          ErrorType.AUTHORIZATION,
          "You don't have permission to perform this action.",
          error.code,
          error
        );
      default:
        return createAppError(
          ErrorType.SERVER,
          "A server error occurred. Please try again.",
          error.code,
          error
        );
    }
  }

  // Handle validation errors
  if (error.issues || error.errors) {
    const issues = error.issues || error.errors;
    const message = Array.isArray(issues)
      ? issues.map((issue) => issue.message).join(", ")
      : "Validation failed";

    return createAppError(
      ErrorType.VALIDATION,
      message,
      "VALIDATION_ERROR",
      error
    );
  }

  // Handle standard errors
  if (error instanceof Error) {
    return createAppError(ErrorType.CLIENT, error.message, error.name, error);
  }

  // Unknown error
  return createAppError(
    ErrorType.UNKNOWN,
    "An unexpected error occurred. Please try again.",
    "UNKNOWN_ERROR",
    error
  );
}

// Async operation wrapper with error handling
export async function handleAsync<T>(
  operation: () => Promise<T>,
  options?: {
    onError?: (error: AppError) => void;
    showToast?: boolean;
    fallbackValue?: T;
  }
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (rawError) {
    const error = parseError(rawError);

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("Async operation error:", error, rawError);
    }

    // Show toast notification if enabled
    if (options?.showToast !== false) {
      toast.error(error.message);
    }

    // Call custom error handler
    options?.onError?.(error);

    return {
      data: options?.fallbackValue || null,
      error,
    };
  }
}

// Server action wrapper with consistent error handling
export function withErrorHandling<T extends any[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (
    ...args: T
  ): Promise<{ data?: R; error?: string; success?: string }> => {
    try {
      const result = await action(...args);

      // Handle server action response format
      if (typeof result === "object" && result !== null) {
        if ("error" in result) {
          return { error: result.error as string };
        }
        if ("success" in result) {
          return { success: result.success as string, data: result };
        }
      }

      return { data: result };
    } catch (rawError) {
      const error = parseError(rawError);

      // Log error in development
      if (process.env.NODE_ENV === "development") {
        console.error("Server action error:", error, rawError);
      }

      return { error: error.message };
    }
  };
}

// Retry mechanism for failed operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}

// Error reporting (placeholder for external service integration)
export function reportError(error: AppError, context?: any) {
  // In production, you could send to external error tracking service
  // Examples: Sentry, LogRocket, Bugsnag, etc.

  if (process.env.NODE_ENV === "development") {
    console.error("Error Report:", error, context);
  }

  // Example implementation for production:
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, {
  //     tags: { type: error.type },
  //     extra: { context, details: error.details }
  //   });
  // }
}

// User-friendly error messages
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return "Connection issue - please check your internet and try again.";
    case ErrorType.AUTHENTICATION:
      return "Please log in to continue.";
    case ErrorType.AUTHORIZATION:
      return "You don't have permission for this action.";
    case ErrorType.VALIDATION:
      return error.message; // Validation messages are already user-friendly
    case ErrorType.SERVER:
      return "Server temporarily unavailable. Please try again in a moment.";
    default:
      return "Something unexpected happened. Please try again.";
  }
}

// Form error handler
export function handleFormError(error: any) {
  const appError = parseError(error);
  const message = getUserFriendlyMessage(appError);

  toast.error(message);
  reportError(appError, { source: "form_submission" });

  return appError;
}

// Data loading error handler
export function handleDataError(error: any, context: string) {
  const appError = parseError(error);

  // Don't show toast for data loading errors, just log them
  reportError(appError, { source: "data_loading", context });

  return appError;
}
