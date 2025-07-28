"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Calendar,
  Target,
  Activity,
  Award,
  Flame,
  Clock,
  BarChart3,
  Users,
  Zap,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Goal, GOAL_CATEGORIES } from "@/types/goals";
import { formatDate } from "@/lib/utils";

interface ProgressPageClientProps {
  user: User;
  goals: Goal[];
  habits: any[];
  practiceSessions: any[];
}

export default function ProgressPageClient({
  user,
  goals,
  habits,
  practiceSessions,
}: ProgressPageClientProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "week" | "month" | "year"
  >("month");

  // Calculate comprehensive statistics based on selected timeframe
  const stats = useMemo(() => {
    const now = new Date();
    const getTimeframeCutoff = () => {
      switch (selectedTimeframe) {
        case "week":
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "month":
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case "year":
          return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    };

    const cutoff = getTimeframeCutoff();

    // Filter data based on timeframe
    const timeframeGoals = goals.filter(
      (goal) => new Date(goal.created_at) >= cutoff
    );
    const timeframeCompletedGoals = goals.filter(
      (g) => g.status === "completed" && new Date(g.updated_at) >= cutoff
    );
    const timeframePracticeSessions = practiceSessions.filter(
      (session) => new Date(session.completed_at) >= cutoff
    );

    // Goals statistics
    const totalGoals = timeframeGoals.length;
    const completedGoals = timeframeCompletedGoals.length;
    const activeGoals = timeframeGoals.filter(
      (g) => g.status === "active"
    ).length;
    const pausedGoals = timeframeGoals.filter(
      (g) => g.status === "paused"
    ).length;

    // Calculate progress for active goals
    const activeGoalsWithProgress = timeframeGoals.filter(
      (g) => g.status === "active" && g.target_value && g.current_value
    );
    const avgProgress =
      activeGoalsWithProgress.length > 0
        ? activeGoalsWithProgress.reduce(
            (sum, g) =>
              sum + ((g.current_value || 0) / (g.target_value || 1)) * 100,
            0
          ) / activeGoalsWithProgress.length
        : 0;

    // Habits statistics for timeframe
    const activeHabits = habits.filter(
      (h) =>
        new Date(h.created_at) >= cutoff ||
        (h.current_streak && h.current_streak > 0)
    );
    const bestStreak = Math.max(
      ...activeHabits.map((h) => h.best_streak || 0),
      0
    );
    const avgStreak =
      activeHabits.length > 0
        ? Math.round(
            activeHabits.reduce((sum, h) => sum + (h.current_streak || 0), 0) /
              activeHabits.length
          )
        : 0;

    // Practice statistics for timeframe
    const totalPracticeTime = timeframePracticeSessions.reduce(
      (sum, session) => sum + (session.duration || 0),
      0
    );
    const totalSessions = timeframePracticeSessions.length;

    // Achievement calculation (simplified)
    const achievements = [
      { name: "First Goal", earned: completedGoals > 0 },
      { name: "Goal Achiever", earned: completedGoals >= 5 },
      { name: "Consistent", earned: bestStreak >= 7 },
      { name: "Dedicated", earned: totalPracticeTime >= 300 },
    ];

    return {
      goals: {
        total: totalGoals,
        completed: completedGoals,
        active: activeGoals,
        paused: pausedGoals,
        completionRate:
          totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
        avgProgress: Math.round(avgProgress),
      },
      habits: {
        total: activeHabits.length,
        avgStreak,
        bestStreak,
      },
      practices: {
        totalTime: totalPracticeTime,
        totalSessions,
        avgSessionTime:
          totalSessions > 0 ? Math.round(totalPracticeTime / totalSessions) : 0,
      },
      achievements: achievements.filter((a) => a.earned).length,
      totalAchievements: achievements.length,
    };
  }, [goals, habits, practiceSessions, selectedTimeframe]);

  // Dynamic activity data based on selected timeframe
  const activityData = useMemo(() => {
    const periods = [];
    const now = new Date();

    const periodsCount =
      selectedTimeframe === "week"
        ? 7
        : selectedTimeframe === "month"
        ? 30
        : 12;
    const periodUnit = selectedTimeframe === "year" ? "month" : "day";

    for (let i = periodsCount - 1; i >= 0; i--) {
      const date = new Date(now);

      if (selectedTimeframe === "year") {
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const periodGoals = goals.filter((goal) => {
          if (goal.status !== "completed") return false;
          const goalDate = new Date(goal.updated_at);
          return goalDate >= monthStart && goalDate <= monthEnd;
        }).length;

        const periodPractices = practiceSessions.filter((session) => {
          const sessionDate = new Date(session.completed_at);
          return sessionDate >= monthStart && sessionDate <= monthEnd;
        }).length;

        periods.push({
          date: monthStart.toISOString(),
          label: monthStart.toLocaleDateString("en-US", { month: "short" }),
          goals: periodGoals,
          practices: periodPractices,
          total: periodGoals + periodPractices,
        });
      } else {
        date.setDate(date.getDate() - i);

        const periodGoals = goals.filter((goal) => {
          if (goal.status !== "completed") return false;
          const goalDate = new Date(goal.updated_at);
          return goalDate.toDateString() === date.toDateString();
        }).length;

        const periodPractices = practiceSessions.filter((session) => {
          const sessionDate = new Date(session.completed_at);
          return sessionDate.toDateString() === date.toDateString();
        }).length;

        periods.push({
          date: date.toISOString(),
          label:
            selectedTimeframe === "week"
              ? date.toLocaleDateString("en-US", { weekday: "short" })
              : date.getDate().toString(),
          goals: periodGoals,
          practices: periodPractices,
          total: periodGoals + periodPractices,
        });
      }
    }
    return periods;
  }, [goals, practiceSessions, selectedTimeframe]);

  const maxActivity = Math.max(...activityData.map((d) => d.total), 1);

  // Category breakdown for current timeframe
  const categoryBreakdown = useMemo(() => {
    const cutoff = (() => {
      const now = new Date();
      switch (selectedTimeframe) {
        case "week":
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "month":
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case "year":
          return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    })();

    const timeframeGoals = goals.filter(
      (goal) => new Date(goal.created_at) >= cutoff
    );

    const breakdown = GOAL_CATEGORIES.map((category) => {
      const categoryGoals = timeframeGoals.filter(
        (g) => g.category === category.value
      );
      const completed = categoryGoals.filter(
        (g) => g.status === "completed"
      ).length;
      return {
        ...category,
        total: categoryGoals.length,
        completed,
        percentage:
          categoryGoals.length > 0
            ? Math.round((completed / categoryGoals.length) * 100)
            : 0,
      };
    }).filter((item) => item.total > 0);

    return breakdown;
  }, [goals, selectedTimeframe]);

  const getTimeframeLabel = () => {
    switch (selectedTimeframe) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      default:
        return "This Month";
    }
  };

  const getActivityLabel = () => {
    switch (selectedTimeframe) {
      case "week":
        return "Daily Activity";
      case "month":
        return "Daily Activity";
      case "year":
        return "Monthly Activity";
      default:
        return "Daily Activity";
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-gradient-to-r from-primary/5 via-rose-500/5 to-pink-500/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 sidebar-content-adjust">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between sidebar-squeeze"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-rose-500 text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                Progress Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your journey and celebrate your achievements -{" "}
                {getTimeframeLabel()}
              </p>
            </div>

            {/* Enhanced Timeframe Selector */}
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
              {(["week", "month", "year"] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`capitalize transition-all duration-300 ${
                    selectedTimeframe === timeframe
                      ? "bg-gradient-to-r from-primary to-rose-500 text-white shadow-lg scale-105"
                      : "hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 sidebar-content-adjust">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              Goals
            </TabsTrigger>
            <TabsTrigger
              value="habits"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              Habits
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 via-rose-500/10 to-pink-500/10 border-primary/20 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/20">
                        <Target className="h-4 w-4" />
                      </div>
                      Goal Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stats.goals.completionRate}%
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {stats.goals.completed} of {stats.goals.total} completed
                    </div>
                    <div className="space-y-2">
                      <Progress
                        value={stats.goals.completionRate}
                        className="h-2 bg-primary/10"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Active: {stats.goals.active}</span>
                        <span>Avg: {stats.goals.avgProgress}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/20 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-orange-500/20">
                        <Flame className="h-4 w-4" />
                      </div>
                      Best Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                      {stats.habits.bestStreak}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      days in a row
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-orange-100 dark:bg-orange-900/20 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (stats.habits.bestStreak / 30) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Avg: {stats.habits.avgStreak}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200/20 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-500/20">
                        <Clock className="h-4 w-4" />
                      </div>
                      Practice Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {Math.round(stats.practices.totalTime / 60)}h
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {stats.practices.totalSessions} sessions
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Avg/session: {stats.practices.avgSessionTime}m
                      </span>
                      <div className="flex items-center gap-1">
                        {stats.practices.totalSessions > 0 ? (
                          <ChevronUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/20 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-green-500/20">
                        <Award className="h-4 w-4" />
                      </div>
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {stats.achievements}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      of {stats.totalAchievements} earned
                    </div>
                    <Progress
                      value={
                        (stats.achievements / stats.totalAchievements) * 100
                      }
                      className="h-2 bg-green-100 dark:bg-green-900/20"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Enhanced Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-card to-muted/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/20">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    {getActivityLabel()} - {getTimeframeLabel()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityData.map((period, index) => (
                      <motion.div
                        key={period.date}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="w-12 text-sm font-medium text-center bg-muted/50 rounded-md py-1">
                          {period.label}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 bg-muted/30 rounded-full h-6 overflow-hidden relative">
                              <motion.div
                                className="h-full bg-gradient-to-r from-primary via-rose-500 to-pink-500 rounded-full shadow-inner"
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${Math.max(
                                    (period.total / maxActivity) * 100,
                                    period.total > 0 ? 5 : 0
                                  )}%`,
                                }}
                                transition={{
                                  duration: 0.8,
                                  delay: index * 0.1,
                                }}
                              />
                              {period.total > 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white/90">
                                  {period.total}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              Goals: {period.goals}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                              Practices: {period.practices}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Goal Category Breakdown */}
              <Card className="bg-gradient-to-br from-card to-muted/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/20">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    Goal Categories - {getTimeframeLabel()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryBreakdown.length > 0 ? (
                      categoryBreakdown.map((category, index) => (
                        <motion.div
                          key={category.value}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="space-y-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-rose-500/5 border border-primary/10"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-primary/20">
                                <category.icon className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-semibold text-foreground">
                                {category.label}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-muted-foreground">
                              {category.completed}/{category.total}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex-1 bg-muted/30 rounded-full h-3 overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-primary to-rose-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${category.percentage}%` }}
                                transition={{
                                  duration: 0.8,
                                  delay: index * 0.1,
                                }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground text-right">
                              {category.percentage}% completed
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No goals in this timeframe</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Recent Goal Completions */}
              <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-green-500/20">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    Recent Completions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {goals
                      .filter((g) => g.status === "completed")
                      .slice(0, 5)
                      .map((goal, index) => (
                        <motion.div
                          key={goal.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/20 hover:shadow-md transition-all"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate text-foreground">
                              {goal.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Completed {formatDate(goal.updated_at)}
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            ✓
                          </Badge>
                        </motion.div>
                      ))}

                    {goals.filter((g) => g.status === "completed").length ===
                      0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No completed goals yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Habits Tab */}
          <TabsContent value="habits" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Habit Statistics */}
              <Card className="bg-gradient-to-br from-rose-500/5 to-pink-500/5 border-rose-200/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-500/20">
                      <Flame className="h-5 w-5 text-rose-600" />
                    </div>
                    Habit Statistics - {getTimeframeLabel()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-200/20">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-2">
                            {stats.habits.total}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Active Habits
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/20">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                            {stats.habits.avgStreak}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avg Streak
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="pt-2">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-rose-500"></div>
                        Best Streak: {stats.habits.bestStreak} days
                      </h4>
                      <Progress
                        value={Math.min(
                          (stats.habits.bestStreak / 30) * 100,
                          100
                        )}
                        className="h-3 bg-rose-100 dark:bg-rose-900/20"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Habit Performance */}
              <Card className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-200/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-500/20">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    Top Performing Habits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {habits
                      .sort(
                        (a, b) =>
                          (b.current_streak || 0) - (a.current_streak || 0)
                      )
                      .slice(0, 5)
                      .map((habit, index) => (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-200/20 hover:shadow-md transition-all"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm">
                            <Flame className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate text-foreground">
                              {habit.name || habit.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Best: {habit.best_streak || 0} days
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                          >
                            {habit.current_streak || 0}
                          </Badge>
                        </motion.div>
                      ))}

                    {habits.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No habits tracked yet</p>
                        <p className="text-xs mt-1">
                          Build consistency with daily habits!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* First Goal Achievement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card
                  className={`bg-gradient-to-br ${
                    stats.goals.completed > 0
                      ? "from-rose-500/10 to-pink-500/10 border-rose-200/20"
                      : "from-muted/20 to-muted/30 border-muted-foreground/20 opacity-60"
                  } hover:shadow-lg transition-all duration-300`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          stats.goals.completed > 0
                            ? "bg-rose-500/20"
                            : "bg-muted/50"
                        }`}
                      >
                        <span className="text-2xl">🎯</span>
                      </div>
                      First Goal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete your first goal
                    </p>
                    <Badge
                      variant={
                        stats.goals.completed > 0 ? "default" : "secondary"
                      }
                      className={
                        stats.goals.completed > 0
                          ? "bg-rose-500 text-white"
                          : ""
                      }
                    >
                      {stats.goals.completed > 0 ? "Earned ✓" : "Not earned"}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Goal Achiever */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card
                  className={`bg-gradient-to-br ${
                    stats.goals.completed >= 5
                      ? "from-rose-500/10 to-pink-500/10 border-rose-200/20"
                      : "from-muted/20 to-muted/30 border-muted-foreground/20 opacity-60"
                  } hover:shadow-lg transition-all duration-300`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          stats.goals.completed >= 5
                            ? "bg-rose-500/20"
                            : "bg-muted/50"
                        }`}
                      >
                        <span className="text-2xl">🏆</span>
                      </div>
                      Goal Achiever
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete 5 goals ({stats.goals.completed}/5)
                    </p>
                    <div className="space-y-2">
                      <Progress
                        value={Math.min((stats.goals.completed / 5) * 100, 100)}
                        className="h-2 bg-rose-100 dark:bg-rose-900/20"
                      />
                      <Badge
                        variant={
                          stats.goals.completed >= 5 ? "default" : "secondary"
                        }
                        className={
                          stats.goals.completed >= 5
                            ? "bg-rose-500 text-white"
                            : ""
                        }
                      >
                        {stats.goals.completed >= 5 ? "Earned ✓" : "Not earned"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Consistency Champion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card
                  className={`bg-gradient-to-br ${
                    stats.habits.bestStreak >= 7
                      ? "from-orange-500/10 to-red-500/10 border-orange-200/20"
                      : "from-muted/20 to-muted/30 border-muted-foreground/20 opacity-60"
                  } hover:shadow-lg transition-all duration-300`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          stats.habits.bestStreak >= 7
                            ? "bg-orange-500/20"
                            : "bg-muted/50"
                        }`}
                      >
                        <span className="text-2xl">🔥</span>
                      </div>
                      Consistent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Maintain a 7-day streak ({stats.habits.bestStreak}/7)
                    </p>
                    <div className="space-y-2">
                      <Progress
                        value={Math.min(
                          (stats.habits.bestStreak / 7) * 100,
                          100
                        )}
                        className="h-2 bg-orange-100 dark:bg-orange-900/20"
                      />
                      <Badge
                        variant={
                          stats.habits.bestStreak >= 7 ? "default" : "secondary"
                        }
                        className={
                          stats.habits.bestStreak >= 7
                            ? "bg-orange-500 text-white"
                            : ""
                        }
                      >
                        {stats.habits.bestStreak >= 7
                          ? "Earned ✓"
                          : "Not earned"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Dedicated Practitioner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card
                  className={`bg-gradient-to-br ${
                    stats.practices.totalTime >= 300
                      ? "from-blue-500/10 to-purple-500/10 border-blue-200/20"
                      : "from-muted/20 to-muted/30 border-muted-foreground/20 opacity-60"
                  } hover:shadow-lg transition-all duration-300`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          stats.practices.totalTime >= 300
                            ? "bg-blue-500/20"
                            : "bg-muted/50"
                        }`}
                      >
                        <span className="text-2xl">🧘‍♀️</span>
                      </div>
                      Dedicated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete 5 hours of practice (
                      {Math.round(stats.practices.totalTime / 60)}/5h)
                    </p>
                    <div className="space-y-2">
                      <Progress
                        value={Math.min(
                          (stats.practices.totalTime / 300) * 100,
                          100
                        )}
                        className="h-2 bg-blue-100 dark:bg-blue-900/20"
                      />
                      <Badge
                        variant={
                          stats.practices.totalTime >= 300
                            ? "default"
                            : "secondary"
                        }
                        className={
                          stats.practices.totalTime >= 300
                            ? "bg-blue-500 text-white"
                            : ""
                        }
                      >
                        {stats.practices.totalTime >= 300
                          ? "Earned ✓"
                          : "Not earned"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Achievement Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="md:col-span-2 lg:col-span-2"
              >
                <Card className="bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-purple-500/10 border-rose-200/20 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20">
                        <Award className="h-6 w-6 text-rose-600" />
                      </div>
                      Achievement Progress Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-2">
                          {stats.achievements}
                        </div>
                        <div className="text-lg text-muted-foreground">
                          of {stats.totalAchievements} achievements earned
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Progress</span>
                          <span>
                            {Math.round(
                              (stats.achievements / stats.totalAchievements) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (stats.achievements / stats.totalAchievements) * 100
                          }
                          className="h-4 bg-rose-100 dark:bg-rose-900/20"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-xl font-bold text-rose-600">
                            {stats.goals.completed}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Goals Completed
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-600">
                            {stats.habits.bestStreak}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Best Streak
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
