-- Fix recursive policy issue in profiles table
-- The previous policy was causing infinite recursion when checking if a user is admin

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a new policy that avoids recursion
-- Admins can view all profiles, regular users can only view their own
CREATE POLICY "Admins can view all profiles" ON profiles 
FOR SELECT USING (
  -- Use a subquery that doesn't reference the same table in a way that causes recursion
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  OR auth.uid() = id
);

-- Handle potential issues with the subquery by adding a safeguard
-- This ensures the policy works even if the subquery fails
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(is_admin, false)
    FROM profiles
    WHERE id = auth.uid()
    LIMIT 1
  );
EXCEPTION 
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the policy to use the function
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles 
FOR SELECT USING (
  check_is_admin() OR auth.uid() = id
);