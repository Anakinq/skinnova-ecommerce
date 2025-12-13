-- ============================================================================
-- PRODUCTION-READY ORDER & PAYMENT SYSTEM
-- Implements FSM, inventory locks, payment tracking, audit logs, and webhooks
-- ============================================================================

-- Drop existing constraints that may conflict
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Create comprehensive ENUMs for order lifecycle
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending_payment',
    'payment_failed', 
    'paid',
    'processing',
    'ready_for_shipment',
    'shipped',
    'in_transit',
    'delivered',
    'cancel_requested',
    'cancelled',
    'partially_refunded',
    'refunded',
    'disputed',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'not_paid',
    'pending',
    'paid',
    'partially_refunded',
    'refunded',
    'disputed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'paystack',
    'stripe',
    'flutterwave',
    'bank_transfer',
    'cash_on_delivery'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- ENHANCED ORDERS TABLE
-- ============================================================================
-- Add new columns to existing orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS order_status order_status DEFAULT 'pending_payment',
  ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'not_paid',
  ADD COLUMN IF NOT EXISTS payment_method payment_method,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'NGN',
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address JSONB,
  ADD COLUMN IF NOT EXISTS billing_address JSONB,
  ADD COLUMN IF NOT EXISTS items_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS fulfillment JSONB,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create audit log structure within orders
COMMENT ON COLUMN orders.metadata IS 'Stores logs array: [{actor, action, message, at, ip}]';

-- ============================================================================
-- PAYMENT TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL,
  gateway_payment_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'initiated',
  raw_response JSONB,
  attempts INTEGER DEFAULT 1,
  idempotency_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_payments_order_id ON order_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_payments_gateway_payment_id ON order_payments(gateway, gateway_payment_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_payments_idempotency ON order_payments(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- ============================================================================
-- INVENTORY LOCKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory_locks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  qty_reserved INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_locks_product_id ON inventory_locks(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_locks_order_id ON inventory_locks(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_locks_expires_at ON inventory_locks(expires_at);

-- ============================================================================
-- REFUNDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'NGN',
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  gateway_refund_id TEXT,
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);

-- ============================================================================
-- WEBHOOK EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gateway TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_gateway_event ON webhook_events(gateway, event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed, created_at);

-- ============================================================================
-- NOTIFICATION QUEUE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  subject TEXT,
  body TEXT,
  template_name TEXT,
  template_data JSONB,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status, created_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to clean up expired inventory locks
CREATE OR REPLACE FUNCTION cleanup_expired_inventory_locks()
RETURNS void AS $$
BEGIN
  DELETE FROM inventory_locks
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get available stock (considering locks)
CREATE OR REPLACE FUNCTION get_available_stock(p_product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_stock INTEGER;
  v_locked INTEGER;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO v_stock
  FROM products
  WHERE id = p_product_id;
  
  -- Get locked quantity (excluding expired locks)
  SELECT COALESCE(SUM(qty_reserved), 0) INTO v_locked
  FROM inventory_locks
  WHERE product_id = p_product_id
    AND expires_at > NOW();
  
  RETURN GREATEST(0, v_stock - v_locked);
END;
$$ LANGUAGE plpgsql;

-- Function to add audit log entry to order
CREATE OR REPLACE FUNCTION add_order_log(
  p_order_id UUID,
  p_actor TEXT,
  p_action TEXT,
  p_message TEXT,
  p_ip TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_log_entry JSONB;
  v_current_logs JSONB;
BEGIN
  -- Create new log entry
  v_log_entry := jsonb_build_object(
    'actor', p_actor,
    'action', p_action,
    'message', p_message,
    'at', NOW(),
    'ip', p_ip
  );
  
  -- Get current logs or initialize empty array
  SELECT COALESCE(metadata->'logs', '[]'::jsonb) INTO v_current_logs
  FROM orders
  WHERE id = p_order_id;
  
  -- Append new log entry
  UPDATE orders
  SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{logs}',
    v_current_logs || v_log_entry
  ),
  updated_at = NOW()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_payments_updated_at BEFORE UPDATE ON order_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Users can view their own order payments
CREATE POLICY "Users can view own order payments" ON order_payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_payments.order_id AND orders.user_id = auth.uid()
  )
);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON order_payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Admins can manage refunds
CREATE POLICY "Admins can manage refunds" ON refunds FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Users can view their refunds
CREATE POLICY "Users can view own refunds" ON refunds FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = refunds.order_id AND orders.user_id = auth.uid()
  )
);

-- Only system/admins can access webhook events
CREATE POLICY "Admins can view webhook events" ON webhook_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id_status ON orders(user_id, order_status);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- ============================================================================
-- INITIAL DATA & CONFIGURATIONS
-- ============================================================================

-- Create a settings table for platform configuration
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('inventory_lock_duration_minutes', '30', 'Duration in minutes to hold inventory during checkout'),
  ('order_expiry_hours', '24', 'Hours before unpaid orders auto-cancel'),
  ('free_shipping_threshold_cents', '8000000', 'Order value in cents for free shipping (NGN 80,000)'),
  ('default_shipping_cents', '1000000', 'Default shipping cost in cents (NGN 10,000)'),
  ('tax_rate', '0.08', 'Default tax rate (8%)'),
  ('payment_gateways', '{"paystack": {"enabled": true}, "stripe": {"enabled": false}}', 'Enabled payment gateways'),
  ('notification_channels', '{"email": true, "sms": false, "push": false}', 'Enabled notification channels')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE platform_settings IS 'Platform-wide configuration settings';
