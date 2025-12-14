-- ============================================================================
-- FIX INVENTORY LOCKS RLS POLICIES
-- ============================================================================

-- Enable RLS on inventory_locks table
ALTER TABLE inventory_locks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create inventory locks" ON inventory_locks;
DROP POLICY IF EXISTS "Users can view own inventory locks" ON inventory_locks;
DROP POLICY IF EXISTS "Users can update own inventory locks" ON inventory_locks;
DROP POLICY IF EXISTS "Users can delete own inventory locks" ON inventory_locks;
DROP POLICY IF EXISTS "Admins can manage all inventory locks" ON inventory_locks;

-- Users can create inventory locks (needed during checkout)
CREATE POLICY "Users can create inventory locks" ON inventory_locks FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Users can view their own inventory locks
CREATE POLICY "Users can view own inventory locks" ON inventory_locks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = inventory_locks.order_id 
    AND orders.user_id = auth.uid()
  ) OR order_id IS NULL
);

-- Users can update their own inventory locks
CREATE POLICY "Users can update own inventory locks" ON inventory_locks FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = inventory_locks.order_id 
    AND orders.user_id = auth.uid()
  ) OR order_id IS NULL
);

-- Users can delete their own inventory locks
CREATE POLICY "Users can delete own inventory locks" ON inventory_locks FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = inventory_locks.order_id 
    AND orders.user_id = auth.uid()
  ) OR order_id IS NULL
);

-- Admins can manage all inventory locks
CREATE POLICY "Admins can manage all inventory locks" ON inventory_locks 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Also fix any missing policies for other tables
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (
  user_id = auth.uid()
);

-- Users can update their own orders (limited)
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

COMMENT ON TABLE inventory_locks IS 'Temporary inventory reservations during checkout process';
