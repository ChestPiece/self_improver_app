import { NextRequest, NextResponse } from 'next/server';
import { sendWeeklyReportsToAllUsers } from '@/lib/email/service';

// This API route should be called weekly by a CRON service
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET_KEY;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Send weekly reports to all eligible users
    const result = await sendWeeklyReportsToAllUsers();

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error('Weekly reports CRON job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Weekly reports CRON endpoint',
    usage: 'POST with Bearer token authorization',
    schedule: 'Should be called weekly (e.g., every Sunday)',
  });
} 
