"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Plus,
  Flame,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  Award,
  Check,
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
import HabitCard from "./habit-card";
import CreateHabitModal from "./create-habit-modal";
import { logHabitCompletion } from "@/lib/habits/actions";
import { createAchievementNotification } from "@/lib/notifications/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useHabitLoading } from "@/lib/store/useLoadingStore";
import {
  useHabitsRealtime,
  useHabitLogsRealtime,
} from "@/lib/hooks/useSupabaseRealtime";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HabitsPageClientProps {
  user: User;
  habits: Habit[];
  habitLogs: HabitLog[];
}

export default function HabitsPageClient({
  user,
  habits,
  habitLogs,
}: HabitsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { logging, setLoading: setHabitLoading } = useHabitLoading();

  // Get highlighted habit from search results
  const highlightedHabitId = searchParams.get("highlight");

  // Set up real-time subscriptions for live updates
  useHabitsRealtime(user.id, () => {
    router.refresh();
  });

  useHabitLogsRealtime(() => {
    router.refresh();
  });

  // Calculate overall statistics
  const totalHabits = habits.filter((h) => h.is_active).length;
  const completedToday = habits.filter((habit) =>
    getHabitCompletionToday(
      habitLogs.filter((log) => log.habit_id === habit.id)
    )
  ).length;
  const currentStreaks = habits.map((habit) =>
    calculateStreak(
      habitLogs.filter((log) => log.habit_id === habit.id),
      habit.frequency as any
    )
  );
  const avgStreak =
    currentStreaks.length > 0
      ? Math.round(
          currentStreaks.reduce((a, b) => a + b, 0) / currentStreaks.length
        )
      : 0;
  const longestStreak = Math.max(...habits.map((h) => h.best_streak || 0), 0);

  // Function to log habit completion
  const handleHabitComplete = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const today = new Date().toDateString();
    const alreadyCompleted = habitLogs.some(
      (log) =>
        log.habit_id === habitId &&
        new Date(log.completed_at).toDateString() === today
    );

    if (alreadyCompleted) {
      toast.error("You already completed this habit today!");
      return;
    }

    setHabitLoading("logging", true);
    try {
      const formData = new FormData();
      formData.append("habit_id", habitId);

      const result = await logHabitCompletion(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      // Check for streak milestones and create achievement notifications
      const currentStreak = habit.current_streak || 0;
      const newStreak = currentStreak + 1;

      if (newStreak === 7) {
        await createAchievementNotification(
          user.id,
          "Week Warrior",
          `You've maintained "${habit.name}" for 7 days straight! 🔥`
        );
      } else if (newStreak === 30) {
        await createAchievementNotification(
          user.id,
          "Month Master",
          `Incredible! You've kept up "${habit.name}" for 30 days! 🏆`
        );
      } else if (newStreak === 100) {
        await createAchievementNotification(
          user.id,
          "Century Champion",
          `Amazing dedication! 100 days of "${habit.name}"! You're unstoppable! 💪`
        );
      }

      toast.success(`🎉 ${habit.name} completed!`, {
        description:
          newStreak > 1
            ? `${newStreak} day streak! Keep it up!`
            : "Great job starting your habit!",
      });

      // Real-time updates will automatically refresh the data
    } catch (error) {
      toast.error("Failed to log habit completion");
    } finally {
      setHabitLoading("logging", false);
    }
  };

  // Get today's habits
  const todaysHabits = habits.filter(
    (habit) =>
      habit.is_active &&
      (habit.frequency === "daily" ||
        (habit.frequency === "weekly" && new Date().getDay() === 1) || // Monday for weekly
        (habit.frequency === "monthly" && new Date().getDate() === 1)) // 1st of month for monthly
  );

  return (
    <div className="flex flex-1 flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 sidebar-content-adjust">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between sidebar-squeeze"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                My Habits
              </h1>
              <p className="text-muted-foreground mt-1">
                Build consistency and track your daily routines
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Create Habit
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="container mx-auto px-4 py-6 sidebar-content-adjust">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sidebar-squeeze">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Habits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {totalHabits}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-rose-600">
                    {completedToday}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    / {todaysHabits.length}
                  </div>
                </div>
                {todaysHabits.length > 0 && (
                  <Progress
                    value={(completedToday / todaysHabits.length) * 100}
                    className="h-1 mt-2"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-1">
                  <Flame className="h-4 w-4" />
                  Avg Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {avgStreak}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-200/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Best Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {longestStreak}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Today's Habits Section */}
      {todaysHabits.length > 0 && (
        <div className="container mx-auto px-4 pb-6 sidebar-content-adjust">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="sidebar-squeeze">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Today's Habits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaysHabits.map((habit, index) => {
                    const isCompleted = getHabitCompletionToday(
                      habitLogs.filter((log) => log.habit_id === habit.id)
                    );
                    const frequencyInfo = getFrequencyInfo(habit.frequency);

                    return (
                      <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50 ${
                          isCompleted
                            ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200/20"
                            : "border-border/50"
                        }`}
                      >
                        <Button
                          variant={isCompleted ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            !isCompleted && handleHabitComplete(habit.id)
                          }
                          disabled={isCompleted || logging}
                          className={`w-8 h-8 p-0 ${
                            isCompleted
                              ? "bg-rose-600 hover:bg-rose-700"
                              : "hover:scale-105"
                          }`}
                        >
                          {logging ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="h-3 w-3 border-2 border-current border-t-transparent rounded-full"
                            />
                          ) : isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </Button>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                isCompleted
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {habit.name}
                            </span>
                            <Badge
                              className={frequencyInfo.color}
                              variant="secondary"
                            >
                              {frequencyInfo.icon} {frequencyInfo.name}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Current streak: {habit.current_streak || 0}
                            </span>
                            {(habit.current_streak || 0) > 0 && (
                              <Flame className="h-3 w-3 text-orange-500" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* All Habits Grid */}
      <main className="flex-1 container mx-auto px-4 pb-8 sidebar-content-adjust">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            All Habits
          </h2>
          <p className="text-muted-foreground">
            Manage and track all your habits
          </p>
        </div>

        {habits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 sidebar-squeeze"
          >
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No habits yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first habit to start building consistency in your
              daily routine.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Habit
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sidebar-squeeze">
            {habits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={
                  highlightedHabitId === habit.id
                    ? "ring-2 ring-primary ring-offset-2 rounded-lg"
                    : ""
                }
              >
                <HabitCard
                  habit={habit}
                  habitLogs={habitLogs.filter(
                    (log) => log.habit_id === habit.id
                  )}
                  onComplete={() => handleHabitComplete(habit.id)}
                  isHighlighted={highlightedHabitId === habit.id}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
