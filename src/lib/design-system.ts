import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";

// Typography system
export const typography = {
  // Headlines
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  h5: "scroll-m-20 text-lg font-semibold tracking-tight",
  h6: "scroll-m-20 text-base font-semibold tracking-tight",

  // Body text
  body: "leading-7 [&:not(:first-child)]:mt-6",
  bodyLarge: "text-lg leading-7 [&:not(:first-child)]:mt-6",
  bodySmall: "text-sm leading-6 [&:not(:first-child)]:mt-4",

  // Display text
  display: "text-5xl font-bold tracking-tight lg:text-6xl xl:text-7xl",
  displayMedium: "text-4xl font-bold tracking-tight lg:text-5xl",
  displaySmall: "text-3xl font-bold tracking-tight lg:text-4xl",

  // Utility text
  lead: "text-xl text-muted-foreground",
  large: "text-lg font-semibold",
  small: "text-sm font-medium leading-none",
  muted: "text-sm text-muted-foreground",
  caption: "text-xs text-muted-foreground",

  // Code and monospace
  code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",

  // Interactive text
  link: "font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
  linkMuted: "text-muted-foreground hover:text-foreground transition-colors",
};

// Spacing system
export const spacing = {
  // Component spacing
  componentXs: "p-2",
  componentSm: "p-3",
  componentMd: "p-4",
  componentLg: "p-6",
  componentXl: "p-8",

  // Section spacing
  sectionXs: "py-8",
  sectionSm: "py-12",
  sectionMd: "py-16",
  sectionLg: "py-20",
  sectionXl: "py-24",

  // Container spacing
  containerXs: "px-4",
  containerSm: "px-6",
  containerMd: "px-8",
  containerLg: "px-12",

  // Stack spacing
  stackXs: "space-y-2",
  stackSm: "space-y-3",
  stackMd: "space-y-4",
  stackLg: "space-y-6",
  stackXl: "space-y-8",

  // Inline spacing
  inlineXs: "space-x-1",
  inlineSm: "space-x-2",
  inlineMd: "space-x-3",
  inlineLg: "space-x-4",
  inlineXl: "space-x-6",
};

// Layout components
export const layouts = {
  // Containers
  container: "container mx-auto px-4 sidebar-content-adjust",
  containerFluid: "w-full px-4 sidebar-content-adjust",

  // Flex layouts
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexStart: "flex items-center justify-start",
  flexEnd: "flex items-center justify-end",
  flexCol: "flex flex-col",
  flexColCenter: "flex flex-col items-center justify-center",

  // Grid layouts
  gridCols1: "grid grid-cols-1",
  gridCols2: "grid grid-cols-1 md:grid-cols-2",
  gridCols3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  gridCols4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  gridAuto: "grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]",

  // Dashboard specific
  dashboardGrid: "grid grid-cols-1 lg:grid-cols-3 gap-8",
  statsGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
  cardGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
};

// Visual hierarchy system
export const hierarchy = {
  // Elevation (shadows and borders)
  elevationNone: "",
  elevationSm: "shadow-sm border border-border/50",
  elevationMd: "shadow-md border border-border/30",
  elevationLg: "shadow-lg border border-border/20",
  elevationXl: "shadow-xl border border-border/10",

  // Focus states
  focusVisible:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  focusWithin:
    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",

  // Hover states
  hoverSoft: "hover:bg-muted/50 transition-colors",
  hoverAccent: "hover:bg-accent hover:text-accent-foreground transition-colors",
  hoverPrimary:
    "hover:bg-primary hover:text-primary-foreground transition-colors",
  hoverDestructive:
    "hover:bg-destructive hover:text-destructive-foreground transition-colors",

  // Interactive states
  interactiveSoft:
    "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring transition-all",
  interactiveAccent:
    "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring transition-all",
};

// Color system extensions - Only Black, White, Rose, Orange
export const colors = {
  // Rose theme variations
  rosePrimary: "bg-rose-500 text-white",
  roseSecondary:
    "bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-100",
  roseMuted: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  roseAccent: "bg-gradient-to-r from-rose-500 to-rose-600 text-white",

  // Orange theme variations
  orangePrimary: "bg-orange-500 text-white",
  orangeSecondary:
    "bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100",
  orangeMuted:
    "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  orangeAccent: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",

  // Status colors with rose/orange integration
  success:
    "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900 dark:text-rose-200",
  warning:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200",
  error:
    "bg-rose-200 text-rose-900 border-rose-300 dark:bg-rose-800 dark:text-rose-100",
  info: "bg-muted text-muted-foreground border-border",

  // Gradient backgrounds
  gradientRose:
    "bg-gradient-to-br from-rose-500/10 via-rose-400/10 to-rose-600/10",
  gradientOrange:
    "bg-gradient-to-br from-orange-500/10 via-orange-400/10 to-orange-600/10",
  gradientPrimary: "bg-gradient-to-br from-primary/10 to-accent/10",
  gradientMuted: "bg-gradient-to-br from-muted/50 to-muted/30",
};

