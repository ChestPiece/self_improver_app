"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Download,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Globe,
  Clock,
  Mail,
  Smartphone,
  AlertTriangle,
  Check,
  Info,
} from "lucide-react";
import { logout } from "@/lib/auth/actions";
import {
  saveUserSettings,
  exportUserData,
  deleteUserAccount,
} from "@/lib/settings/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SettingsPageClientProps {
  user: User;
  initialSettings: any;
}

interface SettingsState {
  notifications: {
    email: boolean;
    push: boolean;
    goalReminders: boolean;
    habitReminders: boolean;
    achievements: boolean;
    weeklyReport: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "system";
    language: string;
    timezone: string;
    startOfWeek: "sunday" | "monday";
    dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  };
  privacy: {
    profileVisibility: "public" | "private";
    shareProgress: boolean;
    allowAnalytics: boolean;
  };
}

export default function SettingsPageClient({
  user,
  initialSettings,
}: SettingsPageClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (
    category: keyof SettingsState,
    key: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("settings", JSON.stringify(settings));

      const result = await saveUserSettings(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const result = await exportUserData();

      if (!result?.success) {
        toast.error("Failed to export data");
        return;
      }

      // Create and download the file
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `self-improver-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Data export completed! File downloaded.");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    if (
      !confirm(
        "This will permanently delete ALL your data including goals, habits, and progress. Are you absolutely sure?"
      )
    ) {
      return;
    }

    try {
      const result = await deleteUserAccount();

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Account deleted successfully. Redirecting...");

      // Redirect to home page after a delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const handleLogout = async () => {
    await logout();
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
            className="flex items-center justify-between sidebar-squeeze"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <SettingsIcon className="h-8 w-8 text-primary" />
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Customize your experience and manage your account
              </p>
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 sidebar-content-adjust">
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label className="text-base font-medium">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) =>
                          handleSettingChange("notifications", "email", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label className="text-base font-medium">
                            Push Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications on your device
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) =>
                          handleSettingChange("notifications", "push", checked)
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Specific Notifications */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      Notification Types
                    </Label>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Goal Reminders</Label>
                          <p className="text-sm text-muted-foreground">
                            Reminders for goal deadlines
                          </p>
                        </div>
                        <Switch
                          checked={settings.notifications.goalReminders}
                          onCheckedChange={(checked) =>
                            handleSettingChange(
                              "notifications",
                              "goalReminders",
                              checked
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Habit Reminders</Label>
                          <p className="text-sm text-muted-foreground">
                            Daily habit completion reminders
                          </p>
                        </div>
                        <Switch
                          checked={settings.notifications.habitReminders}
                          onCheckedChange={(checked) =>
                            handleSettingChange(
                              "notifications",
                              "habitReminders",
                              checked
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Achievement Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Notifications when you earn achievements
                          </p>
                        </div>
                        <Switch
                          checked={settings.notifications.achievements}
                          onCheckedChange={(checked) =>
                            handleSettingChange(
                              "notifications",
                              "achievements",
                              checked
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Weekly Progress Report</Label>
                          <p className="text-sm text-muted-foreground">
                            Weekly summary of your progress
                          </p>
                        </div>
                        <Switch
                          checked={settings.notifications.weeklyReport}
                          onCheckedChange={(checked) =>
                            handleSettingChange(
                              "notifications",
                              "weeklyReport",
                              checked
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    App Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-base font-medium">Theme</Label>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred color scheme
                        </p>
                      </div>
                    </div>
                    <Select
                      value={theme}
                      onValueChange={(value: "light" | "dark" | "system") => {
                        setTheme(value);
                        handleSettingChange("preferences", "theme", value);
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-3 w-3" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-3 w-3" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-3 w-3" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Language */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-base font-medium">
                          Language
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Select your preferred language
                        </p>
                      </div>
                    </div>
                    <Select
                      value={settings.preferences.language}
                      onValueChange={(value) =>
                        handleSettingChange("preferences", "language", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Timezone */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-base font-medium">
                          Timezone
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Your local timezone
                        </p>
                      </div>
                    </div>
                    <Select
                      value={settings.preferences.timezone}
                      onValueChange={(value) =>
                        handleSettingChange("preferences", "timezone", value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">
                          Eastern Time
                        </SelectItem>
                        <SelectItem value="America/Chicago">
                          Central Time
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time
                        </SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start of Week */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">
                        Start of Week
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        First day of the week in calendars
                      </p>
                    </div>
                    <Select
                      value={settings.preferences.startOfWeek}
                      onValueChange={(value: any) =>
                        handleSettingChange("preferences", "startOfWeek", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunday">Sunday</SelectItem>
                        <SelectItem value="monday">Monday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Format */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">
                        Date Format
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        How dates are displayed
                      </p>
                    </div>
                    <Select
                      value={settings.preferences.dateFormat}
                      onValueChange={(value: any) =>
                        handleSettingChange("preferences", "dateFormat", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">
                        Profile Visibility
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Who can see your profile information
                      </p>
                    </div>
                    <Select
                      value={settings.privacy.profileVisibility}
                      onValueChange={(value: any) =>
                        handleSettingChange(
                          "privacy",
                          "profileVisibility",
                          value
                        )
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">
                        Share Progress
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see your progress updates
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.shareProgress}
                      onCheckedChange={(checked) =>
                        handleSettingChange("privacy", "shareProgress", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve the app with anonymous usage data
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.allowAnalytics}
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "privacy",
                          "allowAnalytics",
                          checked
                        )
                      }
                    />
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Your privacy is important to us. We only collect data that
                      helps improve your experience and never sell your personal
                      information.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid gap-6">
              {/* Account Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Account Created</Label>
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Data Management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Download className="h-4 w-4 text-blue-600" />
                        <div>
                          <Label className="text-base font-medium">
                            Export Data
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Download all your data
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleExportData}>
                        Export
                      </Button>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Data exports include your goals, habits, practice
                        sessions, and profile information in JSON format.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Danger Zone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <div>
                          <Label className="text-base font-medium text-destructive">
                            Delete Account
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all data
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                      >
                        Delete Account
                      </Button>
                    </div>

                    <Alert className="border-destructive/50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Account deletion is permanent and cannot be undone. All
                        your data will be permanently removed.
                      </AlertDescription>
                    </Alert>

                    <div className="pt-4">
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
