"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, Brain, Zap } from "lucide-react";
import LandingNavbar from "./landing-navbar";
import HorizontalFeatures from "./horizontal-features";

export default function LandingPage() {
  useEffect(() => {
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.hash && target.hostname === window.location.hostname) {
        e.preventDefault();
        const element = document.querySelector(target.hash);
        if (element) {
          const offsetTop =
            element.getBoundingClientRect().top + window.pageYOffset - 60;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      }
    };

    document.addEventListener("click", handleSmoothScroll);

    return () => {
      document.removeEventListener("click", handleSmoothScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="pt-14">
        <HorizontalFeatures />

        {/* About Section */}
        <section id="about" className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-12">
              <Badge variant="outline" className="mb-4">
                About Us
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Why Choose <span className="text-primary">Self Improver?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                We've cracked the code on personal transformation. Science meets
                technology to create your most powerful self.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    Precision-Driven
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Every feature engineered for maximum impact and measurable
                    results
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    Science-Backed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Built on cutting-edge research and proven methodologies for
                    lasting change
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    Rapid Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    See measurable progress in your first week of consistent use
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-6">
              Ready to Start?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to <span className="text-primary">Transform</span> Your
              Life?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join thousands who are already on their journey to becoming their
              best selves. Your future self is waiting.
            </p>

            <div className="mb-8">
              <a href="/register">
                <Button
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold group"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted/50 border-t border-border py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg font-bold">
                    SI
                  </div>
                  <span className="font-semibold text-lg">Self Improver</span>
                </div>
                <p className="text-muted-foreground">
                  Transform your potential into reality.
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  © 2024 Self Improver. All rights reserved.
                </p>
              </div>

              <div className="text-right">
                <div className="space-x-6 text-muted-foreground">
                  <a
                    href="/login"
                    className="hover:text-primary transition-colors"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="hover:text-primary transition-colors"
                  >
                    Sign Up
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
