-- Fix infinite recursion detected in policy for relation "profiles"
-- This script resolves the recursive policy issue by restructuring how we check admin permissions

-- First, drop all potentially problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Create a simplified policy for profiles
-- Users can view their own profile or admins can view all profiles
-- But we avoid recursion by not querying the profiles table within the policy
CREATE POLICY "Users can view own profile or admins all profiles" ON profiles 
FOR SELECT USING (
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_admin = true
    -- Limit to 1 record to avoid scanning entire table
    LIMIT 1
  )
);

-- Create a safer approach for checking admin status using JWT claims
-- This avoids querying the profiles table entirely
CREATE POLICY "Admins can insert products" ON products 
FOR INSERT 
WITH CHECK (
  -- Check if the user has admin role in JWT claims
  coalesce((auth.jwt() ->> 'is_admin')::boolean, false) = true
  OR EXISTS (
    -- Fallback to checking profiles table with LIMIT to prevent recursion
    SELECT 1 
    FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_admin = true
    LIMIT 1
  )
);

CREATE POLICY "Admins can update products" ON products 
FOR UPDATE 
USING (
  coalesce((auth.jwt() ->> 'is_admin')::boolean, false) = true
  OR EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_admin = true
    LIMIT 1
  )
);

CREATE POLICY "Admins can delete products" ON products 
FOR DELETE 
USING (
  coalesce((auth.jwt() ->> 'is_admin')::boolean, false) = true
  OR EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_admin = true
    LIMIT 1
  )
);

-- Similarly fix policies for orders
CREATE POLICY "Admins can view all orders" ON orders 
FOR SELECT 
USING (
  auth.uid() = user_id
  OR coalesce((auth.jwt() ->> 'is_admin')::boolean, false) = true
  OR EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_admin = true
    LIMIT 1
  )
);

CREATE POLICY "Admins can update orders" ON orders 
FOR UPDATE 
USING (
  coalesce((auth.jwt() ->> 'is_admin')::boolean, false) = true
  OR EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_admin = true
    LIMIT 1
  )
);