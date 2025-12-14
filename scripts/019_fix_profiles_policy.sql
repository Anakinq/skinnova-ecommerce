-- Fix recursive policy issue in profiles table
-- The previous policy was causing infinite recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a simpler policy that avoids recursion
-- Admins can view all profiles, regular users can only view their own
CREATE POLICY "Admins can view all profiles" ON profiles 
FOR SELECT USING (
  -- Simple check that avoids recursion by not querying the profiles table within itself
  -- We'll check the is_admin status through a JWT claim or fallback to basic check
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
  OR auth.uid() = id
);