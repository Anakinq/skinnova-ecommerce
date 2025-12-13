import { createClient } from "@/lib/supabase/server"
import { getPaymentProvider } from "@/lib/payments/factory"
import { NextRequest, NextResponse } from "next/server"

/**
 * PAYMENT WEBHOOK HANDLER (PAYSTACK)
 * 
 * Handles:
 * - Signature verification
 * - Idempotent processing
 * - Order status updates
 * - Inventory management
 * - Notifications
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { gateway: string } }
) {
    const gateway = params.gateway

    try {
        // Get raw body for signature verification
        const body = await request.text()
        const headers = request.headers

        // Get payment provider
        const provider = getPaymentProvider(gateway as any)

        // Verify webhook signature
        const verification = await provider.verifyWebhook(headers, body)

        if (!verification.valid) {
            console.error('Invalid webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const supabase = await createClient()
        const eventData = verification.data
        const eventType = verification.event_type

        // Extract event ID for idempotency
        const eventId = eventData.id || eventData.reference || `${gateway}-${Date.now()}`

        // Check if event already processed
        const { data: existingEvent } = await supabase
            .from('webhook_events')
            .select('id, processed')
            .eq('gateway', gateway)
            .eq('event_id', eventId)
            .single()

        if (existingEvent?.processed) {
            console.log('Event already processed:', eventId)
            return NextResponse.json({ received: true, duplicate: true })
        }

        // Store webhook event
        const { data: webhookEvent } = await supabase
            .from('webhook_events')
            .insert({
                gateway,
                event_id: eventId,
                event_type: eventType,
                payload: eventData,
                processed: false,
            })
            .select()
            .single()

        // Process event based on type
        try {
            await processWebhookEvent(supabase, gateway, eventType, eventData)

            // Mark event as processed
            await supabase
                .from('webhook_events')
                .update({ processed: true, processed_at: new Date().toISOString() })
                .eq('id', webhookEvent.id)

            return NextResponse.json({ received: true })
        } catch (processingError: any) {
            console.error('Event processing error:', processingError)

            // Log error but don't mark as processed
            await supabase
                .from('webhook_events')
                .update({ error: processingError.message })
                .eq('id', webhookEvent.id)

            return NextResponse.json(
                { error: 'Processing failed', message: processingError.message },
                { status: 500 }
            )
        }

    } catch (error: any) {
        console.error('Webhook handler error:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed', message: error.message },
            { status: 500 }
        )
    }
}

/**
 * Process different webhook event types
 */
