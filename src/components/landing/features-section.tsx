"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import and register ScrollTrigger
    const loadScrollTrigger = async () => {
      if (typeof window !== "undefined") {
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          // Title animation
          gsap.fromTo(
            titleRef.current,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: titleRef.current,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
              },
            }
          );

          // Feature cards animation
          gsap.fromTo(
            ".feature-card",
            { opacity: 0, y: 60, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power2.out",
              stagger: 0.15,
              scrollTrigger: {
                trigger: featuresRef.current,
                start: "top 75%",
                end: "bottom 25%",
                toggleActions: "play none none reverse",
              },
            }
          );

          // Hover animations for feature cards
          document.querySelectorAll(".feature-card").forEach((card) => {
            const icon = card.querySelector(".feature-icon");
            const badge = card.querySelector(".feature-badge");

            card.addEventListener("mouseenter", () => {
              gsap.to(icon, {
                scale: 1.1,
                rotation: 5,
                duration: 0.3,
                ease: "power2.out",
              });
              gsap.to(badge, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out",
              });
              gsap.to(card, { y: -5, duration: 0.3, ease: "power2.out" });
            });

            card.addEventListener("mouseleave", () => {
              gsap.to(icon, {
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: "power2.out",
              });
              gsap.to(badge, { scale: 1, duration: 0.3, ease: "power2.out" });
              gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out" });
            });
          });
        }, sectionRef);

        return () => ctx.revert();
      }
    };

    loadScrollTrigger();
  }, []);

  const features = [
    {
      icon: Target,
      title: "Smart Goal Setting",
      description:
        "Create SMART goals with our intelligent wizard. Track progress with visual analytics and milestone celebrations.",
      badge: "AI-Powered",
      color: "text-blue-500",
    },
    {
      icon: Brain,
      title: "Mental Wellness",
      description:
        "Access guided meditation, journaling prompts, and mindfulness exercises designed by mental health experts.",
      badge: "Expert-Led",
      color: "text-purple-500",
    },
    {
      icon: Activity,
      title: "Fitness Tracking",
      description:
        "Comprehensive workout routines, yoga sessions, and strength training plans for all fitness levels.",
      badge: "Personalized",
      color: "text-green-500",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description:
        "Detailed insights into your growth journey with charts, streaks, and achievement tracking.",
      badge: "Real-time",
      color: "text-orange-500",
    },
    {
      icon: Users,
      title: "Community Support",
      description:
        "Connect with like-minded individuals, share progress, and get motivated by success stories.",
      badge: "Social",
      color: "text-pink-500",
    },
    {
      icon: BookOpen,
      title: "Learning Library",
      description:
        "Extensive collection of self-improvement content, articles, and expert-led workshops.",
      badge: "Growing",
      color: "text-indigo-500",
    },
    {
      icon: Zap,
      title: "Habit Builder",
      description:
        "Build lasting habits with smart reminders, streak tracking, and behavioral psychology insights.",
      badge: "Science-Based",
      color: "text-yellow-500",
    },
    {
      icon: Award,
      title: "Achievement System",
      description:
        "Earn badges and unlock rewards as you reach milestones and complete challenges.",
      badge: "Gamified",
      color: "text-red-500",
    },
    {
      icon: Heart,
      title: "Wellness Monitoring",
      description:
        "Track your overall well-being with mood monitoring, stress levels, and health metrics.",
      badge: "Holistic",
      color: "text-teal-500",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-24 bg-gradient-to-b from-background to-accent/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 bg-primary/10 text-primary border-primary/20"
          >
            ✨ Powerful Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
              Transform Your Life
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform combines proven methodologies with
            cutting-edge technology to accelerate your personal growth journey.
          </p>
        </div>

        {/* Features Grid */}
        <div
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              className="feature-card relative group border-border/50 hover:border-primary/30 transition-all duration-300 bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`feature-icon p-3 rounded-lg bg-background/80 ${feature.color}`}
                  >
                    <feature.icon className="size-6" />
                  </div>
                  <Badge variant="success" className="text-sm py-2 px-4">
                    Track & Transform
                  </Badge>
                </div>
                <div className="flex justify-center">
                  <Badge variant="secondary" className="text-sm py-2 px-4">
                    AI-Powered Insights
                  </Badge>
                </div>
                <div className="flex justify-center">
                  <Badge variant="warning" className="text-sm py-2 px-4">
                    Community Support
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to start your transformation?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Badge variant="success" className="text-sm py-2 px-4">
              ✓ 14-day free trial
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              ✓ No credit card required
            </Badge>
            <Badge variant="warning" className="text-sm py-2 px-4">
              ✓ Cancel anytime
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
