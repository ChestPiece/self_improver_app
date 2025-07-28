import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/error-boundary";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Self Improver - Personal Growth & Habit Tracking",
  description:
    "Transform your life with personalized goals, guided practices, and powerful insights. Build better habits and achieve meaningful objectives on your personal growth journey.",
  keywords: [
    "self improvement",
    "habit tracking",
    "goal setting",
    "personal development",
    "mindfulness",
    "productivity",
  ],
  authors: [{ name: "Self Improver Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ErrorBoundary>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
