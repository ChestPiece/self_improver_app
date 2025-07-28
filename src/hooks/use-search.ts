"use client";

import { useState, useEffect, useCallback } from "react";
import {
  searchUserData,
  getQuickActions,
  type SearchResult,
} from "@/lib/search/actions";

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  type: "action";
  url: string;
  icon: string;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Load quick actions on mount
  useEffect(() => {
    const loadQuickActions = async () => {
      try {
        const actions = await getQuickActions();
        setQuickActions(actions);
      } catch (error) {
        console.error("Failed to load quick actions:", error);
      }
    };
    loadQuickActions();
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const searchResults = await searchUserData(query);
          setResults(searchResults);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(value.length > 0);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const totalItems =
        results.length + (query.length < 2 ? quickActions.length : 0);

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0) {
            const allItems =
              query.length < 2 ? [...quickActions, ...results] : results;
            const selectedItem = allItems[selectedIndex];
            if (selectedItem) {
              window.location.href = selectedItem.url;
            }
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [results, quickActions, selectedIndex, query.length]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  const selectItem = useCallback(
    (item: SearchResult | QuickAction) => {
      window.location.href = item.url;
      clearSearch();
    },
    [clearSearch]
  );

  return {
    query,
    results,
    quickActions,
    isLoading,
    isOpen,
    selectedIndex,
    handleInputChange,
    handleKeyDown,
    clearSearch,
    selectItem,
    setIsOpen,
  };
}
