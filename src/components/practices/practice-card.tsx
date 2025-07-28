"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, ChevronRight, CheckCircle2 } from "lucide-react";
import {
  PracticeCategory,
  DifficultyLevel,
  getCategoryInfo,
  getDifficultyInfo,
} from "@/types/practices";

interface PracticeData {
  id: string;
  title: string;
  description: string;
  category: PracticeCategory;
  duration: number;
  difficulty_level: DifficultyLevel;
  instructions: string[];
}

interface PracticeCardProps {
  practice: PracticeData;
  onStart: () => void;
  isHighlighted?: boolean;
}

export default function PracticeCard({
  practice,
  onStart,
  isHighlighted = false,
}: PracticeCardProps) {
  const categoryInfo = getCategoryInfo(practice.category);
  const difficultyInfo = getDifficultyInfo(practice.difficulty_level);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <Card
        className={`h-full flex flex-col overflow-hidden group hover:shadow-2xl transition-all duration-300 border-border/50 hover:border-primary/40 bg-gradient-to-b from-card to-card/50 ${
          isHighlighted
            ? "bg-primary/5 border-primary/30 shadow-lg ring-2 ring-primary/20"
            : ""
        }`}
      >
        <CardHeader
          className={`bg-gradient-to-br ${categoryInfo.color} border-b relative overflow-hidden`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-4 -right-4 transform rotate-12">
              <categoryInfo.icon className="h-20 w-20 text-primary/30" />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                  <categoryInfo.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge
                  className={`${difficultyInfo.color} text-xs font-medium shadow-sm`}
                  variant="secondary"
                >
                  {difficultyInfo.name}
                </Badge>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {practice.duration}m
                </span>
              </div>
            </div>
            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors leading-tight">
              {practice.title}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-6">
          <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
            {practice.description}
          </p>

          {/* Instructions Preview */}
          <div className="flex-1 mb-6">
            <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              What you'll do:
            </h4>
            <div className="space-y-2">
              {practice.instructions.slice(0, 3).map((instruction, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="line-clamp-1">{instruction}</span>
                </div>
              ))}
              {practice.instructions.length > 3 && (
                <div className="text-sm text-muted-foreground ml-7 italic">
                  +{practice.instructions.length - 3} more steps
                </div>
              )}
            </div>
          </div>

          {/* Start Button */}
          <Button
            onClick={onStart}
            className="w-full gap-3 group-hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-white/20">
                <Play className="h-4 w-4" />
              </div>
              <span className="font-medium">Start Practice</span>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
