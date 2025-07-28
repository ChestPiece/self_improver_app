"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Calendar,
  Target,
  Activity,
  Award,
  Flame,
} from "lucide-react";
import { Goal } from "@/types/goals";
import { formatDate } from "@/lib/utils";

interface ProgressChartsProps {
  goals: Goal[];
}

export default function ProgressCharts({ goals = [] }: ProgressChartsProps) {
  // Calculate weekly progress data
  const getWeeklyProgress = () => {
    const today = new Date();
    const weekDays = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const completedGoals = goals.filter((goal) => {
        if (!goal || !goal.id || goal.status !== "completed") return false; // Add safety checks
        const goalDate = new Date(goal.updated_at);
        return goalDate.toDateString() === date.toDateString();
      }).length;

      weekDays.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.toDateString(),
        completed: completedGoals,
        isToday: date.toDateString() === today.toDateString(),
      });
    }

    return weekDays;
  };

  // Calculate category distribution
  const getCategoryStats = () => {
    const validGoals = goals.filter((goal) => goal && goal.id); // Filter valid goals
    const categories = validGoals.reduce((acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = validGoals.length;
    return Object.entries(categories).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  };

  // Calculate streak
  const getCurrentStreak = () => {
    const completedGoals = goals
      .filter((g) => g.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const hasCompletion = completedGoals.some((goal) => {
        const goalDate = new Date(goal.updated_at);
        return goalDate.toDateString() === checkDate.toDateString();
      });

      if (hasCompletion) {
        streak = i + 1;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  };

  const weeklyData = getWeeklyProgress();
  const categoryStats = getCategoryStats();
  const currentStreak = getCurrentStreak();
  const maxWeeklyCompleted = Math.max(...weeklyData.map((d) => d.completed), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    day.isToday
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="w-8 text-sm font-medium">{day.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-primary/80"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              (day.completed / maxWeeklyCompleted) * 100
                            }%`,
                          }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6">
                        {day.completed}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Goal Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryStats.length > 0 ? (
                categoryStats.map((stat, index) => (
                  <motion.div
                    key={stat.category}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{stat.category}</div>
                      <Badge variant="secondary" className="text-xs">
                        {stat.count}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={stat.percentage} className="w-16 h-2" />
                      <span className="text-xs text-muted-foreground w-8">
                        {stat.percentage}%
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No goals yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak Counter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Flame className="h-5 w-5" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.5,
                }}
                className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2"
              >
                {currentStreak}
              </motion.div>
              <div className="text-sm text-muted-foreground">
                {currentStreak === 1 ? "day" : "days"} of consistent progress
              </div>
              {currentStreak > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-3"
                >
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    {currentStreak >= 7 ? "🔥 On fire!" : "⭐ Keep going!"}
                  </Badge>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievement Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goals
                .filter((g) => g && g.id && g.status === "completed") // Add safety checks
                .slice(0, 3)
                .map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
                      <Award className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {goal.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Completed {formatDate(goal.updated_at)}
                      </div>
                    </div>
                  </motion.div>
                ))}

              {goals.filter((g) => g && g.id && g.status === "completed")
                .length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Complete your first goal to earn achievements!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
