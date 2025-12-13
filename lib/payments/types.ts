// Payment system type definitions

export type PaymentGateway = 'paystack' | 'stripe' | 'flutterwave' | 'bank_transfer' | 'cash_on_delivery'

export type PaymentStatus =
    | 'not_paid'
    | 'pending'
    | 'paid'
    | 'partially_refunded'
    | 'refunded'
    | 'disputed'

export interface PaymentIntent {
    authorization_url: string
    access_code: string
    reference: string
}

export interface PaymentVerification {
    success: boolean
    status: PaymentStatus
    amount_cents: number
    currency: string
    reference: string
    gateway_payment_id: string
    raw_response: any
}

export interface RefundResult {
    success: boolean
    refund_id: string
    amount_cents: number
    status: string
    raw_response: any
}

export interface WebhookVerification {
    valid: boolean
    event_type: string
    data: any
}

export interface PaymentProvider {
    name: PaymentGateway

    /**
     * Create a payment intent/authorization
     */
    createPaymentIntent(params: {
        order_id: string
        amount_cents: number
        currency: string
        email: string
        callback_url: string
        metadata?: Record<string, any>
    }): Promise<PaymentIntent>

    /**
     * Verify a payment using reference
     */
    verifyPayment(reference: string): Promise<PaymentVerification>

    /**
     * Verify webhook signature and parse event
     */
    verifyWebhook(headers: Headers, body: string): Promise<WebhookVerification>

    /**
     * Initiate a refund
     */
    refund(params: {
        payment_reference: string
        amount_cents: number
        reason?: string
    }): Promise<RefundResult>

    /**
     * Get payment status
     */
    getPaymentStatus(payment_id: string): Promise<PaymentStatus>
}
