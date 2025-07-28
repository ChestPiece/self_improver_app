"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import {
  Target,
  TrendingUp,
  Calendar,
  Activity,
  Settings,
  Home,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Simple Theme Toggle Component (no dropdown)
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full p-2 rounded-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 bg-muted rounded-md animate-pulse" />
          <div className="flex-1 space-y-0.5">
            <div className="h-1.5 bg-muted rounded animate-pulse" />
            <div className="h-1 bg-muted/70 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  const getNextTheme = () => {
    if (theme === "light") return "dark";
    return "light";
  };

  const getThemeIcon = () => {
    if (theme === "light") return Sun;
    return Moon;
  };

  const getThemeLabel = () => {
    if (theme === "light") return "Light";
    return "Dark";
  };

  const ThemeIcon = getThemeIcon();

  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(getNextTheme())}
      className="w-full justify-start h-auto p-2 hover:bg-muted/50"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-0.5 rounded-md">
          <ThemeIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
          <div className="text-sm font-medium">Theme</div>
          <div className="text-xs text-muted-foreground leading-tight">
            {getThemeLabel()}
          </div>
        </div>
              </div>
    </Button>
  );
}

// Navigation data
const navigationData = {
  main: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      description: "Overview and insights",
    },
    {
      title: "Goals",
      url: "/goals",
      icon: Target,
      description: "Track your objectives",
    },
    {
      title: "Habits",
      url: "/habits",
      icon: Calendar,
      description: "Build daily routines",
    },
    {
      title: "Practices",
      url: "/practices",
      icon: Activity,
      description: "Guided exercises",
    },
    {
      title: "Progress",
      url: "/progress",
      icon: TrendingUp,
      description: "Analytics and reports",
    },
  ],
  account: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      description: "App preferences",
    },
  ],
};

// Clean Navigation Item Component (no tooltips, no orange backgrounds)
const NavigationItem = React.memo(function NavigationItem({
  item,
  isActive,
}: {
  item: (typeof navigationData.main)[0];
  isActive: boolean;
}) {
  return (
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link href={item.url}>
                <div
                  className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full",
              isActive ? "bg-muted text-foreground" : "hover:bg-muted/50"
                  )}
                >
            <div className="p-1 rounded-sm flex-shrink-0">
              <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
              <span className="font-medium text-sm leading-tight">
                      {item.title}
                    </span>
              <span className="text-xs text-muted-foreground leading-tight">
                      {item.description}
                    </span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
  );
});

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
  const pathname = usePathname();

  const isActivePath = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  return (
    <Sidebar {...props} className="border-r bg-background overflow-x-hidden">
      {/* Clean Header */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground font-bold text-sm">
            SI
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-foreground">
              Self Improver
            </h1>
            <p className="text-xs text-muted-foreground">Transform yourself</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Clean Content */}
      <SidebarContent className="px-3 py-4 overflow-x-hidden">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 px-2">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationData.main.map((item) => (
                <NavigationItem
                  key={item.url}
                  item={item}
                  isActive={isActivePath(item.url)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-5 mx-2" />

        {/* Account Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 px-2">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationData.account.map((item) => (
                <NavigationItem
                  key={item.url}
                  item={item}
                  isActive={isActivePath(item.url)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Compact Footer */}
      <SidebarFooter className="border-t p-2 overflow-x-hidden">
        <div className="space-y-1.5">
          <ThemeToggle />

          <div className="flex items-center justify-center">
            <Badge
              variant="outline"
              className="text-xs border-none bg-muted/50"
            >
              <Palette className="w-3 h-3 mr-1 text-muted-foreground" />
              v1.0.0
            </Badge>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