// Animation presets for consistent motion
export const animations = {
  // Slide animations
  fadeIn: "animate-in fade-in duration-500",
  slideInUp: "animate-in slide-in-from-bottom-4 duration-500",
  slideInDown: "animate-in slide-in-from-top-4 duration-500",
  slideInLeft: "animate-in slide-in-from-left-4 duration-500",
  slideInRight: "animate-in slide-in-from-right-4 duration-500",
  scaleIn: "animate-in zoom-in-95 duration-300",

  // Exit
  fadeOut: "animate-out fade-out duration-300",
  slideOutUp: "animate-out slide-out-to-top-4 duration-300",
  slideOutDown: "animate-out slide-out-to-bottom-4 duration-300",
  slideOutLeft: "animate-out slide-out-to-left-4 duration-300",
  slideOutRight: "animate-out slide-out-to-right-4 duration-300",
  scaleOut: "animate-out zoom-out-95 duration-200",

  // Hover effects
  hoverScale: "hover:scale-105 transition-transform duration-200",
  hoverLift: "hover:-translate-y-1 transition-transform duration-200",
  hoverGlow:
    "hover:shadow-lg hover:shadow-primary/25 transition-shadow duration-300",
};

// Component variants
export const variants = {
  // Card variants
  cardDefault: cn(
    "rounded-lg border bg-card text-card-foreground shadow-sm",
    hierarchy.elevationSm,
    animations.hoverLift
  ),
  cardElevated: cn(
    "rounded-lg border bg-card text-card-foreground",
    hierarchy.elevationMd,
    animations.hoverGlow
  ),
  cardInteractive: cn(
    "rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer",
    hierarchy.interactiveSoft,
    animations.hoverScale
  ),
  cardGradient: cn(
    "rounded-lg border bg-gradient-to-br from-primary/5 to-accent/5 text-card-foreground shadow-sm",
    hierarchy.elevationSm
  ),

  // Button variants enhanced
  buttonPrimary: cn(
    "bg-gradient-to-r from-primary to-rose-500 text-white shadow-lg",
    "hover:from-primary/90 hover:to-rose-500/90",
    animations.hoverScale,
    hierarchy.focusVisible
  ),
  buttonSecondary: cn(
    "border border-input bg-background shadow-sm",
    hierarchy.hoverSoft,
    animations.hoverScale,
    hierarchy.focusVisible
  ),
  buttonGhost: cn(
    "hover:bg-accent hover:text-accent-foreground",
    animations.hoverScale,
    hierarchy.focusVisible
  ),

  // Badge variants
  badgeDefault:
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  badgeSuccess: cn(
    colors.success,
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  ),
  badgeWarning: cn(
    colors.warning,
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  ),
  badgeError: cn(
    colors.error,
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  ),
};

// Responsive utilities
export const responsive = {
  // Show/hide on breakpoints
  showOnMobile: "block md:hidden",
  hideOnMobile: "hidden md:block",
  showOnTablet: "hidden md:block lg:hidden",
  showOnDesktop: "hidden lg:block",

  // Text sizing
  textResponsive: "text-sm md:text-base lg:text-lg",
  headingResponsive: "text-2xl md:text-3xl lg:text-4xl",
  displayResponsive: "text-3xl md:text-4xl lg:text-5xl xl:text-6xl",

  // Spacing responsive
  paddingResponsive: "p-4 md:p-6 lg:p-8",
  marginResponsive: "m-4 md:m-6 lg:m-8",
  gapResponsive: "gap-4 md:gap-6 lg:gap-8",
};

// Accessibility utilities
export const accessibility = {
  // Screen reader
  srOnly: "sr-only",
  notSrOnly: "not-sr-only",

  // Focus management
  focusTrap:
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  skipLink:
    "absolute left-0 top-0 z-50 bg-background p-3 text-foreground transform -translate-y-full focus:translate-y-0 transition-transform",

  // High contrast
  highContrast: "high-contrast:border-2 high-contrast:border-current",

  // Reduced motion
  reducedMotion: "motion-reduce:animate-none motion-reduce:transition-none",
};

// Utility functions for building classes
export const buildComponent = (
  base: string,
  variants?: Record<string, string>,
  size?: string
) => {
  return cn(base, variants, size);
};

export const buildResponsive = (
  mobile: string,
  tablet?: string,
  desktop?: string
) => {
  return cn(mobile, tablet && `md:${tablet}`, desktop && `lg:${desktop}`);
};

// Theme utilities - Consistent Rose and Orange theme
export const theme = {
  // Rose theme specific classes
  roseTheme: {
    primary: "text-rose-600 dark:text-rose-400",
    background: "bg-rose-50 dark:bg-rose-950",
    border: "border-rose-200 dark:border-rose-800",
    accent: "bg-rose-100 dark:bg-rose-900",
  },

  // Orange theme specific classes
  orangeTheme: {
    primary: "text-orange-600 dark:text-orange-400",
    background: "bg-orange-50 dark:bg-orange-950",
    border: "border-orange-200 dark:border-orange-800",
    accent: "bg-orange-100 dark:bg-orange-900",
  },

  // Dynamic theme application
  applyTheme: (
    element: "primary" | "background" | "border" | "accent",
    variant: "rose" | "orange" = "rose"
  ) => {
    return variant === "rose"
      ? theme.roseTheme[element]
      : theme.orangeTheme[element];
  },
};
