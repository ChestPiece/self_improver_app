"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Clock, Filter, Play, Search, X } from "lucide-react";
import {
  PRACTICE_CATEGORIES,
  PREDEFINED_PRACTICES,
  DIFFICULTY_LEVELS,
  getCategoryInfo,
  getDifficultyInfo,
  PracticeCategory,
  DifficultyLevel,
} from "@/types/practices";
import PracticeCard from "./practice-card";
import PracticeSessionModal from "./practice-session-modal";

interface PracticesPageClientProps {
  user: User;
  initialFilters: {
    category: string;
    difficulty: string;
    search: string;
  };
}

interface PracticeData {
  id: string;
  title: string;
  description: string;
  category: PracticeCategory;
  duration: number;
  difficulty_level: DifficultyLevel;
  instructions: string[];
}

export default function PracticesPageClient({
  user,
  initialFilters,
}: PracticesPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(initialFilters);
  const [selectedPractice, setSelectedPractice] = useState<PracticeData | null>(
    null
  );
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Get highlighted practice from search results
  const highlightedPracticeId = searchParams.get("highlight");

  // Convert predefined practices to flat array with IDs
  const allPractices: PracticeData[] = useMemo(() => {
    return Object.entries(PREDEFINED_PRACTICES).flatMap(
      ([category, practices]) =>
        practices.map((practice, index) => ({
          ...practice,
          id: `${category}_${index}`,
          category: category as PracticeCategory,
        }))
    );
  }, []);

  // Filter practices based on current filters
  const filteredPractices = useMemo(() => {
    return allPractices.filter((practice) => {
      // Category filter
      if (
        filters.category !== "all" &&
        practice.category !== filters.category
      ) {
        return false;
      }

      // Difficulty filter
      if (
        filters.difficulty !== "all" &&
        practice.difficulty_level !== filters.difficulty
      ) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          practice.title.toLowerCase().includes(searchTerm) ||
          practice.description.toLowerCase().includes(searchTerm)
        );
      }

      return true;
    });
  }, [allPractices, filters]);

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update URL
    const params = new URLSearchParams(searchParams);
    if (updatedFilters.category !== "all")
      params.set("category", updatedFilters.category);
    else params.delete("category");
    if (updatedFilters.difficulty !== "all")
      params.set("difficulty", updatedFilters.difficulty);
    else params.delete("difficulty");
    if (updatedFilters.search) params.set("search", updatedFilters.search);
    else params.delete("search");

    router.push(`/practices?${params.toString()}`, { scroll: false });
  };

  const handleStartPractice = (practice: PracticeData) => {
    setSelectedPractice(practice);
    setIsSessionModalOpen(true);
  };

  const categoryStats = PRACTICE_CATEGORIES.map((category) => ({
    ...category,
    count: allPractices.filter((p) => p.category === category.id).length,
  }));

  return (
    <div className="flex flex-1 flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 sidebar-content-adjust">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="sidebar-squeeze"
          >
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              Practice Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover guided practices for mental health, physical wellness,
              and personal growth
            </p>
          </motion.div>
        </div>
      </div>

      {/* Category Overview */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-6 sidebar-content-adjust">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 sidebar-squeeze"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Practice Categories
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose a category to explore focused practices
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sidebar-squeeze">
            {categoryStats.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`bg-gradient-to-br ${
                    category.color
                  } border-primary/20 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/40 ${
                    filters.category === category.id
                      ? "ring-2 ring-primary shadow-lg"
                      : ""
                  }`}
                  onClick={() => updateFilters({ category: category.id })}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                          <category.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-lg mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary font-medium"
                        >
                          {category.count}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6 sidebar-content-adjust">
        <Card className="sidebar-squeeze">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search practices..."
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10 pr-10"
                />
                {filters.search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => updateFilters({ search: "" })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Category Filter */}
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilters({ category: value })}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {PRACTICE_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <category.icon className="h-4 w-4" /> {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select
                value={filters.difficulty}
                onValueChange={(value) => updateFilters({ difficulty: value })}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level.level} value={level.level}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practices Grid */}
      <main className="flex-1 container mx-auto px-4 pb-8 sidebar-content-adjust">
        {filteredPractices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 sidebar-squeeze"
          >
            <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No practices found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters to discover more practices.
            </p>
            <Button
              onClick={() =>
                setFilters({ category: "all", difficulty: "all", search: "" })
              }
              variant="outline"
            >
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sidebar-squeeze">
            {filteredPractices.map((practice, index) => (
              <motion.div
                key={practice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={
                  highlightedPracticeId === practice.id
                    ? "ring-2 ring-primary ring-offset-2 rounded-lg"
                    : ""
                }
              >
                <PracticeCard
                  practice={practice}
                  onStart={() => handleStartPractice(practice)}
                  isHighlighted={highlightedPracticeId === practice.id}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Practice Session Modal */}
      {selectedPractice && (
        <PracticeSessionModal
          practice={selectedPractice}
          isOpen={isSessionModalOpen}
          onClose={() => {
            setIsSessionModalOpen(false);
            setSelectedPractice(null);
          }}
          user={user}
        />
      )}
    </div>
  );
}
