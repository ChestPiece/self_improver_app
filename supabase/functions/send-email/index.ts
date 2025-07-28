// Supabase Edge Function for sending emails
// Deploy with: supabase functions deploy send-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  to: string;
  subject: string;
  template:
    | "goal_reminder"
    | "habit_reminder"
    | "achievement"
    | "weekly_report"
    | "welcome";
  data: Record<string, any>;
}

// Email templates
const emailTemplates = {
  goal_reminder: (data: any) => ({
    subject: `🎯 Goal Reminder: ${data.goalTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">🎯 Goal Reminder</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin-top: 0;">${data.goalTitle}</h2>
          <p style="color: #64748b; margin: 10px 0;">${data.goalDescription}</p>
          
          ${
            data.daysUntilDeadline <= 0
              ? `<p style="color: #dc2626; font-weight: bold;">⏰ This goal is due today!</p>`
              : `<p style="color: #059669;">📅 Due in ${
                  data.daysUntilDeadline
                } day${data.daysUntilDeadline > 1 ? "s" : ""}</p>`
          }
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #1e40af;">
            <strong>Keep pushing forward!</strong> Every step counts toward achieving your goal.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${data.dashboardUrl}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Your Goals
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Self Improver - Your Personal Growth Journey
          </p>
        </div>
      </div>
    `,
  }),

  habit_reminder: (data: any) => ({
    subject: `📅 Daily Reminder: ${data.habitName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin: 0;">📅 Habit Reminder</h1>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #166534; margin-top: 0;">${data.habitName}</h2>
          <p style="color: #15803d;">Don't forget to complete your daily habit!</p>
          
          ${
            data.currentStreak > 0
              ? `<p style="color: #dc2626;">🔥 Current streak: <strong>${data.currentStreak} days</strong></p>`
              : '<p style="color: #64748b;">Start your streak today!</p>'
          }
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #92400e;">
            <strong>Consistency is key!</strong> Small daily actions lead to big transformations.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${data.dashboardUrl}" 
             style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Complete Habit
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Self Improver - Building Better Habits
          </p>
        </div>
      </div>
    `,
  }),

  achievement: (data: any) => ({
    subject: `🏆 Achievement Unlocked: ${data.achievementTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin: 0;">🏆 Achievement Unlocked!</h1>
        </div>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: #dc2626; margin-top: 0; font-size: 24px;">${data.achievementTitle}</h2>
          <p style="color: #991b1b; font-size: 18px; margin: 10px 0;">${data.description}</p>
          <div style="font-size: 48px; margin: 20px 0;">🎉</div>
        </div>
        
        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #9a3412; text-align: center;">
            <strong>Congratulations!</strong> Your dedication and consistency have paid off. Keep up the amazing work!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${data.dashboardUrl}" 
             style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Your Progress
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Self Improver - Celebrating Your Success
          </p>
        </div>
      </div>
    `,
  }),

  weekly_report: (data: any) => ({
    subject: `📊 Your Weekly Progress Report`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">📊 Weekly Progress Report</h1>
          <p style="color: #64748b; margin: 10px 0;">Week of ${data.weekStart} - ${data.weekEnd}</p>
        </div>
        
        <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #6b21a8; margin-top: 0;">This Week's Achievements</h2>
          
          <div style="display: grid; gap: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 6px;">
              <span style="color: #1e293b;">🎯 Goals Completed</span>
              <strong style="color: #2563eb;">${data.goalsCompleted}</strong>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 6px;">
              <span style="color: #1e293b;">📅 Habits Completed</span>
              <strong style="color: #059669;">${data.habitsCompleted}</strong>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 6px;">
              <span style="color: #1e293b;">🧘 Practice Minutes</span>
              <strong style="color: #dc2626;">${data.practiceMinutes}</strong>
            </div>
          </div>
        </div>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #166534; text-align: center;">
            <strong>Keep it up!</strong> ${data.encouragementMessage}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${data.dashboardUrl}" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Full Report
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Self Improver - Track Your Growth
          </p>
        </div>
      </div>
    `,
  }),

  welcome: (data: any) => ({
    subject: `🌟 Welcome to Self Improver!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">🌟 Welcome to Self Improver!</h1>
          <p style="color: #64748b; margin: 10px 0;">Your personal growth journey starts now</p>
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; margin-top: 0;">Hi ${data.userName}! 👋</h2>
          <p style="color: #1e40af; margin: 10px 0;">
            We're excited to have you join our community of achievers. Self Improver is here to help you:
          </p>
          
          <ul style="color: #1e40af; margin: 15px 0;">
            <li>Set and track meaningful goals</li>
            <li>Build consistent daily habits</li>
            <li>Practice mindfulness and wellness</li>
            <li>Monitor your progress over time</li>
          </ul>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #166534; margin-top: 0;">Ready to get started?</h3>
          <p style="color: #15803d; margin: 10px 0;">
            Jump right into your dashboard to start creating goals, building habits, and tracking your progress!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${data.dashboardUrl}" 
             style="background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Go to Dashboard
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Self Improver - Transform Your Life, One Step at a Time
          </p>
        </div>
      </div>
    `,
  }),
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const { to, template, data }: EmailPayload = await req.json();

    // Validate required fields
    if (!to || !template || !emailTemplates[template]) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields or invalid template",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate email content
    const emailContent = emailTemplates[template](data);

    // Here you would integrate with your email service
    // Examples: Resend, SendGrid, Mailgun, etc.

    // For demonstration, using a hypothetical email service
    // Replace this with your actual email service integration

    const emailServiceApiKey = Deno.env.get("EMAIL_SERVICE_API_KEY");
    if (!emailServiceApiKey) {
      throw new Error("Email service not configured");
    }

    // Example with Resend (you can replace with your preferred service)
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${emailServiceApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Self Improver <noreply@selfimprover.app>",
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Email service error:", error);
      throw new Error("Failed to send email");
    }

    const emailResult = await emailResponse.json();

    // Log email sent to database for tracking
    await supabaseClient.from("email_logs").insert({
      recipient: to,
      template: template,
      status: "sent",
      external_id: emailResult.id || null,
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        id: emailResult.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
 