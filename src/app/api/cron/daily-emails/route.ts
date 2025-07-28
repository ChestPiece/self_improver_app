import { NextRequest, NextResponse } from "next/server";
import { scheduleEmailNotifications } from "@/lib/email/service";
import { createClient } from "@/lib/supabase/server";

// This API route can be called by a CRON service (like Vercel Cron or external)
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET_KEY;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all users who have email notifications enabled
    const { data: users, error } = await supabase
      .from("user_settings")
      .select("user_id")
      .eq("settings->notifications->email", true);

    if (error) {
      throw error;
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users with email notifications enabled",
      });
    }

    let successCount = 0;
    let errorCount = 0;

    // Schedule email notifications for each user
    for (const user of users) {
      try {
        await scheduleEmailNotifications(user.user_id);
        successCount++;
      } catch (error) {
        console.error(
          `Failed to schedule emails for user ${user.user_id}:`,
          error
        );
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${users.length} users`,
      details: {
        successful: successCount,
        errors: errorCount,
      },
    });
  } catch (error) {
    console.error("CRON job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: "Daily email CRON endpoint",
    usage: "POST with Bearer token authorization",
  });
}
