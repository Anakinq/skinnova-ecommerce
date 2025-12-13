-- =====================================================
-- Make administrator@skinnova.ng an Admin
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Ensure is_admin column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Step 2: Make administrator@skinnova.ng an admin
UPDATE profiles 
SET is_admin = true 
WHERE email = 'administrator@skinnova.ng';

-- Step 3: Verify the update
SELECT 
    id,
    email,
    full_name,
    is_admin,
    created_at
FROM profiles
WHERE email = 'administrator@skinnova.ng';

-- =====================================================
-- Expected Result:
-- You should see is_admin = true for administrator@skinnova.ng
-- =====================================================

-- Step 4: Ensure RLS policies exist for admin actions
-- (These allow admins to create/edit/delete products)

DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

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

-- =====================================================
-- After running this script:
-- 1. Refresh your browser (Ctrl+Shift+R / Cmd+Shift+R)
-- 2. You should see "Admin" link in the navigation
-- 3. Click "Admin" to go to /admin
-- 4. Click "Manage Products"
-- 5. You'll see the "Add Product" button
-- =====================================================
