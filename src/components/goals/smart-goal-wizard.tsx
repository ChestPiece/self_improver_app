"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import {
  Target,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  Calendar,
  TrendingUp,
  X,
} from "lucide-react";
import { GOAL_CATEGORIES, GoalCategory } from "@/types/goals";
import { createGoal } from "@/lib/goals/actions";
import { toast } from "sonner";

interface SmartGoalWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const goalSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters"),
  category: z.enum([
    "health",
    "fitness",
    "mental",
    "career",
    "personal",
    "finance",
    "education",
    "relationships",
  ]),
  target_value: z.number().positive("Target value must be positive").optional(),
  target_date: z.string().optional(),
  specific_details: z
    .string()
    .min(1, "Please specify what exactly you want to achieve"),
  measurable_criteria: z
    .string()
    .min(1, "Please specify how you will measure progress"),
  achievable_plan: z
    .string()
    .min(1, "Please explain how this goal is achievable"),
  relevant_reason: z
    .string()
    .min(1, "Please explain why this goal is important to you"),
  time_bound: z
    .string()
    .min(1, "Please specify when you want to achieve this goal"),
});

type GoalFormData = z.infer<typeof goalSchema>;

const GOAL_TEMPLATES = {
  health: [
    {
      title: "Drink More Water Daily",
      description: "Improve hydration for better health and energy",
      target_value: 8,
      specific_details: "Drink 8 glasses of water throughout the day",
      measurable_criteria: "Track water intake using a water bottle or app",
      achievable_plan:
        "Start with current intake and add one glass per week until reaching 8 glasses",
      relevant_reason:
        "Better hydration improves energy, skin health, and overall wellbeing",
      time_bound: "Achieve consistent 8 glasses daily within 4 weeks",
    },
    {
      title: "Get Better Sleep",
      description: "Establish a consistent sleep schedule for better rest",
      target_value: 8,
      specific_details: "Sleep 8 hours per night with consistent bedtime",
      measurable_criteria:
        "Track sleep hours and quality using sleep app or journal",
      achievable_plan:
        "Gradually adjust bedtime by 15 minutes earlier each night",
      relevant_reason: "Better sleep improves mood, productivity, and health",
      time_bound: "Establish consistent 8-hour sleep routine within 3 weeks",
    },
  ],
  fitness: [
    {
      title: "Exercise Regularly",
      description: "Build a sustainable fitness routine",
      target_value: 3,
      specific_details: "Exercise 3 times per week for 30 minutes",
      measurable_criteria: "Track workouts in fitness app or journal",
      achievable_plan:
        "Start with 20-minute sessions and gradually increase to 30 minutes",
      relevant_reason:
        "Regular exercise improves physical health, energy, and mental wellbeing",
      time_bound: "Establish consistent 3x/week routine within 6 weeks",
    },
  ],
  mental: [
    {
      title: "Daily Meditation Practice",
      description: "Develop mindfulness through daily meditation",
      target_value: 10,
      specific_details: "Meditate for 10 minutes every morning",
      measurable_criteria: "Track meditation sessions using app or journal",
      achievable_plan:
        "Start with 5 minutes and gradually increase to 10 minutes",
      relevant_reason:
        "Meditation reduces stress and improves focus and emotional wellbeing",
      time_bound: "Establish daily 10-minute practice within 4 weeks",
    },
  ],
  career: [
    {
      title: "Learn New Professional Skill",
      description: "Develop expertise in a relevant professional area",
      target_value: 1,
      specific_details: "Complete a professional certification or course",
      measurable_criteria: "Track course progress and completion certificate",
      achievable_plan: "Dedicate 1 hour daily to learning and practice",
      relevant_reason:
        "New skills improve career prospects and job satisfaction",
      time_bound: "Complete certification within 3 months",
    },
  ],
  personal: [],
  finance: [],
  education: [],
  relationships: [],
};

const SMART_CRITERIA = [
  {
    id: "specific",
    letter: "S",
    name: "Specific",
    description: "Clearly defined and specific",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    example: "I want to lose 10 pounds",
  },
  {
    id: "measurable",
    letter: "M",
    name: "Measurable",
    description: "Quantifiable and trackable",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    example: "Track weight daily",
  },
  {
    id: "achievable",
    letter: "A",
    name: "Achievable",
    description: "Realistic and attainable",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    example: "1-2 pounds per week",
  },
  {
    id: "relevant",
    letter: "R",
    name: "Relevant",
    description: "Important to your life",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    example: "For better health",
  },
  {
    id: "timebound",
    letter: "T",
    name: "Time-bound",
    description: "Has a clear deadline",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    example: "Within 3 months",
  },
];

