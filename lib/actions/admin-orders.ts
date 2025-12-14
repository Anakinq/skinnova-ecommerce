"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getPaymentProvider } from "@/lib/payments/factory"

type OrderStatus =
    | 'pending_payment'
    | 'payment_failed'
    | 'paid'
    | 'processing'
    | 'ready_for_shipment'
    | 'shipped'
    | 'in_transit'
    | 'delivered'
    | 'cancel_requested'
    | 'cancelled'
    | 'partially_refunded'
    | 'refunded'
    | 'disputed'
    | 'archived'

interface UpdateOrderStatusParams {
    order_id: string
    new_status: OrderStatus
    reason?: string
    tracking_number?: string
    courier?: string
    delivery_agent?: string
    agent_contact?: string
    estimated_delivery?: string
    admin_id: string
}

/**
 * Admin: Update order status with audit trail
 */
export async function updateOrderStatus(params: UpdateOrderStatusParams) {
    const supabase = await createClient()

    try {
        // Verify admin
        const { data: admin } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', params.admin_id)
            .single()

        if (!admin?.is_admin) {
            throw new Error('Unauthorized')
        }

        // Get current order
        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', params.order_id)
            .single()

        if (!order) {
            throw new Error('Order not found')
        }

        // Validate state transition
        validateStatusTransition(order.order_status, params.new_status)

        // Update order
        const updates: any = {
            order_status: params.new_status,
            updated_at: new Date().toISOString(),
        }

        // Update fulfillment info if provided
        if (params.tracking_number || params.courier || params.estimated_delivery || params.delivery_agent || params.agent_contact) {
            const currentFulfillment = order.fulfillment || {}
            updates.fulfillment = {
                ...currentFulfillment,
                ...(params.tracking_number && { tracking_number: params.tracking_number }),
                ...(params.courier && { courier: params.courier }),
                ...(params.delivery_agent && { delivery_agent: params.delivery_agent }),
                ...(params.agent_contact && { agent_contact: params.agent_contact }),
                ...(params.estimated_delivery && { estimated_delivery: params.estimated_delivery }),
                updated_at: new Date().toISOString(),
            }
        }

        await supabase
            .from('orders')
            .update(updates)
            .eq('id', params.order_id)

        // Add audit log
        await supabase.rpc('add_order_log', {
            p_order_id: params.order_id,
            p_actor: `admin:${params.admin_id}`,
            p_action: 'status_updated',
            p_message: `Status changed from ${order.order_status} to ${params.new_status}${params.reason ? `. Reason: ${params.reason}` : ''}`,
        })

        // Send notification to customer
        await queueCustomerNotification(
            supabase,
            order,
            params.new_status,
            updates.fulfillment
        )

        revalidatePath('/admin/orders')
        revalidatePath(`/admin/orders/${params.order_id}`)
        revalidatePath('/account/orders')

        return { success: true }
    } catch (error: any) {
        console.error('Update order status error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Admin: Issue refund
 */
export async function issueRefund(params: {
    order_id: string
    amount_cents?: number // undefined = full refund
    reason: string
    admin_id: string
}) {
    const supabase = await createClient()

    try {
        // Verify admin
        const { data: admin } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', params.admin_id)
            .single()

        if (!admin?.is_admin) {
            throw new Error('Unauthorized')
        }

        // Get order
        const { data: order } = await supabase
            .from('orders')
            .select('*, order_payments(*)')
            .eq('id', params.order_id)
            .single()

        if (!order || order.payment_status !== 'paid') {
            throw new Error('Order not found or not paid')
        }

        const totalCents = Math.round(order.total * 100)
        const refundAmountCents = params.amount_cents || totalCents
        const payment = order.order_payments?.[0]

        if (!payment) {
            throw new Error('No payment record found')
        }

        // Process refund through gateway
        const provider = getPaymentProvider(payment.gateway as any)
        const refundResult = await provider.refund({
            payment_reference: order.payment_reference,
            amount_cents: refundAmountCents,
            reason: params.reason,
        })

        // Create refund record
        await supabase.from('refunds').insert({
            order_id: params.order_id,
            amount_cents: refundAmountCents,
            currency: order.currency || 'NGN',
            reason: params.reason,
            status: 'processed',
            gateway_refund_id: refundResult.refund_id,
            processed_by: params.admin_id,
        })

        // Update order status
        const isFullRefund = refundAmountCents >= totalCents
        await supabase
            .from('orders')
            .update({
                order_status: isFullRefund ? 'refunded' : 'partially_refunded',
                payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
            })
            .eq('id', params.order_id)

        // Restore inventory if full refund
        if (isFullRefund) {
            const { data: orderItems } = await supabase
                .from('order_items')
                .select('product_id, quantity')
                .eq('order_id', params.order_id)

            if (orderItems) {
                for (const item of orderItems) {
                    await supabase.rpc('restore_inventory', {
                        p_product_id: item.product_id,
                        p_quantity: item.quantity,
                    })
                }
            }
        }

        // Add log
        await supabase.rpc('add_order_log', {
            p_order_id: params.order_id,
            p_actor: `admin:${params.admin_id}`,
            p_action: 'refund_issued',
            p_message: `${isFullRefund ? 'Full' : 'Partial'} refund of ₦${refundAmountCents / 100} issued. Reason: ${params.reason}`,
        })

        revalidatePath('/admin/orders')
        revalidatePath(`/admin/orders/${params.order_id}`)

        return { success: true, refund_id: refundResult.refund_id }
    } catch (error: any) {
        console.error('Issue refund error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Admin: Cancel order
 */
export async function cancelOrder(params: {
    order_id: string
    reason: string
    admin_id: string
}) {
    const supabase = await createClient()

    try {
        const { data: admin } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', params.admin_id)
            .single()

        if (!admin?.is_admin) {
            throw new Error('Unauthorized')
        }

        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', params.order_id)
            .single()

        if (!order) {
            throw new Error('Order not found')
        }

        // Can't cancel if already shipped
        if (['shipped', 'in_transit', 'delivered'].includes(order.order_status)) {
            throw new Error('Cannot cancel shipped orders')
        }

        // Release inventory locks
        await supabase
            .from('inventory_locks')
            .delete()
            .eq('order_id', params.order_id)

        // If paid, initiate refund
        if (order.payment_status === 'paid') {
            await issueRefund({
                order_id: params.order_id,
                reason: `Order cancelled: ${params.reason}`,
                admin_id: params.admin_id,
            })
        }

        // Update status
        await supabase
            .from('orders')
            .update({
                order_status: 'cancelled',
            })
            .eq('id', params.order_id)

        await supabase.rpc('add_order_log', {
            p_order_id: params.order_id,
            p_actor: `admin:${params.admin_id}`,
            p_action: 'order_cancelled',
            p_message: `Order cancelled by admin. Reason: ${params.reason}`,
        })

        revalidatePath('/admin/orders')

        return { success: true }
    } catch (error: any) {
        console.error('Cancel order error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Validate FSM state transitions
 */
function validateStatusTransition(currentStatus: string, newStatus: string) {
    const allowedTransitions: Record<string, string[]> = {
        pending_payment: ['payment_failed', 'paid', 'cancelled'],
        payment_failed: ['pending_payment', 'cancelled'],
        paid: ['processing', 'cancelled', 'refunded'],
        processing: ['ready_for_shipment', 'cancelled'],
        ready_for_shipment: ['shipped', 'cancelled'],
        shipped: ['in_transit', 'delivered'],
        in_transit: ['delivered'],
        delivered: ['partially_refunded', 'refunded', 'disputed', 'archived'],
        cancel_requested: ['cancelled', 'processing'],
        cancelled: ['archived'],
        partially_refunded: ['refunded', 'archived'],
        refunded: ['archived'],
        disputed: ['resolved', 'archived'],
    }

    const allowed = allowedTransitions[currentStatus] || []

    if (!allowed.includes(newStatus)) {
        throw new Error(
            `Invalid status transition from ${currentStatus} to ${newStatus}`
        )
    }
}

/**
 * Queue notification for customer
 */
async function queueCustomerNotification(
    supabase: any,
    order: any,
    newStatus: string,
    fulfillment?: any
) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', order.user_id)
        .single()

    const emailTemplates: Record<string, { subject: string; template: string }> = {
        paid: {
            subject: `Payment Confirmed - Order ${order.order_number}`,
            template: 'payment_confirmed',
        },
        processing: {
            subject: `Order Processing - ${order.order_number}`,
            template: 'order_processing',
        },
        shipped: {
            subject: `Order Shipped - ${order.order_number}`,
            template: 'order_shipped',
        },
        delivered: {
            subject: `Order Delivered - ${order.order_number}`,
            template: 'order_delivered',
        },
        cancelled: {
            subject: `Order Cancelled - ${order.order_number}`,
            template: 'order_cancelled',
        },
        refunded: {
            subject: `Refund Processed - ${order.order_number}`,
            template: 'order_refunded',
        },
    }

    const emailConfig = emailTemplates[newStatus]

    if (emailConfig && profile?.email) {
        await supabase.from('notification_queue').insert({
            type: 'email',
            recipient_email: profile.email,
            subject: emailConfig.subject,
            template_name: emailConfig.template,
            template_data: {
                order_number: order.order_number,
                order_id: order.id,
                fulfillment,
            },
        })
    }
}
