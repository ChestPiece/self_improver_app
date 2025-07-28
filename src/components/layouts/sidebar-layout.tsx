"use client";

import { motion } from "framer-motion";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { logout } from "@/lib/auth/actions";
import {
  ChevronRight,
  Plus,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  user: User;
}

// Profile Dropdown Component
function ProfileDropdown({ user }: { user?: User }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userInitials = user.email?.[0]?.toUpperCase() || "U";
  const userName = user.email?.split("@")[0] || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-10 px-3 hover:bg-primary/10 transition-colors"
        >
          <Avatar className="w-8 h-8 border-2 border-primary/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-foreground">
              {userName}
            </span>
            <span className="text-xs text-muted-foreground">Profile</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 w-full">
            <UserIcon className="w-4 h-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2 w-full">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SidebarLayout({
  children,
  title,
  breadcrumbs = [],
  user,
}: SidebarLayoutProps) {
  const pathname = usePathname();

  // Auto-generate title and breadcrumbs based on pathname
  const getPageInfo = () => {
    const segments = pathname.split("/").filter(Boolean);
    const currentPage = segments[segments.length - 1] || "dashboard";

    const pageMap: Record<
      string,
      { title: string; breadcrumbs: { label: string; href?: string }[] }
    > = {
      dashboard: {
        title: "Dashboard",
        breadcrumbs: [{ label: "Dashboard" }],
      },
      goals: {
        title: "Goals",
        breadcrumbs: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Goals" },
        ],
      },
      practices: {
        title: "Practices",
        breadcrumbs: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Practices" },
        ],
      },
      progress: {
        title: "Progress",
        breadcrumbs: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Progress" },
        ],
      },
      habits: {
        title: "Habits",
        breadcrumbs: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Habits" },
        ],
      },
      profile: {
        title: "Profile",
        breadcrumbs: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile" },
        ],
      },
      settings: {
        title: "Settings",
        breadcrumbs: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ],
      },
    };

    return (
      pageMap[currentPage] || {
        title: "Self Improver",
        breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }],
      }
    );
  };

  const pageInfo = getPageInfo();
  const finalTitle = title || pageInfo.title;
  const finalBreadcrumbs =
    breadcrumbs.length > 0 ? breadcrumbs : pageInfo.breadcrumbs;

  return (
    <SidebarProvider className="h-screen">
      <AppSidebar user={user} />
      <SidebarInset className="flex flex-col h-full">
        {/* Beautiful Header */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 bg-background">
          <SidebarTrigger className="p-2 hover:bg-primary/10 hover:text-primary transition-colors rounded-lg" />
          <Separator orientation="vertical" className="h-4 bg-border/30" />

          {/* Enhanced Breadcrumbs */}
          <Breadcrumb>
            <BreadcrumbList>
              {finalBreadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && (
                    <BreadcrumbSeparator className="mx-2">
                      <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink
                        href={crumb.href}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-sm font-semibold text-foreground">
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Action Buttons and Profile */}
          <div className="ml-auto flex items-center gap-3">
            {/* Add Goal Button - only show on dashboard */}
            {pathname === "/dashboard" && (
              <Link href="/goals">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </Link>
            )}

            {/* Profile Dropdown */}
            <ProfileDropdown user={user} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 bg-background overflow-y-auto min-h-0">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
