-- Alternative solution for infinite recursion issue
-- This approach uses a materialized view to avoid recursive policy checks

-- Step 1: Create a materialized view for admin users
-- This avoids querying the profiles table directly in policies
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_users AS
SELECT id FROM profiles WHERE is_admin = true;

-- Step 2: Create a function to refresh the materialized view
-- This should be called whenever admin status changes
CREATE OR REPLACE FUNCTION refresh_admin_users()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW admin_users;
  RETURN NULL;
END;

$$ LANGUAGE plpgsql;

-- Step 3: Create triggers to refresh the view when profiles change
DROP TRIGGER IF EXISTS refresh_admin_users_trigger ON profiles;

CREATE TRIGGER refresh_admin_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_admin_users();

-- Step 4: Drop existing recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Step 5: Create new policies using the materialized view
-- Profiles policy - simple and non-recursive
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

-- Product policies using the materialized view
CREATE POLICY "Admins can insert products" ON products 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

CREATE POLICY "Admins can update products" ON products 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

CREATE POLICY "Admins can delete products" ON products 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

-- Step 6: Refresh the materialized view to populate it
REFRESH MATERIALIZED VIEW admin_users;

-- Step 7: Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';