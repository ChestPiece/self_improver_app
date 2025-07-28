"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  Trophy,
  TrendingUp,
} from "lucide-react";
import {
  Habit,
  HabitLog,
  getFrequencyInfo,
  calculateStreak,
  getHabitCompletionToday,
  getHabitCompletionThisWeek,
  getHabitCompletionThisMonth,
} from "@/types/habits";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  habitLogs: HabitLog[];
  onComplete: () => void;
  isHighlighted?: boolean;
}

export default function HabitCard({
  habit,
  habitLogs,
  onComplete,
  isHighlighted = false,
}: HabitCardProps) {
  const frequencyInfo = getFrequencyInfo(habit.frequency);
  const currentStreak = calculateStreak(habitLogs, habit.frequency as any);
  const isCompletedToday = getHabitCompletionToday(habitLogs);
  const weeklyCount = getHabitCompletionThisWeek(habitLogs);
  const monthlyCount = getHabitCompletionThisMonth(habitLogs);

  // Calculate completion percentage for this week/month based on frequency
  const getCompletionPercentage = () => {
    if (habit.frequency === "daily") {
      // For daily habits, show this week's completion
      const daysThisWeek = new Date().getDay() || 7; // Sunday = 7
      return Math.min((weeklyCount / daysThisWeek) * 100, 100);
    } else if (habit.frequency === "weekly") {
      // For weekly habits, show this month's completion
      const weeksThisMonth = Math.ceil(new Date().getDate() / 7);
      const expectedCompletions = Math.min(
        weeksThisMonth,
        habit.target_count || 1
      );
      return Math.min((monthlyCount / expectedCompletions) * 100, 100);
    } else {
      // For monthly habits, show year completion
      const monthsThisYear = new Date().getMonth() + 1;
      const expectedCompletions = Math.min(
        monthsThisYear,
        habit.target_count || 1
      );
      return Math.min((monthlyCount / expectedCompletions) * 100, 100);
    }
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card
        className={cn(
          "p-4 border border-border rounded-lg transition-all duration-200 bg-card hover:shadow-md",
          isCompletedToday ? "bg-rose-50/50 dark:bg-rose-900/10" : ""
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {habit.name}
              </CardTitle>
            </div>
            <Badge className={frequencyInfo.color} variant="secondary">
              {frequencyInfo.icon} {frequencyInfo.name}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Streak Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame
                className={`h-4 w-4 ${
                  currentStreak > 0
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              />
              <span className="text-sm font-medium">
                {currentStreak} {habit.frequency.slice(0, -2)} streak
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Trophy className="h-3 w-3" />
              <span>Best: {habit.best_streak || 0}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {habit.frequency === "daily"
                  ? "This week"
                  : habit.frequency === "weekly"
                  ? "This month"
                  : "This year"}{" "}
                progress
              </span>
              <span className="font-medium">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-lg font-bold text-primary">
                {habit.frequency === "daily" ? weeklyCount : monthlyCount}
              </div>
              <div className="text-xs text-muted-foreground">
                {habit.frequency === "daily" ? "This week" : "This month"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-primary">
                {habitLogs.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Total completed
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-auto pt-4">
            {habit.frequency === "daily" ? (
              <Button
                onClick={onComplete}
                disabled={isCompletedToday}
                variant={isCompletedToday ? "secondary" : "default"}
                className="w-full gap-2 transition-all duration-200 hover:scale-105"
              >
                {isCompletedToday ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Completed Today
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4" />
                    Mark Complete
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={onComplete}
                variant="outline"
                className="w-full gap-2 transition-all duration-200 hover:scale-105"
              >
                <Calendar className="h-4 w-4" />
                Log Completion
              </Button>
            )}
          </div>

          {/* Target Info */}
          {habit.target_count && habit.target_count > 1 && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Target: {habit.target_count} times {habit.frequency.slice(0, -2)}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
