"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Target,
  Activity,
  Calendar,
  Loader2,
  ArrowRight,
  Hash,
  Command,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Mock search hook - you can replace this with your actual search implementation
function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Mock quick actions
  useEffect(() => {
    setQuickActions([
      {
        id: "new-goal",
        title: "Create New Goal",
        url: "/goals",
        icon: Target,
        type: "action",
      },
      {
        id: "new-habit",
        title: "Add Habit",
        url: "/habits",
        icon: Calendar,
        type: "action",
      },
      {
        id: "start-practice",
        title: "Start Practice",
        url: "/practices",
        icon: Activity,
        type: "action",
      },
    ]);
  }, []);

  // Mock search function - replace with actual search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const mockResults = [
        {
          id: "1",
          title: "Daily Exercise",
          type: "goal",
          url: "/goals?highlight=1",
          category: "health",
        },
        {
          id: "2",
          title: "Morning Meditation",
          type: "habit",
          url: "/habits?highlight=2",
          category: "mindfulness",
        },
        {
          id: "3",
          title: "Breathing Exercise",
          type: "practice",
          url: "/practices?highlight=3",
          category: "wellness",
        },
      ].filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(mockResults);
      setIsLoading(false);
    }, 300);
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        performSearch(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setIsOpen(true);
      setSelectedIndex(-1);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalItems = query ? results.length : quickActions.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const items = query ? results : quickActions;
        const selectedItem = items[selectedIndex];
        if (selectedItem?.url) {
          window.location.href = selectedItem.url;
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    },
    [selectedIndex, results, quickActions, query]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  const selectItem = useCallback((item: any) => {
    if (item.url) {
      window.location.href = item.url;
    }
    setIsOpen(false);
  }, []);

  return {
    query,
    results,
    quickActions,
    isLoading,
    isOpen,
    selectedIndex,
    setIsOpen,
    handleInputChange,
    handleKeyDown,
    clearSearch,
    selectItem,
  };
}

export function SearchForm({ ...props }: React.ComponentProps<"div">) {
  const {
    query,
    results,
    quickActions,
    isLoading,
    isOpen,
    selectedIndex,
    setIsOpen,
    handleInputChange,
    handleKeyDown,
    clearSearch,
    selectItem,
  } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        resultsRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const getItemIcon = (type: string) => {
    switch (type) {
      case "goal":
        return Target;
      case "habit":
        return Calendar;
      case "practice":
        return Activity;
      default:
        return Search;
    }
  };

  const displayItems = query ? results : quickActions;

  return (
    <div className="relative w-full" {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search goals, habits, practices...
          </Label>
          <SidebarInput
            ref={inputRef}
            id="search"
            placeholder="Search goals, habits, practices..."
            className="pl-10 pr-12 bg-background/60 border-border focus:border-primary/50 focus:ring-primary/20 hover:bg-background/80 transition-colors rounded-lg"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
          />
          <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            <Search className="size-4 text-muted-foreground/60" />
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}

          {/* Keyboard shortcut hint */}
          {!query && !isOpen && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Badge
                variant="secondary"
                className="text-xs bg-muted/80 text-muted-foreground px-1 py-0.5"
              >
                <Command className="h-2.5 w-2.5 mr-1" />K
              </Badge>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Search Results */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              duration: 0.2,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="absolute top-full mt-2 w-full z-50"
          >
            <Card className="shadow-2xl border-border/50 bg-background/95 backdrop-blur-xl rounded-xl overflow-hidden">
              <CardContent className="p-0">
                {/* Quick Actions / Search Results */}
                {displayItems.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {!query && (
                      <div className="px-4 py-3 text-xs font-semibold text-primary/80 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/30">
                        ⚡ Quick Actions
                      </div>
                    )}

                    {query && (
                      <div className="px-4 py-3 text-xs font-semibold text-primary/80 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/30">
                        🔍 Search Results ({displayItems.length})
                      </div>
                    )}

                    {displayItems.map((item, index) => {
                      const Icon = getItemIcon(item.type);
                      const isSelected = index === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                            isSelected
                              ? "bg-primary/10 text-primary border-l-2 border-primary"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => selectItem(item)}
                        >
                          <div
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              isSelected
                                ? "bg-primary/20 text-primary"
                                : "bg-muted/70 text-muted-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {item.title}
                            </div>
                            {item.category && (
                              <div className="text-xs text-muted-foreground">
                                in {item.category}
                              </div>
                            )}
                          </div>

                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs py-1 px-2",
                              isSelected
                                ? "bg-primary/15 text-primary border-primary/30"
                                : ""
                            )}
                          >
                            {item.type}
                          </Badge>

                          {isSelected && (
                            <ArrowRight className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : query && !isLoading ? (
                  <div className="px-4 py-6 text-center text-muted-foreground">
                    <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No results found for "{query}"</p>
                    <p className="text-xs mt-1 opacity-70">
                      Try different keywords
                    </p>
                  </div>
                ) : !query ? (
                  <div className="px-4 py-4 text-center text-muted-foreground">
                    <div className="space-y-2">
                      <p className="text-xs">Start typing to search...</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        <Badge variant="outline" className="text-xs">
                          Goals
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Habits
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Practices
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Footer */}
                {displayItems.length > 0 && (
                  <>
                    <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="px-4 py-3 text-xs text-muted-foreground bg-gradient-to-r from-muted/10 via-muted/20 to-muted/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 bg-background border border-border/50 rounded text-xs">
                            ↑↓
                          </kbd>
                          <span>navigate</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 bg-background border border-border/50 rounded text-xs">
                            Enter
                          </kbd>
                          <span>select</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
