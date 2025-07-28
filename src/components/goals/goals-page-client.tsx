"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { Goal, GOAL_CATEGORIES, GOAL_STATUSES } from "@/types/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GoalCard from "@/components/goals/goal-card";
import CreateGoalModal from "@/components/goals/create-goal-modal";
import SmartGoalWizard from "@/components/goals/smart-goal-wizard";
import {
  Target,
  Plus,
  Search,
  Filter,
  Trophy,
  Clock,
  Pause,
  X,
  TrendingUp,
  Award,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface GoalsPageClientProps {
  goals: Goal[];
  user: User;
  initialFilters: {
    status: string;
    category: string;
    search: string;
  };
}

export default function GoalsPageClient({
  goals,
  user,
  initialFilters,
}: GoalsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSmartWizardOpen, setIsSmartWizardOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  // Get highlighted goal from search results
  const highlightedGoalId = searchParams.get("highlight");

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    const params = new URLSearchParams();
    if (updatedFilters.status !== "all")
      params.set("status", updatedFilters.status);
    if (updatedFilters.category !== "all")
      params.set("category", updatedFilters.category);
    if (updatedFilters.search) params.set("search", updatedFilters.search);

    router.push(`/goals${params.toString() ? `?${params.toString()}` : ""}`);
  };

  // Calculate stats
  const stats = {
    total: goals.length,
    active: goals.filter((g) => g.status === "active").length,
    completed: goals.filter((g) => g.status === "completed").length,
    paused: goals.filter((g) => g.status === "paused").length,
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 sidebar-content-adjust">
          <div className="flex items-center justify-between sidebar-squeeze">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                My Goals
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your progress and achieve your dreams
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsSmartWizardOpen(true)}
                className="gap-2 transition-all duration-200 hover:scale-105"
              >
                <Target className="h-4 w-4" />
                SMART Goal Wizard
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2 transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                Quick Create
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <Target className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">
                      Total Goals
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.active}</div>
                    <div className="text-sm text-muted-foreground">
                      Active Goals
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <Award className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.completed}</div>
                    <div className="text-sm text-muted-foreground">
                      Completed
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Pause className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Paused</p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.paused}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search goals..."
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="pl-10"
                  />
                  {filters.search && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => updateFilters({ search: "" })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilters({ status: value })}
              >
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {GOAL_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilters({ category: value })}
              >
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {GOAL_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      <div className="container mx-auto px-4 pb-8 sidebar-content-adjust">
        {goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first goal to start tracking your progress and
                  achieving your dreams.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={() => setIsSmartWizardOpen(true)}
                    className="gap-2"
                  >
                    <Target className="h-4 w-4" />
                    SMART Goal Wizard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Quick Create
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sidebar-squeeze">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={
                  highlightedGoalId === goal.id
                    ? "ring-2 ring-primary ring-offset-2 rounded-lg"
                    : ""
                }
              >
                <GoalCard
                  goal={goal}
                  isHighlighted={highlightedGoalId === goal.id}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* SMART Goal Wizard */}
      <SmartGoalWizard
        isOpen={isSmartWizardOpen}
        onClose={() => setIsSmartWizardOpen(false)}
      />
    </div>
  );
}
