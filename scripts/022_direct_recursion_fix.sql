-- Direct fix for infinite recursion in profiles policy
-- This is a more aggressive approach to immediately resolve the issue

-- First, completely disable the problematic policy temporarily
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins all profiles" ON profiles;

-- Create a simple, non-recursive policy for profiles
CREATE POLICY "Users can view own profile only" ON profiles 
FOR SELECT USING (auth.uid() = id);

-- For products, create policies that don't rely on profile checks within the same query
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Create simple product policies that use auth.jwt() claims
CREATE POLICY "Admins can insert products" ON products 
FOR INSERT 
WITH CHECK (
  -- Check admin status from JWT claims to avoid recursion
  coalesce((auth.jwt() ->> 'is_admin')::boolean, false) = true
);

CREATE POLICY "Admins can update products" ON products 
FOR UPDATE 
USING (
  coalesce((auth.jwt() ->> 'is_admin')::boolean, false) = true
);

CREATE POLICY "Admins can delete products" ON products 
FOR DELETE 
USING (
  coalesce((auth.jwt() ->> 'is_admin')::boolean, false) = true
);

-- Also fix orders policies
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR coalesce((auth.jwt() ->> 'is_admin')::boolean, false) = true
);

CREATE POLICY "Admins can update orders" ON orders 
FOR UPDATE 
USING (
  coalesce((auth.jwt() ->> 'is_admin')::boolean, false) = true
);

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';