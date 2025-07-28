-- Migration for Self-Improvement App tables
-- Run these commands in your Supabase SQL editor

-- 0. User Profiles Table (Essential for user data)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Index for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1. User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id)
);

-- 2. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('goal_reminder', 'habit_reminder', 'achievement', 'weekly_report', 'system')),
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Onboarding Progress Table
CREATE TABLE IF NOT EXISTS onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    step VARCHAR(100) NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, step)
);

-- 4. Update existing tables to have user_id properly referenced if not already done
ALTER TABLE practices ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE practices ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- 5. Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_practices_user_id ON practices(user_id);
CREATE INDEX IF NOT EXISTS idx_practices_public ON practices(is_public) WHERE is_public = true;

-- 6. RLS (Row Level Security) Policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- User Settings Policies
CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Onboarding Progress Policies
CREATE POLICY "Users can view their own onboarding progress" ON onboarding_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding progress" ON onboarding_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding progress" ON onboarding_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Practices Policies (updated for public/private)
DROP POLICY IF EXISTS "Users can view their own practices" ON practices;
CREATE POLICY "Users can view their own and public practices" ON practices
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own practices" ON practices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practices" ON practices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own practices" ON practices
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at BEFORE UPDATE ON onboarding_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Functions for common operations

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title VARCHAR(255),
    p_message TEXT,
    p_type VARCHAR(50)
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (p_user_id, p_title, p_message, p_type)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications 
    SET is_read = true, updated_at = now()
    WHERE id = p_notification_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = p_user_id AND is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete onboarding step
CREATE OR REPLACE FUNCTION complete_onboarding_step(
    p_user_id UUID,
    p_step VARCHAR(100),
    p_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO onboarding_progress (user_id, step, completed, data)
    VALUES (p_user_id, p_step, true, p_data)
    ON CONFLICT (user_id, step)
    DO UPDATE SET 
        completed = true,
        data = EXCLUDED.data,
        updated_at = now();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has completed onboarding
CREATE OR REPLACE FUNCTION is_onboarding_complete(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    required_steps TEXT[] := ARRAY['welcome', 'profile_setup', 'first_goal', 'first_habit'];
    completed_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO completed_count
    FROM onboarding_progress
    WHERE user_id = p_user_id 
    AND step = ANY(required_steps)
    AND completed = true;
    
    RETURN completed_count = array_length(required_steps, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Insert some predefined public practices
INSERT INTO practices (title, description, category, duration, difficulty_level, instructions, is_public, user_id) 
VALUES 
    (
        'Morning Meditation',
        'Start your day with mindfulness and clarity',
        'mental_health',
        10,
        'beginner',
        ARRAY[
            'Find a quiet, comfortable place to sit',
            'Close your eyes and focus on your breath',
            'When thoughts arise, gently return focus to breathing',
            'Start with 5 minutes and gradually increase',
            'End with gratitude for this moment'
        ],
        true,
        '00000000-0000-0000-0000-000000000000'::uuid
    ),
    (
        'Quick Cardio Workout',
        'Get your heart pumping with this 15-minute routine',
        'physical_health',
        15,
        'intermediate',
        ARRAY[
            'Warm up with light stretching (2 minutes)',
            'Jumping jacks - 30 seconds',
            'Push-ups - 30 seconds',
            'High knees - 30 seconds',
            'Squats - 30 seconds',
            'Repeat circuit 3 times',
            'Cool down with stretching (2 minutes)'
        ],
        true,
        '00000000-0000-0000-0000-000000000000'::uuid
    ),
    (
        'Gratitude Journaling',
        'Reflect on positive aspects of your life',
        'personal_development',
        5,
        'beginner',
        ARRAY[
            'Get a notebook or journal',
            'Write down 3 things you are grateful for today',
            'Be specific about why you are grateful for each item',
            'Reflect on how these things made you feel',
            'Make this a daily practice for best results'
        ],
        true,
        '00000000-0000-0000-0000-000000000000'::uuid
    )
ON CONFLICT DO NOTHING;

-- 10. Email notification functions (for use with Supabase Edge Functions)
CREATE OR REPLACE FUNCTION schedule_email_notification(
    p_user_id UUID,
    p_email_type VARCHAR(50),
    p_schedule_for TIMESTAMP WITH TIME ZONE,
    p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    -- Create a notification record that Edge Functions can process
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        p_user_id,
        'Email Scheduled: ' || p_email_type,
        'Scheduled for: ' || p_schedule_for::text,
        'system'
    )
    RETURNING id INTO notification_id;
    
    -- In a real implementation, this would trigger an Edge Function
    -- For now, we'll just create the notification record
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 