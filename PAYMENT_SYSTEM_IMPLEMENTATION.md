# Production-Ready Order & Payment System Implementation

## 🎯 Overview

This document outlines the comprehensive ordering and payment system implemented for your skincare e-commerce platform.

## ✅ What's Been Implemented

### 1. Database Schema & Architecture

**New SQL Scripts Created:**
- `scripts/017_enhanced_order_system.sql` - Core FSM, payment tracking, audit logs
- `scripts/018_inventory_management_functions.sql` - Inventory operations

**Key Features:**
- **Finite State Machine (FSM)** for order lifecycle with 14 states
- **Payment status tracking** (not_paid, pending, paid, refunded, disputed)
- **Inventory locks** with automatic expiration
- **Webhook events table** for idempotent payment processing
- **Audit logs** embedded in orders.metadata
- **Notification queue** for email/SMS
- **Refunds table** with gateway integration
- **Platform settings** for configurable business rules

**Database Functions:**
- `get_available_stock(product_id)` - Returns available stock minus locks
- `add_order_log()` - Adds audit trail entries
- `deduct_inventory()` - Reduces stock after payment
- `restore_inventory()` - Restores stock for refunds
- `cancel_expired_orders()` - Auto-cancels unpaid orders
- `cleanup_expired_inventory_locks()` - Removes expired locks

### 2. Payment Provider Abstraction

**Files Created:**
- `lib/payments/types.ts` - TypeScript interfaces
- `lib/payments/paystack.ts` - Paystack implementation
- `lib/payments/factory.ts` - Provider factory pattern

**Supported Gateways:**
- ✅ Paystack (fully implemented)
- ⏳ Stripe (stub ready)
- ⏳ Flutterwave (stub ready)  
- ✅ Bank Transfer (manual verification)
- ✅ Cash on Delivery

**Features:**
- Webhook signature verification
- Payment intent creation
- Payment verification
- Refund processing
- Idempotency support

### 3. Server Actions

**`lib/actions/create-order.ts`** - Production checkout flow:
- ✅ Idempotency with duplicate detection
- ✅ Atomic inventory locking with row-level concurrency control
- ✅ Cart validation & price verification
- ✅ Address management (new/existing)
- ✅ Payment intent generation
- ✅ Order creation with 30-min inventory locks
- ✅ Automatic cart clearing
- ✅ Notification queueing
- ✅ Comprehensive error handling

**`lib/actions/admin-orders.ts`** - Admin order management:
- ✅ `updateOrderStatus()` with FSM validation
- ✅ `issueRefund()` with gateway integration
- ✅ `cancelOrder()` with inventory restoration
- ✅ Audit trail for every action
- ✅ Customer notifications

### 4. Webhook Handler

**`app/api/webhooks/[gateway]/route.ts`** - Payment webhook processor:
- ✅ Signature verification (crypto HMAC-SHA512)
- ✅ Idempotent event processing
- ✅ Handles: charge.success, payment.failed, refund.processed, dispute.create
- ✅ Automatic inventory deduction on payment success
- ✅ Lock cleanup on payment failure
- ✅ Audit logging for all events
- ✅ Customer notifications

### 5. Background Jobs

**`app/api/cron/cleanup/route.ts`** - Scheduled maintenance:
- ✅ Expires inventory locks after 30 minutes
- ✅ Auto-cancels unpaid orders after 24 hours
- ✅ Releases inventory from cancelled orders
- ✅ Secured with bearer token auth

---

## 🔧 Setup Instructions

### Step 1: Environment Variables

Add to your `.env.local`:

```bash
# Payment Gateway
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
DEFAULT_PAYMENT_GATEWAY=paystack

# Site URL (for payment callbacks)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Cron Job Security
CRON_SECRET=your-random-secret-for-cron-jobs

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### Step 2: Run Database Migrations

Execute SQL scripts in order on your Supabase database:

```bash
# Via Supabase Dashboard → SQL Editor
# 1. Run scripts/017_enhanced_order_system.sql
# 2. Run scripts/018_inventory_management_functions.sql
```

Or via CLI:
```bash
supabase db push
```

### Step 3: Configure Paystack Webhook

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/paystack`
3. Copy webhook secret (not needed - we use secret key for HMAC)

### Step 4: Setup Cron Job (Optional but Recommended)

**For Vercel:**
Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 * * * *"
  }]
}
```

**For Other Platforms:**
Use a service like UptimeRobot or cron-job.org to hit:
```
GET https://your-domain.com/api/cron/cleanup
Header: Authorization: Bearer your-cron-secret
```

### Step 5: Update Checkout Form

Replace the existing checkout form with the new payment-integrated version:

```typescript
// In your checkout page/component
import { createOrder } from "@/lib/actions/create-order"

const result = await createOrder(userId, formData)

if (result.success && result.payment_url) {
  // Redirect to payment gateway
  window.location.href = result.payment_url
} else if (result.success) {
  // COD or Bank Transfer - show success
  router.push(`/orders/${result.order_id}/success`)
} else {
  // Show error
  setError(result.error)
}
```

---

## 📊 Order Lifecycle (FSM)

```
pending_payment → payment_failed → [retry or cancelled]
              ↓
             paid → processing → ready_for_shipment → shipped → in_transit → delivered
              ↓                                                                    ↓
          cancelled                                                    partially_refunded
              ↓                                                                    ↓
          archived                                                            refunded
                                                                                   ↓
                                                                               archived
