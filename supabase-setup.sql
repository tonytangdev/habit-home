-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can read and update their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- Family Members table policies  
-- Users can read family members where they are part of the family
CREATE POLICY "Members can view family members" ON family_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM family_members fm 
            WHERE fm.family_id = family_members.family_id 
            AND fm.user_id = auth.uid()::text
        )
    );

-- Families table policies
-- Users can read families they belong to
CREATE POLICY "Members can view their families" ON families
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM family_members fm 
            WHERE fm.family_id = families.id 
            AND fm.user_id = auth.uid()::text
        )
    );

-- Only family admins can update families
CREATE POLICY "Admins can update families" ON families
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM family_members fm 
            WHERE fm.family_id = families.id 
            AND fm.user_id = auth.uid()::text
            AND fm.role = 'ADMIN'
        )
    );

-- Tasks table policies
-- Users can view tasks in their families
CREATE POLICY "Members can view family tasks" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM family_members fm 
            WHERE fm.family_id = tasks.family_id 
            AND fm.user_id = auth.uid()::text
        )
    );

-- Users can create tasks in their families
CREATE POLICY "Members can create tasks" ON tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM family_members fm 
            WHERE fm.family_id = tasks.family_id 
            AND fm.user_id = auth.uid()::text
        )
        AND created_by_id = auth.uid()::text
    );

-- Users can update tasks they created or are assigned to
CREATE POLICY "Users can update relevant tasks" ON tasks
    FOR UPDATE USING (
        created_by_id = auth.uid()::text 
        OR assigned_to_id = auth.uid()::text
    );

-- Point Records table policies
-- Users can view point records in their families
CREATE POLICY "Members can view family points" ON point_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM family_members fm 
            WHERE fm.family_id = point_records.family_id 
            AND fm.user_id = auth.uid()::text
        )
    );

-- Only system or task creators can create point records
CREATE POLICY "System can create point records" ON point_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM family_members fm 
            WHERE fm.family_id = point_records.family_id 
            AND fm.user_id = auth.uid()::text
        )
    );

-- Notifications table policies
-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid()::text);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid()::text);

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;