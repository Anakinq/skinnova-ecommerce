-- ============================================================================
-- INVENTORY MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to deduct inventory after payment confirmation
CREATE OR REPLACE FUNCTION deduct_inventory(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(0, stock_quantity - p_quantity),
      updated_at = NOW()
  WHERE id = p_product_id;
  
  -- Log if stock goes negative (shouldn't happen with proper locks)
  IF (SELECT stock_quantity FROM products WHERE id = p_product_id) < 0 THEN
    RAISE WARNING 'Stock went negative for product %', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to restore inventory (for cancellations/refunds)
CREATE OR REPLACE FUNCTION restore_inventory(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity + p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-cancel expired unpaid orders
CREATE OR REPLACE FUNCTION cancel_expired_orders()
RETURNS TABLE(cancelled_order_id UUID, order_number TEXT) AS $$
DECLARE
  v_order RECORD;
BEGIN
  FOR v_order IN
    SELECT id, order_number, user_id
    FROM orders
    WHERE order_status = 'pending_payment'
      AND expires_at < NOW()
      AND expires_at IS NOT NULL
  LOOP
    -- Release inventory locks
    DELETE FROM inventory_locks WHERE order_id = v_order.id;
    
    -- Update order status
    UPDATE orders
    SET order_status = 'cancelled',
        updated_at = NOW()
    WHERE id = v_order.id;
    
    -- Add log entry
    PERFORM add_order_log(
      v_order.id,
      'system',
      'auto_cancelled',
      'Order auto-cancelled due to payment timeout',
      NULL
    );
    
    -- Return cancelled order info
    cancelled_order_id := v_order.id;
    order_number := v_order.order_number;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cancel_expired_orders IS 'Auto-cancels orders that have exceeded payment timeout';
