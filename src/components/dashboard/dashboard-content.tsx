"use client";

import { User } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { Goal, getCategoryInfo, calculateProgress } from "@/types/goals";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatsSkeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import ProgressCharts from "./progress-charts";
import { useMemo, Suspense } from "react";
import {
  Target,
  TrendingUp,
  Calendar,
  Star,
  Plus,
  Activity,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface DashboardContentProps {
  user: User;
  profile: Profile | null;
  goals: Goal[];
}

// Simple animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function DashboardContent({
  user,
  profile,
  goals = [],
}: DashboardContentProps) {
  // Memoized calculations for better performance
  const stats = useMemo(() => {
    const validGoals = goals.filter((g) => g && g.id);
    const activeGoals = validGoals.filter((g) => g.status === "active");
    const completedGoals = validGoals.filter((g) => g.status === "completed");
    const totalProgress = activeGoals.reduce((sum, goal) => {
      return sum + calculateProgress(goal.current_value, goal.target_value);
    }, 0);
    const avgProgress =
      activeGoals.length > 0 ? totalProgress / activeGoals.length : 0;

    return {
      total: validGoals.length,
      active: activeGoals.length,
      completed: completedGoals.length,
      avgProgress: Math.round(avgProgress),
      completionRate:
        validGoals.length > 0
          ? Math.round((completedGoals.length / validGoals.length) * 100)
          : 0,
    };
  }, [goals]);

  const recentGoals = useMemo(() => {
    return goals
      .filter((goal) => goal && goal.id && goal.created_at)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  }, [goals]);

  const upcomingDeadlines = useMemo(() => {
    return goals
      .filter((g) => g && g.id && g.target_date && g.status === "active")
      .sort(
        (a, b) =>
          new Date(a.target_date!).getTime() -
          new Date(b.target_date!).getTime()
      )
      .slice(0, 3);
  }, [goals]);

  if (!profile && goals.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <StatsSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Overview */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Goals */}
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Total Goals
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Active Goals
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.active}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completed Goals */}
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.completed}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Progress */}
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Avg Progress
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.avgProgress}%
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Recent Goals and Upcoming Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Goals */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Recent Goals
                  </CardTitle>
                  <Link href="/goals">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                    >
                      View All
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentGoals.length > 0 ? (
                  <div className="space-y-4">
                    {recentGoals.map((goal, index) => {
                      const categoryInfo = getCategoryInfo(goal.category);
                      const progress = calculateProgress(
                        goal.current_value,
                        goal.target_value
                      );

                      return (
                        <div
                          key={goal.id}
                          className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <categoryInfo.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-foreground truncate">
                                {goal.title}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {progress}%
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={progress}
                                className="flex-1 h-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(goal.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No goals yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first goal to get started!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingDeadlines.map((goal, index) => {
                      const categoryInfo = getCategoryInfo(goal.category);
                      const daysLeft = Math.ceil(
                        (new Date(goal.target_date!).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      const isOverdue = daysLeft < 0;

                      return (
                        <div
                          key={goal.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                            daysLeft <= 3
                              ? "border-rose-200 bg-rose-50/50 hover:bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20"
                              : daysLeft <= 7
                              ? "border-orange-200 bg-orange-50/50 hover:bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <categoryInfo.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-foreground truncate">
                                {goal.title}
                              </h4>
                              <Badge
                                variant={
                                  daysLeft <= 3
                                    ? "destructive"
                                    : daysLeft <= 7
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {daysLeft <= 0 ? "Overdue" : `${daysLeft} days`}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Due {formatRelativeTime(goal.target_date!)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No upcoming deadlines
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set target dates for your goals to track deadlines
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Progress Charts */}
        <motion.div variants={itemVariants}>
          <Suspense fallback={<StatsSkeleton />}>
            <ProgressCharts goals={goals} />
          </Suspense>
        </motion.div>
      </div>
    </motion.div>
  );
}
