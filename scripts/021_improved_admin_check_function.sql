-- Improved admin check function to prevent infinite recursion
-- This function uses a more efficient approach to check admin status

-- Create a secure function to check if user is admin
-- This avoids recursion by using a direct query with LIMIT
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_result BOOLEAN;
BEGIN
  -- Direct query with LIMIT to prevent scanning entire table
  SELECT p.is_admin INTO is_admin_result
  FROM profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
  
  -- Return the result or false if not found
  RETURN COALESCE(is_admin_result, false);
EXCEPTION 
  WHEN OTHERS THEN
    -- In case of any error, return false
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile or admins all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Recreate policies using the improved function
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles 
FOR SELECT USING (is_admin_user() = true);

-- Product policies for admins
CREATE POLICY "Admins can insert products" ON products 
FOR INSERT 
WITH CHECK (is_admin_user() = true);

CREATE POLICY "Admins can update products" ON products 
FOR UPDATE 
USING (is_admin_user() = true);

CREATE POLICY "Admins can delete products" ON products 
FOR DELETE 
USING (is_admin_user() = true);

-- Order policies for admins
CREATE POLICY "Users can view own orders" ON orders 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR is_admin_user() = true
);

CREATE POLICY "Admins can update orders" ON orders 
FOR UPDATE 
USING (is_admin_user() = true);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';