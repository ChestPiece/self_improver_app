"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { createGoal } from "@/lib/goals/actions";
import { GOAL_CATEGORIES } from "@/types/goals";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Target,
  Calendar,
  Lightbulb,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const goalFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  category: z.string().min(1, "Category is required"),
  target_value: z.number().positive("Target value must be positive").optional(),
  target_date: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalFormSchema>;

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGoalModal({
  isOpen,
  onClose,
}: CreateGoalModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
  });

  const selectedCategory = watch("category");
  const categoryInfo = GOAL_CATEGORIES.find(
    (c) => c.value === selectedCategory
  );

  const handleClose = () => {
    reset();
    setStep(1);
    setError(null);
    onClose();
  };

  const onSubmit = async (data: GoalFormData) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("category", data.category);
    if (data.target_value)
      formData.append("target_value", data.target_value.toString());
    if (data.target_date) formData.append("target_date", data.target_date);

    try {
      const result = await createGoal(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Goal created successfully!");
        handleClose();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Create New Goal
          </DialogTitle>
          <DialogDescription>
            Create a SMART goal to track your progress and achieve success
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={
                  step >= stepNumber
                    ? "bg-rose-500 text-white"
                    : "bg-muted text-muted-foreground"
                }
              >
                {stepNumber < step ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`h-0.5 w-16 ${
                    stepNumber < step ? "bg-rose-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Run a 5K marathon"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your goal and why it's important to you..."
                    rows={3}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Category & Target */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Goal Category *</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => setValue("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">
                                {category.label}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {category.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {categoryInfo && (
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{categoryInfo.label}</strong>:{" "}
                      {categoryInfo.description}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="target_value">Target Value (Optional)</Label>
                  <Input
                    id="target_value"
                    type="number"
                    placeholder="e.g., 30 (days), 10 (books), 5000 (steps)"
                    {...register("target_value", { valueAsNumber: true })}
                  />
                  {errors.target_value && (
                    <p className="text-sm text-red-500">
                      {errors.target_value.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Set a measurable target to track your progress
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Timeline & Review */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="target_date">Target Date (Optional)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="target_date"
                      type="date"
                      className="pl-10"
                      {...register("target_date")}
                    />
                  </div>
                  {errors.target_date && (
                    <p className="text-sm text-red-500">
                      {errors.target_date.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Set a deadline to create urgency and accountability
                  </p>
                </div>

                {/* SMART Framework Info */}
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    <strong>SMART Goals</strong> are Specific, Measurable,
                    Achievable, Relevant, and Time-bound. This framework
                    increases your chances of success!
                  </AlertDescription>
                </Alert>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLoading ? "Creating..." : "Create Goal"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </DialogContent>
    </Dialog>
  );
}