export default function SmartGoalWizard({
  isOpen,
  onClose,
}: SmartGoalWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "health",
      target_value: undefined,
      target_date: "",
      specific_details: "",
      measurable_criteria: "",
      achievable_plan: "",
      relevant_reason: "",
      time_bound: "",
    },
  });

  const steps = [
    {
      title: "Choose Category",
      description: "Select the area you want to improve",
    },
    {
      title: "Pick Template",
      description: "Choose a template or start from scratch",
    },
    {
      title: "Make it SMART",
      description: "Define your goal using SMART criteria",
    },
    { title: "Review & Create", description: "Review your goal and create it" },
  ];

  const currentCategory = form.watch("category") as GoalCategory;
  const templates = GOAL_TEMPLATES[currentCategory] || [];

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    form.setValue("title", template.title);
    form.setValue("description", template.description);
    form.setValue("target_value", template.target_value);
    form.setValue("specific_details", template.specific_details);
    form.setValue("measurable_criteria", template.measurable_criteria);
    form.setValue("achievable_plan", template.achievable_plan);
    form.setValue("relevant_reason", template.relevant_reason);
    form.setValue("time_bound", template.time_bound);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: GoalFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      if (data.target_value)
        formData.append("target_value", data.target_value.toString());
      if (data.target_date) formData.append("target_date", data.target_date);

      const result = await createGoal(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("SMART goal created successfully! 🎯");
        form.reset();
        setCurrentStep(0);
        setSelectedTemplate(null);
        onClose();
      }
    } catch (error) {
      toast.error("Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    form.reset();
    setCurrentStep(0);
    setSelectedTemplate(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            SMART Goal Wizard
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <Progress
            value={((currentStep + 1) / steps.length) * 100}
            className="h-2"
          />
          <div className="text-center">
            <h3 className="font-semibold">{steps[currentStep].title}</h3>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Category Selection */}
              {currentStep === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Category</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {GOAL_CATEGORIES.map((category) => (
                            <Card
                              key={category.value}
                              className={`cursor-pointer transition-all hover:scale-105 ${
                                field.value === category.value
                                  ? "ring-2 ring-primary bg-primary/5"
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() => field.onChange(category.value)}
                            >
                              <CardContent className="p-4 text-center">
                                <div className="mb-2 flex justify-center">
                                  <category.icon className="h-8 w-8 text-primary" />
                                </div>
                                <div className="text-sm font-medium">
                                  {category.label}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {/* Step 2: Template Selection */}
              {currentStep === 1 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <Lightbulb className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Choose a Template</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a template to get started quickly, or skip to
                      create from scratch
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {templates.map((template, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-all hover:scale-[1.02] ${
                          selectedTemplate?.title === template.title
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            {template.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}

                    <Card
                      className={`cursor-pointer transition-all hover:scale-[1.02] border-dashed ${
                        !selectedTemplate
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedTemplate(null)}
                    >
                      <CardContent className="p-6 text-center">
                        <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <div className="font-medium">Start from Scratch</div>
                        <p className="text-sm text-muted-foreground">
                          Create a completely custom goal
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* Step 3: SMART Criteria */}
              {currentStep === 2 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Goal Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your goal title"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Briefly describe your goal"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="target_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Value (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g., 8"
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

                        <FormField
                          control={form.control}
                          name="target_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Date (Optional)</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* SMART Criteria */}
                    <div className="space-y-4">
                      {SMART_CRITERIA.map((criteria) => (
                        <FormField
                          key={criteria.id}
                          control={form.control}
                          name={
                            `${
                              criteria.id === "specific"
                                ? "specific_details"
                                : criteria.id === "measurable"
                                ? "measurable_criteria"
                                : criteria.id === "achievable"
                                ? "achievable_plan"
                                : criteria.id === "relevant"
                                ? "relevant_reason"
                                : "time_bound"
                            }` as any
                          }
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Badge className={criteria.color}>
                                  {criteria.letter}
                                </Badge>
                                {criteria.name}
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={criteria.description}
                                  rows={2}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {currentStep === 3 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Review Your SMART Goal</h3>
                    <p className="text-sm text-muted-foreground">
                      Make sure everything looks good before creating your goal
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {form.watch("title") || "Untitled Goal"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        {form.watch("description") || "No description provided"}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SMART_CRITERIA.map((criteria) => {
                          const fieldName =
                            criteria.id === "specific"
                              ? "specific_details"
                              : criteria.id === "measurable"
                              ? "measurable_criteria"
                              : criteria.id === "achievable"
                              ? "achievable_plan"
                              : criteria.id === "relevant"
                              ? "relevant_reason"
                              : "time_bound";
                          const value = form.watch(fieldName as any);

                          return (
                            <div key={criteria.id} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className={criteria.color}>
                                  {criteria.letter}
                                </Badge>
                                <span className="font-medium text-sm">
                                  {criteria.name}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {value || "Not specified"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={resetWizard}>
                  Reset
                </Button>

                {currentStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isSubmitting ? "Creating..." : "Create Goal"}
                  </Button>
                ) : (
                  <Button type="button" onClick={handleNext} className="gap-2">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
