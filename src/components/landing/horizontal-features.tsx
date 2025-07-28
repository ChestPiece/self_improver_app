"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  Brain,
  TrendingUp,
  Users,
  Award,
  Activity,
  Heart,
  BookOpen,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function HorizontalFeatures() {
  const features = [
    {
      icon: Target,
      title: "Smart Goals",
      description:
        "AI-powered goal setting with predictive metrics and personalized roadmaps.",
      badge: "AI-Driven",
      bgColor: "bg-rose-50 dark:bg-rose-950/20",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    {
      icon: Brain,
      title: "Mind Mastery",
      description:
        "Neuroscience-backed meditation and cognitive enhancement programs.",
      badge: "Science-Based",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: Activity,
      title: "Peak Fitness",
      description:
        "Adaptive workout plans that evolve with your progress and goals.",
      badge: "Adaptive",
      bgColor: "bg-rose-50 dark:bg-rose-950/20",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description:
        "Comprehensive insights with data-driven recommendations for growth.",
      badge: "Real-time",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Connect with like-minded individuals on transformation journeys.",
      badge: "Social",
      bgColor: "bg-rose-50 dark:bg-rose-950/20",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    {
      icon: Zap,
      title: "Habit Engine",
      description: "Revolutionary habit formation with 98% success rate.",
      badge: "Proven",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <section
      id="features"
      className="py-16 bg-gradient-to-b from-background to-muted/30"
    >
      {/* Hero Section */}
      <div className="text-center mb-16 px-4">
        <div className="flex items-center justify-center mb-6">
          <Badge
            variant="secondary"
            className="bg-rose-50 text-rose-700 border-rose-200 px-4 py-2 text-sm font-medium"
          >
            <Sparkles className="size-4 mr-2" />
            Features
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
          Experience the Future
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
          Transform your life with cutting-edge technology and proven
          methodologies.
        </p>

        <div className="mb-12">
          <Badge variant="outline" className="mb-4">
            Ready to Start?
          </Badge>
          <div>
            <Button size="lg" className="group" asChild>
              <Link href="/register">
                Transform Your Life Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6">
            Powerful Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Transform Your Life with Smart Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the tools and capabilities that will accelerate your
            personal transformation journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border border-border hover:border-rose-200 transition-all duration-300 bg-card hover:bg-rose-50/30 h-full"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl ${feature.bgColor} transition-all duration-300`}
                  >
                    <feature.icon className={`size-6 ${feature.iconColor}`} />
                  </div>
                  <Badge variant="success" className="font-medium">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold group-hover:text-rose-700 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <CardDescription className="text-base leading-relaxed text-muted-foreground mb-6 flex-1">
                  {feature.description}
                </CardDescription>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all duration-200 group/btn font-medium"
                >
                  <span>Learn More</span>
                  <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