async function processWebhookEvent(
    supabase: any,
    gateway: string,
    eventType: string,
    eventData: any
) {
    console.log(`Processing ${gateway} event: ${eventType}`)

    switch (eventType) {
        case 'charge.success':
        case 'payment.successful':
            await handlePaymentSuccess(supabase, gateway, eventData)
            break

        case 'charge.failed':
        case 'payment.failed':
            await handlePaymentFailure(supabase, gateway, eventData)
            break

        case 'refund.processed':
        case 'refund.successful':
            await handleRefundProcessed(supabase, gateway, eventData)
            break

        case 'dispute.create':
        case 'chargeback.created':
            await handleDispute(supabase, gateway, eventData)
            break

        default:
            console.log('Unhandled event type:', eventType)
    }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(supabase: any, gateway: string, eventData: any) {
    const reference = eventData.reference
    const amount = eventData.amount
    const orderId = eventData.metadata?.order_id

    console.log('Payment successful:', { reference, amount, orderId })

    if (!orderId) {
        throw new Error('Order ID not found in payment metadata')
    }

    // Get order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

    if (orderError || !order) {
        throw new Error('Order not found')
    }

    // Verify payment hasn't already been processed
    if (order.payment_status === 'paid') {
        console.log('Payment already processed for order:', orderId)
        return
    }

    // Verify amount matches
    const orderTotalCents = Math.round(order.total * 100)
    if (Math.abs(amount - orderTotalCents) > 100) { // Allow ₦1 difference for rounding
        throw new Error(`Amount mismatch: expected ${orderTotalCents}, got ${amount}`)
    }

    // Update order status
    await supabase
        .from('orders')
        .update({
            order_status: 'paid',
            payment_status: 'paid',
            payment_reference: reference,
            updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

    // Update payment record
    await supabase
        .from('order_payments')
        .update({
            gateway_payment_id: eventData.id?.toString(),
            status: 'success',
            raw_response: eventData,
            updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .eq('gateway', gateway)

    // Add audit log
    await supabase.rpc('add_order_log', {
        p_order_id: orderId,
        p_actor: 'system',
        p_action: 'payment_confirmed',
        p_message: `Payment confirmed via ${gateway}. Reference: ${reference}`,
    })

    // Deduct inventory (convert locks to actual stock reduction)
    const { data: locks } = await supabase
        .from('inventory_locks')
        .select('product_id, qty_reserved')
        .eq('order_id', orderId)

    if (locks && locks.length > 0) {
        for (const lock of locks) {
            await supabase.rpc('deduct_inventory', {
                p_product_id: lock.product_id,
                p_quantity: lock.qty_reserved,
            })
        }

        // Remove locks
        await supabase
            .from('inventory_locks')
            .delete()
            .eq('order_id', orderId)
    }

    // Queue notification
    await supabase.from('notification_queue').insert({
        type: 'email',
        recipient_email: order.guest_email || await getUserEmail(supabase, order.user_id),
        subject: `Payment Confirmed - Order ${order.order_number}`,
        template_name: 'payment_confirmed',
        template_data: {
            order_number: order.order_number,
            order_id: orderId,
            amount: order.total,
        },
    })

    console.log('Payment success processed for order:', orderId)
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(supabase: any, gateway: string, eventData: any) {
    const reference = eventData.reference
    const orderId = eventData.metadata?.order_id

    if (!orderId) return

    // Update order status
    await supabase
        .from('orders')
        .update({
            order_status: 'payment_failed',
            payment_status: 'not_paid',
            updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

    // Update payment record
    await supabase
        .from('order_payments')
        .update({
            status: 'failed',
            raw_response: eventData,
            attempts: supabase.raw('attempts + 1'),
        })
        .eq('order_id', orderId)
        .eq('gateway', gateway)

    // Add audit log
    await supabase.rpc('add_order_log', {
        p_order_id: orderId,
        p_actor: 'system',
        p_action: 'payment_failed',
        p_message: `Payment failed via ${gateway}. Reference: ${reference}`,
    })

    // Release inventory locks
    await supabase
        .from('inventory_locks')
        .delete()
        .eq('order_id', orderId)

    console.log('Payment failure processed for order:', orderId)
}

/**
 * Handle refund processed
 */
async function handleRefundProcessed(supabase: any, gateway: string, eventData: any) {
    const reference = eventData.transaction_reference || eventData.reference
    const refundAmount = eventData.amount

    const { data: order } = await supabase
        .from('orders')
        .select('id, total')
        .eq('payment_reference', reference)
        .single()

    if (!order) return

    const totalCents = Math.round(order.total * 100)
    const refundedCents = refundAmount

    // Determine if partial or full refund
    const isFullRefund = Math.abs(refundedCents - totalCents) < 100

    await supabase
        .from('orders')
        .update({
            order_status: isFullRefund ? 'refunded' : 'partially_refunded',
            payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
        })
        .eq('id', order.id)

    await supabase.rpc('add_order_log', {
        p_order_id: order.id,
        p_actor: 'system',
        p_action: 'refund_processed',
        p_message: `${isFullRefund ? 'Full' : 'Partial'} refund processed: ${refundedCents / 100} NGN`,
    })

    console.log('Refund processed for order:', order.id)
}

/**
 * Handle dispute/chargeback
 */
async function handleDispute(supabase: any, gateway: string, eventData: any) {
    const reference = eventData.transaction_reference || eventData.reference

    const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_reference', reference)
        .single()

    if (!order) return

    await supabase
        .from('orders')
        .update({
            order_status: 'disputed',
            payment_status: 'disputed',
        })
        .eq('id', order.id)

    await supabase.rpc('add_order_log', {
        p_order_id: order.id,
        p_actor: 'system',
        p_action: 'dispute_created',
        p_message: `Payment dispute created via ${gateway}`,
    })

    console.log('Dispute created for order:', order.id)
}

/**
 * Helper to get user email
 */
async function getUserEmail(supabase: any, userId: string): Promise<string> {
    const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()

    return profile?.email || ''
}
