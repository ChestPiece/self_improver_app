"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Target,
  Trophy,
  Flame,
  Activity,
  Edit,
  Save,
  X,
  Camera,
} from "lucide-react";
import { Goal } from "@/types/goals";
import { Database } from "@/types/database.types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfilePageClientProps {
  user: User;
  profile: Profile | null;
  goals: Goal[];
}

export default function ProfilePageClient({
  user,
  profile,
  goals,
}: ProfilePageClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: profile?.full_name || "",
  });

  // Calculate user statistics
  const stats = {
    totalGoals: goals.length,
    completedGoals: goals.filter((g) => g.status === "completed").length,
    activeGoals: goals.filter((g) => g.status === "active").length,
    joinDate: user.created_at,
    completionRate:
      goals.length > 0
        ? Math.round(
            (goals.filter((g) => g.status === "completed").length /
              goals.length) *
              100
          )
        : 0,
  };

  // Mock achievements for profile
  const achievements = [
    {
      title: "Early Adopter",
      description: "Joined the Self Improver community",
      icon: "🎉",
      earned: true,
      earnedDate: user.created_at,
    },
    {
      title: "Goal Setter",
      description: "Created your first goal",
      icon: "🎯",
      earned: goals.length > 0,
      earnedDate: goals.length > 0 ? goals[0].created_at : null,
    },
    {
      title: "Achiever",
      description: "Completed your first goal",
      icon: "🏆",
      earned: stats.completedGoals > 0,
      earnedDate: goals.find((g) => g.status === "completed")?.updated_at,
    },
    {
      title: "Consistent",
      description: "Completed 5 goals",
      icon: "⭐",
      earned: stats.completedGoals >= 5,
      earnedDate: stats.completedGoals >= 5 ? new Date().toISOString() : null,
    },
    {
      title: "Goal Master",
      description: "Completed 10 goals",
      icon: "👑",
      earned: stats.completedGoals >= 10,
      earnedDate: stats.completedGoals >= 10 ? new Date().toISOString() : null,
    },
  ];

  const handleSaveProfile = async () => {
    try {
      // In a real app, this would call a server action to update the profile
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({
      full_name: profile?.full_name || "",
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 sidebar-content-adjust">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="sidebar-squeeze"
          >
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <UserIcon className="h-8 w-8 text-primary" />
              Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile and view your progress
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 sidebar-content-adjust">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="w-24 h-24 mx-auto">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="text-2xl">
                          {getInitials(
                            profile?.full_name ||
                              user.email?.split("@")[0] ||
                              "U"
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* User Info */}
                    <div>
                      <h2 className="text-xl font-semibold">
                        {profile?.full_name || user.email?.split("@")[0]}
                      </h2>
                      <p className="text-muted-foreground flex items-center justify-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {stats.totalGoals}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Goals
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.completedGoals}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Completed
                        </div>
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined {formatDate(user.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="edit">Edit Profile</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Statistics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Goal Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.totalGoals}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Goals
                          </div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {stats.completedGoals}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Completed
                          </div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {stats.completionRate}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Success Rate
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {goals.slice(0, 5).map((goal, index) => (
                          <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-lg border"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                goal.status === "completed"
                                  ? "bg-green-100 dark:bg-green-900"
                                  : "bg-blue-100 dark:bg-blue-900"
                              }`}
                            >
                              {goal.status === "completed" ? (
                                <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{goal.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {goal.status === "completed"
                                  ? "Completed"
                                  : "In Progress"}{" "}
                                • {formatDate(goal.updated_at)}
                              </div>
                            </div>
                            <Badge
                              variant={
                                goal.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                goal.status === "completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : ""
                              }
                            >
                              {goal.status}
                            </Badge>
                          </motion.div>
                        ))}

                        {goals.length === 0 && (
                          <div className="text-center py-6 text-muted-foreground">
                            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No activity yet</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {achievements.map((achievement, index) => (
                          <motion.div
                            key={achievement.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`p-4 rounded-lg border ${
                              achievement.earned
                                ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-200/20"
                                : "opacity-60 bg-muted/50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-3xl">{achievement.icon}</div>
                              <div className="flex-1">
                                <h3 className="font-semibold">
                                  {achievement.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {achievement.description}
                                </p>
                                {achievement.earned ? (
                                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    Earned{" "}
                                    {achievement.earnedDate &&
                                      formatDate(achievement.earnedDate)}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Not earned</Badge>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Edit Profile Tab */}
              <TabsContent value="edit" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-primary" />
                        Edit Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={editedProfile.full_name}
                            onChange={(e) =>
                              setEditedProfile((prev) => ({
                                ...prev,
                                full_name: e.target.value,
                              }))
                            }
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleSaveProfile} className="gap-2">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
