import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2, Target, Activity, TrendingUp } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse" | "bars";
  className?: string;
  text?: string;
}

export function Loading({
  size = "md",
  variant = "spinner",
  className,
  text,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (variant === "spinner") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <Loader2
          className={cn("animate-spin text-primary", sizeClasses[size])}
        />
        {text && (
          <span className={cn("text-muted-foreground", textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(
                "bg-primary rounded-full",
                size === "sm"
                  ? "h-1 w-1"
                  : size === "md"
                  ? "h-2 w-2"
                  : "h-3 w-3"
              )}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        {text && (
          <span className={cn("text-muted-foreground ml-2", textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <motion.div
          className={cn("bg-primary rounded-full", sizeClasses[size])}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {text && (
          <span className={cn("text-muted-foreground", textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <div className="flex space-x-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={cn(
                "bg-primary",
                size === "sm"
                  ? "w-1 h-4"
                  : size === "md"
                  ? "w-1 h-6"
                  : "w-1.5 h-8"
              )}
              animate={{
                height: [
                  size === "sm" ? 16 : size === "md" ? 24 : 32,
                  size === "sm" ? 8 : size === "md" ? 12 : 16,
                  size === "sm" ? 16 : size === "md" ? 24 : 32,
                ],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
        {text && (
          <span className={cn("text-muted-foreground ml-2", textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return null;
}

// Page-specific loading components
export function PageLoading({ title }: { title?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[50vh] space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative">
          <motion.div
            className="h-16 w-16 rounded-full border-4 border-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        {title && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-medium text-muted-foreground"
          >
            Loading {title}...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export function FeatureLoading({
  icon: Icon = Activity,
  title,
  description,
}: {
  icon?: any;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-4"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="p-4 rounded-full bg-primary/10 border border-primary/20"
        >
          <Icon className="h-8 w-8 text-primary" />
        </motion.div>
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Loading variant="dots" size="sm" />
      </motion.div>
    </div>
  );
}

// Inline loading for buttons and small components
export function InlineLoading({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

// Overlay loading for modals and dialogs
export function OverlayLoading({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
    >
      <Loading variant="spinner" size="lg" text="Processing..." />
    </motion.div>
  );
}
