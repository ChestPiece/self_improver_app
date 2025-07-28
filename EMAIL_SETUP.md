# Email Notifications Setup Guide

This guide explains how to set up email notifications for the Self Improver app using Supabase Edge Functions.

## 🚀 Quick Start

### 1. Deploy the Supabase Edge Function

```bash
# Navigate to your project directory
cd your-project

# Deploy the email function to Supabase
supabase functions deploy send-email

# Set up environment variables in Supabase Dashboard
# Go to Project Settings > Edge Functions > Environment Variables
```

### 2. Required Environment Variables

Add these environment variables in your Supabase Dashboard:

```env
# Email Service API Key (example with Resend)
EMAIL_SERVICE_API_KEY=re_your_resend_api_key_here

# For CRON job security
CRON_SECRET_KEY=your_secure_random_string_here

# App URL for email links
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

### 3. Set up Email Service Provider

#### Option A: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add your domain and verify it
4. Use the API key as `EMAIL_SERVICE_API_KEY`

#### Option B: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Update the email function to use SendGrid API

#### Option C: Mailgun

1. Sign up at [mailgun.com](https://mailgun.com)
2. Get your API key and domain
3. Update the email function to use Mailgun API

### 4. Update the Edge Function

The Edge Function is located at `supabase/functions/send-email/index.ts`.

If you're not using Resend, update the email sending logic:

```typescript
// For SendGrid
const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${emailServiceApiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: to }] }],
    from: { email: "noreply@yourdomain.com", name: "Self Improver" },
    subject: emailContent.subject,
    content: [{ type: "text/html", value: emailContent.html }],
  }),
});
```

### 5. Set up CRON Jobs

#### Option A: Vercel Cron (if deployed on Vercel)

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-emails",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/weekly-reports",
      "schedule": "0 9 * * 0"
    }
  ]
}
```

#### Option B: External CRON Service

Use services like:

- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [Crontab.guru](https://crontab.guru) (for syntax)

Set up these endpoints:

- Daily: `POST https://your-app.com/api/cron/daily-emails`
- Weekly: `POST https://your-app.com/api/cron/weekly-reports`

Include the Authorization header: `Bearer your_cron_secret_key`

### 6. Database Setup

Add the email logs table to track sent emails:

```sql
-- Add to your Supabase SQL editor
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient VARCHAR(255) NOT NULL,
    template VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    external_id VARCHAR(255),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policy
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage email logs
CREATE POLICY "Service role can manage email logs" ON email_logs
    FOR ALL USING (auth.role() = 'service_role');
```

## 📧 Email Types

The system supports these email templates:

### 1. Welcome Email

- **Trigger**: New user registration
- **Purpose**: Welcome new users and direct them to the dashboard
- **Frequency**: Once per user

### 2. Goal Reminders

- **Trigger**: Goals due within 3 days
- **Purpose**: Remind users about upcoming deadlines
- **Frequency**: Daily check

### 3. Habit Reminders

- **Trigger**: Daily habits not completed
- **Purpose**: Encourage daily habit completion
- **Frequency**: Daily for incomplete habits

### 4. Achievement Notifications

- **Trigger**: Milestone achievements (streaks, completions)
- **Purpose**: Celebrate user success
- **Frequency**: Real-time when achievements are unlocked

### 5. Weekly Progress Reports

- **Trigger**: Every Sunday
- **Purpose**: Weekly summary of progress
- **Frequency**: Weekly

## ⚙️ User Settings

Users can control their email preferences in Settings:

```typescript
// User settings structure
{
  notifications: {
    email: true,                 // Master email toggle
    goalReminders: true,         // Goal deadline reminders
    habitReminders: true,        // Daily habit reminders
    achievements: true,          // Achievement celebrations
    weeklyReport: true          // Weekly progress summaries
  }
}
```

## 🔧 Customization

### Custom Email Templates

Edit templates in `supabase/functions/send-email/index.ts`:

```typescript
const emailTemplates = {
  custom_template: (data: any) => ({
    subject: `Custom Subject: ${data.title}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h1>${data.title}</h1>
        <p>${data.message}</p>
      </div>
    `,
  }),
};
```

### Custom Styling

Update the HTML templates with your brand colors and styling:

```typescript
// Replace color values
"color: #2563eb"; // Primary blue
"color: #059669"; // Success green
"color: #dc2626"; // Accent red
```

## 🚨 Troubleshooting

### Common Issues

1. **Emails not sending**

   - Check API key is correct
   - Verify domain is verified with email provider
   - Check Supabase function logs

2. **CRON jobs not running**

   - Verify CRON secret key matches
   - Check CRON service configuration
   - Test endpoints manually

3. **Users not receiving emails**
   - Check user notification preferences
   - Verify email addresses are correct
   - Check spam/junk folders

### Debug Mode

Add debug logging to the Edge Function:

```typescript
console.log("Email data:", { to, template, data });
console.log("Email service response:", emailResult);
```

View logs in Supabase Dashboard > Edge Functions > Logs

## 🔒 Security

- Email API keys are stored securely in Supabase
- CRON endpoints require authorization tokens
- Email logs track all sent emails for auditing
- Users control their own notification preferences

## 🎯 Best Practices

1. **Respect user preferences** - Always check settings before sending
2. **Rate limiting** - Don't overwhelm users with emails
3. **Meaningful content** - Make emails valuable and actionable
4. **Mobile-friendly** - Email templates work on all devices
5. **Clear unsubscribe** - Easy way to disable notifications

## 📊 Monitoring

Track email performance:

- Delivery rates via email provider dashboard
- User engagement via click tracking
- Email logs table for audit trail
- User feedback on notification preferences

Your Self Improver app now has a complete email notification system! 🎉
 