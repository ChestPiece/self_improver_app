"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar, Lightbulb, X, CheckCircle2 } from "lucide-react";
import {
  HABIT_FREQUENCIES,
  HABIT_SUGGESTIONS,
  HabitFrequency,
  Habit,
} from "@/types/habits";
import { createHabit } from "@/lib/habits/actions";
import { toast } from "sonner";

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const habitSchema = z.object({
  name: z
    .string()
    .min(1, "Habit name is required")
    .max(100, "Name must be less than 100 characters"),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  target_count: z.number().positive("Target count must be positive").optional(),
});

type HabitFormData = z.infer<typeof habitSchema>;

export default function CreateHabitModal({
  isOpen,
  onClose,
}: CreateHabitModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);

  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      frequency: "daily",
      target_count: 1,
    },
  });

  const handleSuggestionSelect = (suggestion: any) => {
    setSelectedSuggestion(suggestion);
    form.setValue("name", suggestion.name);
    form.setValue("frequency", suggestion.frequency);
    form.setValue("target_count", suggestion.target_count);
  };

  const handleSubmit = async (data: HabitFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("frequency", data.frequency);
      formData.append("target_count", (data.target_count || 1).toString());

      const result = await createHabit(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Habit created successfully! 🎯", {
        description: `Start building your ${data.frequency} routine with "${data.name}"`,
      });

      form.reset();
      setSelectedSuggestion(null);
      onClose(); // Close modal and let parent refresh data
    } catch (error) {
      toast.error("Failed to create habit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setSelectedSuggestion(null);
  };

  const frequencyInfo = HABIT_FREQUENCIES.find(
    (f) => f.frequency === form.watch("frequency")
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[94vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Create New Habit
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">
                Quick Start Suggestions
              </Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
              {HABIT_SUGGESTIONS.slice(0, 8).map((suggestion, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedSuggestion?.name === suggestion.name
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {suggestion.name}
                      </span>
                      <Badge
                        className={
                          HABIT_FREQUENCIES.find(
                            (f) => f.frequency === suggestion.frequency
                          )?.color
                        }
                        variant="secondary"
                      >
                        {
                          HABIT_FREQUENCIES.find(
                            (f) => f.frequency === suggestion.frequency
                          )?.icon
                        }
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {suggestion.target_count} ×{" "}
                      {suggestion.frequency.slice(0, -2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Habit Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habit Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Drink 8 glasses of water, Exercise for 30 minutes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HABIT_FREQUENCIES.map((freq) => (
                            <SelectItem
                              key={freq.frequency}
                              value={freq.frequency}
                            >
                              <div className="flex items-center gap-2">
                                <span>{freq.icon}</span>
                                <span>{freq.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({freq.description})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Target Count
                        <span className="text-xs text-muted-foreground ml-1">
                          (per{" "}
                          {form.watch("frequency")?.slice(0, -2) || "period"})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Frequency Preview */}
              {frequencyInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-muted/50 border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={frequencyInfo.color} variant="secondary">
                      {frequencyInfo.icon} {frequencyInfo.name}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You'll aim to complete "{form.watch("name") || "this habit"}
                    " {form.watch("target_count") || 1} time
                    {(form.watch("target_count") || 1) > 1 ? "s" : ""}{" "}
                    {frequencyInfo.description.toLowerCase()}.
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create Habit"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
