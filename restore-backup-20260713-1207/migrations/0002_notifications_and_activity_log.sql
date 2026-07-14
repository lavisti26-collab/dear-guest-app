-- Migration 0002_notifications_and_activity_log.sql
-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    recipient_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
DROP POLICY IF EXISTS "Anyone can view notifications" ON public.notifications;
CREATE POLICY "Anyone can view notifications" ON public.notifications
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT SELECT, INSERT ON public.notifications TO anon, authenticated;

-- Create super_admin_activity_log table
CREATE TABLE IF NOT EXISTS public.super_admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.super_admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for super_admin_activity_log
DROP POLICY IF EXISTS "Super admins can view activity logs" ON public.super_admin_activity_log;
CREATE POLICY "Super admins can view activity logs" ON public.super_admin_activity_log
    FOR SELECT TO authenticated
    USING (public.current_user_is_super_admin());

DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.super_admin_activity_log;
CREATE POLICY "Authenticated users can insert activity logs" ON public.super_admin_activity_log
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT SELECT, INSERT ON public.super_admin_activity_log TO authenticated;

-- Add unique constraint on guests to prevent duplicates per wedding owner
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS unique_user_guest_name;
ALTER TABLE public.guests ADD CONSTRAINT unique_user_guest_name UNIQUE (user_id, guest_name);
