"use client";

import { useState } from "react";
import {
  Goal,
  getCategoryInfo,
  getStatusInfo,
  calculateProgress,
} from "@/types/goals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  updateGoalProgress,
  updateGoalStatus,
  deleteGoal,
} from "@/lib/goals/actions";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Calendar,
  TrendingUp,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface GoalCardProps {
  goal: Goal;
  isHighlighted?: boolean;
}

export default function GoalCard({
  goal,
  isHighlighted = false,
}: GoalCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const categoryInfo = getCategoryInfo(goal.category);
  const statusInfo = getStatusInfo(goal.status || "active");
  const progress = calculateProgress(goal.current_value, goal.target_value);

  const handleUpdateProgress = async () => {
    if (!goal.target_value) {
      toast.error("This goal doesn't have a target value");
      return;
    }

    setIsUpdating(true);
    try {
      const increment =
        goal.target_value > 10 ? Math.ceil(goal.target_value / 10) : 1;
      const newValue = Math.min(
        (goal.current_value || 0) + increment,
        goal.target_value
      );

      const result = await updateGoalProgress(goal.id, newValue);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result?.success || "Progress updated!");
      }
    } catch (error) {
      toast.error("Failed to update progress");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePauseResume = async () => {
    const newStatus = goal.status === "active" ? "paused" : "active";

    setIsChangingStatus(true);
    try {
      const result = await updateGoalStatus(goal.id, newStatus);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result?.success || `Goal ${newStatus}!`);
      }
    } catch (error) {
      toast.error(
        `Failed to ${newStatus === "paused" ? "pause" : "resume"} goal`
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleComplete = async () => {
    setIsChangingStatus(true);
    try {
      const result = await updateGoalStatus(goal.id, "completed");
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result?.success || "Goal completed!");
      }
    } catch (error) {
      toast.error("Failed to complete goal");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this goal? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteGoal(goal.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result?.success || "Goal deleted!");
      }
    } catch (error) {
      toast.error("Failed to delete goal");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className={`group hover:shadow-md transition-shadow duration-200 border-border ${
        isHighlighted ? "bg-primary/5 border-primary/30 shadow-md" : ""
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <categoryInfo.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-foreground truncate">
                {goal.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className={`${statusInfo.bgColor} ${statusInfo.color} border-none text-xs`}
                >
                  {statusInfo.label}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs border-border text-muted-foreground"
                >
                  {categoryInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Goal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {goal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {goal.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        {goal.target_value && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {goal.current_value || 0} / {goal.target_value}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {progress.toFixed(1)}% complete
              </span>
              {goal.status === "active" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpdateProgress}
                  disabled={isUpdating}
                  className="h-7 px-2 text-xs gap-1 hover:bg-primary/10"
                >
                  <Plus className="h-3 w-3" />
                  Add Progress
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Date Info */}
        <div className="space-y-2">
          {goal.target_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Due {formatRelativeTime(goal.target_date)}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Created {formatDate(goal.created_at)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {goal.status === "active" && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2"
              onClick={handlePauseResume}
              disabled={isChangingStatus}
            >
              <Pause className="h-4 w-4" />
              {isChangingStatus ? "Pausing..." : "Pause"}
            </Button>
            {progress >= 100 && (
              <Button
                size="sm"
                className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                onClick={handleComplete}
                disabled={isChangingStatus}
              >
                <CheckCircle className="h-4 w-4" />
                Complete
              </Button>
            )}
          </div>
        )}

        {goal.status === "paused" && (
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2 bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={handlePauseResume}
            disabled={isChangingStatus}
          >
            <Play className="h-4 w-4" />
            {isChangingStatus ? "Resuming..." : "Resume Goal"}
          </Button>
        )}

        {goal.status === "completed" && (
          <div className="flex items-center justify-center gap-2 py-3 text-primary bg-primary/10 rounded-lg border border-primary/20">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Goal Completed!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
