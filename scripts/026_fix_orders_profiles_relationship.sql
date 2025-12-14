-- ============================================================================
-- FIX ORDERS-PROFILES RELATIONSHIP ISSUE
-- ============================================================================

-- Ensure the profiles table has the correct foreign key constraint (drop if exists first)
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Ensure the orders table has the correct foreign key constraint (drop if exists first)
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE orders
ADD CONSTRAINT orders_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Add a comment to explain the relationship
COMMENT ON TABLE orders IS 'Orders placed by users, linked to auth.users via user_id';
COMMENT ON TABLE profiles IS 'User profiles, linked to auth.users via id';