-- =====================================================
-- Complete Admin Product Access Fix
-- =====================================================
-- This script ensures admins can create, edit, and delete products
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Ensure is_admin column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Step 2: Drop existing admin policies (to recreate them cleanly)
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Step 3: Create admin policies for products
CREATE POLICY "Admins can insert products" ON products 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update products" ON products 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete products" ON products 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Step 4: Grant admin access to view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Admins can view all orders" ON orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ) OR auth.uid() = user_id
);

CREATE POLICY "Admins can update orders" ON orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Step 5: Grant admin access to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ) OR auth.uid() = id
);

-- =====================================================
-- IMPORTANT: Make yourself an admin
-- =====================================================
-- After signing up, run this query with your email:
-- UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
--
-- To verify your admin status:
-- SELECT email, is_admin FROM profiles WHERE email = 'your-email@example.com';
-- =====================================================