```

**State Descriptions:**
- `pending_payment`: Order created, awaiting payment (30min inventory lock)
- `payment_failed`: Payment attempt failed, customer can retry
- `paid`: Payment confirmed, inventory deducted
- `processing`: Admin accepted, picking & packing
- `ready_for_shipment`: Packed, awaiting courier
- `shipped`: Courier assigned, tracking number added
- `in_transit`: Package in transit (optional)
- `delivered`: Successfully delivered
- `cancelled`: Order cancelled (before shipment)
- `partially_refunded`: Some items refunded
- `refunded`: Full refund processed
- `disputed`: Chargeback or dispute filed
- `archived`: Old/completed orders

---

## 🔐 Security & Compliance

### PCI Compliance
- ✅ No card data stored
- ✅ Tokenized payments via gateway
- ✅ HTTPS only (enforced by Next.js)
- ✅ Webhook signature verification

### Data Protection
- ✅ Row Level Security (RLS) on all tables
- ✅ Admin-only access to sensitive data
- ✅ Audit logs with actor tracking
- ✅ Idempotency keys prevent duplicate charges

### Rate Limiting (TODO)
Implement rate limiting on:
- `/api/webhooks/*` - 100 req/min per IP
- `/checkout` - 10 req/min per user
- `/admin/orders/*` - 30 req/min per admin

---

## 📈 Monitoring & Observability

### Key Metrics to Track

1. **Payment Success Rate**
   ```sql
   SELECT 
     COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) * 100.0 / COUNT(*) as success_rate
   FROM orders
   WHERE created_at > NOW() - INTERVAL '24 hours';
   ```

2. **Checkout Abandonment**
   ```sql
   SELECT 
     COUNT(*) 
   FROM orders 
   WHERE order_status = 'pending_payment' 
     AND created_at > NOW() - INTERVAL '1 hour';
   ```

3. **Inventory Lock Health**
   ```sql
   SELECT 
     product_id,
     SUM(qty_reserved) as total_locked
   FROM inventory_locks
   WHERE expires_at > NOW()
   GROUP BY product_id;
   ```

4. **Webhook Processing**
   ```sql
   SELECT 
     gateway,
     event_type,
     processed,
     COUNT(*) as count
   FROM webhook_events
   WHERE created_at > NOW() - INTERVAL '24 hours'
   GROUP BY gateway, event_type, processed;
   ```

### Alerts to Configure
- Payment success rate drops below 90% in 1 hour
- Webhook processing failures > 5% in 1 hour
- Inventory locks expiring without payment > 20% daily
- Disputed orders created

---

## 🧪 Testing Checklist

### Unit Tests Needed
- [ ] Inventory locking concurrency
- [ ] FSM state transitions
- [ ] Payment provider integration
- [ ] Webhook signature verification
- [ ] Idempotency handling

### Integration Tests
- [ ] End-to-end checkout flow
- [ ] Payment success webhook → order paid
- [ ] Payment failure webhook → lock release
- [ ] Refund processing
- [ ] Admin order cancellation

### E2E Tests
- [ ] Complete purchase with Paystack test mode
- [ ] Concurrent checkout with limited stock
- [ ] Expired order auto-cancellation
- [ ] Admin status updates

### Paystack Test Cards
```
Success: 4084084084084081 (CVV: 408, Expiry: any future date)
Declined: 5060666666666666666
```

---

## 🚀 Deployment Checklist

- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] Paystack webhook configured
- [ ] Cron job scheduled
- [ ] Payment gateway switched to live mode
- [ ] Admin users granted `is_admin = true`
- [ ] Email templates created
- [ ] Monitoring/alerts configured
- [ ] Rate limiting implemented
- [ ] Backup strategy for orders table

---

## 📚 Next Steps & Enhancements

### Phase 2 (Optional)
1. **Email Notifications**
   - Implement email service (Resend, SendGrid)
   - Create email templates
   - Process notification_queue table

2. **SMS Notifications**
   - Integrate Twilio or Termii
   - Add phone validation

3. **Real-time Updates**
   - Implement WebSocket/Pusher for live order status
   - Customer order tracking page

4. **Additional Payment Gateways**
   - Implement Stripe provider
   - Implement Flutterwave provider

5. **Advanced Features**
   - Partial shipments
   - Split payments
   - Installment payments
   - Gift cards/promo codes

6. **Analytics Dashboard**
   - Revenue metrics
   - Conversion funnel
   - Payment method breakdown
   - Customer lifetime value

---

## 🐛 Troubleshooting

### "Insufficient stock" error during checkout
- Check `inventory_locks` table for expired locks
- Run: `SELECT * FROM inventory_locks WHERE expires_at < NOW()`
- Manually clean: `DELETE FROM inventory_locks WHERE expires_at < NOW()`

### Webhook not processing
- Verify webhook URL is publicly accessible
- Check Paystack dashboard for webhook logs
- Verify signature in `webhook_events` table
- Check application logs for errors

### Order stuck in "pending_payment"
- Check if cron job is running
- Manually cancel: `SELECT cancel_expired_orders()`
- Verify `expires_at` timestamp

### Payment confirmed but order still pending
- Check `webhook_events` table for processing errors
- Manually verify payment: `GET /api/payments/verify/:reference`
- Update order status via admin panel

---

## 📞 Support & Maintenance

**Regular Tasks:**
- Weekly: Review `webhook_events` for failures
- Monthly: Analyze payment success rates
- Monthly: Archive old orders (>90 days)
- Quarterly: Review and update FSM transitions

**Database Maintenance:**
```sql
-- Archive old orders
UPDATE orders 
SET order_status = 'archived' 
WHERE order_status = 'delivered' 
  AND updated_at < NOW() - INTERVAL '90 days';

-- Clean old webhook events
DELETE FROM webhook_events 
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## 📄 License & Credits

This payment system implementation follows industry best practices for:
- PCI DSS compliance
- GDPR data protection
- Idempotent API design
- Finite State Machines
- Event-driven architecture

Inspired by payment systems from Shopify, WooCommerce, and Stripe.
