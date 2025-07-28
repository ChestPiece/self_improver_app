"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";
import {
  PracticeCategory,
  DifficultyLevel,
  getCategoryInfo,
  getDifficultyInfo,
} from "@/types/practices";
import { createPracticeSession } from "@/lib/practices/actions";
import { toast } from "sonner";

interface PracticeData {
  id: string;
  title: string;
  description: string;
  category: PracticeCategory;
  duration: number;
  difficulty_level: DifficultyLevel;
  instructions: string[];
}

interface PracticeSessionModalProps {
  practice: PracticeData;
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

type SessionState = "setup" | "active" | "paused" | "completed";

export default function PracticeSessionModal({
  practice,
  isOpen,
  onClose,
  user,
}: PracticeSessionModalProps) {
  const [sessionState, setSessionState] = useState<SessionState>("setup");
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(practice.duration * 60); // Convert to seconds
  const [sessionNotes, setSessionNotes] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);

  const categoryInfo = getCategoryInfo(practice.category);
  const difficultyInfo = getDifficultyInfo(practice.difficulty_level);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (sessionState === "active" && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setSessionState("completed");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [sessionState, timeRemaining]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSessionState("setup");
      setCurrentStep(0);
      setTimeRemaining(practice.duration * 60);
      setSessionNotes("");
      setStartTime(null);
    }
  }, [isOpen, practice.duration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSession = () => {
    setSessionState("active");
    setStartTime(new Date());
  };

  const handlePauseResume = () => {
    setSessionState(sessionState === "active" ? "paused" : "active");
  };

  const handleRestart = () => {
    setSessionState("setup");
    setCurrentStep(0);
    setTimeRemaining(practice.duration * 60);
    setStartTime(null);
  };

  const handleComplete = async () => {
    try {
      const actualDuration = startTime
        ? Math.round((Date.now() - startTime.getTime()) / 1000 / 60)
        : practice.duration;

      const formData = new FormData();
      formData.append("practice_id", practice.id);
      formData.append("duration", actualDuration.toString());
      if (sessionNotes.trim()) {
        formData.append("notes", sessionNotes.trim());
      }

      const result = await createPracticeSession(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Practice session completed! 🎉", {
        description: `Great job completing "${practice.title}" in ${actualDuration} minutes.`,
      });

      onClose();
    } catch (error) {
      toast.error("Failed to save practice session");
    }
  };

  const progressPercentage =
    ((practice.duration * 60 - timeRemaining) / (practice.duration * 60)) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <categoryInfo.icon className="h-5 w-5" />
              {practice.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={difficultyInfo.color} variant="secondary">
                {difficultyInfo.name}
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timer and Progress */}
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-sm text-muted-foreground">
              {sessionState === "setup" && "Ready to begin"}
              {sessionState === "active" && "Session in progress"}
              {sessionState === "paused" && "Session paused"}
              {sessionState === "completed" && "Session completed!"}
            </div>
          </div>

          {/* Instructions */}
          <AnimatePresence mode="wait">
            {sessionState === "setup" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-lg">Practice Overview</h3>
                <p className="text-muted-foreground">{practice.description}</p>

                <div className="space-y-2">
                  <h4 className="font-medium">Instructions:</h4>
                  <div className="space-y-2">
                    {practice.instructions.map((instruction, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                          {index + 1}
                        </span>
                        <span>{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {(sessionState === "active" || sessionState === "paused") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Current Step</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentStep(Math.max(0, currentStep - 1))
                      }
                      disabled={currentStep === 0}
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentStep + 1} of {practice.instructions.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentStep(
                          Math.min(
                            practice.instructions.length - 1,
                            currentStep + 1
                          )
                        )
                      }
                      disabled={
                        currentStep === practice.instructions.length - 1
                      }
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      {currentStep + 1}
                    </span>
                    <p className="text-sm leading-relaxed pt-1">
                      {practice.instructions[currentStep]}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {sessionState === "completed" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 text-center"
              >
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-green-600 dark:text-green-400">
                    Practice Completed! 🎉
                  </h3>
                  <p className="text-muted-foreground">
                    Well done! How did the session go?
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-left block">
                    Session Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="How did you feel? Any insights or reflections..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Control Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {sessionState === "setup" && (
              <Button onClick={handleStartSession} className="flex-1 gap-2">
                <Play className="h-4 w-4" />
                Start Practice
              </Button>
            )}

            {(sessionState === "active" || sessionState === "paused") && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </Button>
                <Button
                  onClick={handlePauseResume}
                  variant={sessionState === "active" ? "secondary" : "default"}
                  className="flex-1 gap-2"
                >
                  {sessionState === "active" ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Resume
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setSessionState("completed")}
                  variant="outline"
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Finish Early
                </Button>
              </>
            )}

            {sessionState === "completed" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Practice Again
                </Button>
                <Button onClick={handleComplete} className="flex-1 gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Session
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
