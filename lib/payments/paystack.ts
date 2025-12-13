import crypto from 'crypto'
import type {
    PaymentProvider,
    PaymentIntent,
    PaymentVerification,
    WebhookVerification,
    RefundResult,
    PaymentStatus,
} from './types'

export class PaystackProvider implements PaymentProvider {
    name = 'paystack' as const
    private secretKey: string
    private baseUrl = 'https://api.paystack.co'

    constructor(secretKey?: string) {
        this.secretKey = secretKey || process.env.PAYSTACK_SECRET_KEY || ''
        if (!this.secretKey) {
            throw new Error('PAYSTACK_SECRET_KEY is required')
        }
    }

    async createPaymentIntent(params: {
        order_id: string
        amount_cents: number
        currency: string
        email: string
        callback_url: string
        metadata?: Record<string, any>
    }): Promise<PaymentIntent> {
        const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: params.email,
                amount: params.amount_cents, // Paystack expects amount in kobo (cents)
                currency: params.currency,
                reference: this.generateReference(params.order_id),
                callback_url: params.callback_url,
                metadata: {
                    order_id: params.order_id,
                    ...params.metadata,
                },
            }),
        })

        const data = await response.json()

        if (!response.ok || !data.status) {
            throw new Error(data.message || 'Failed to initialize payment')
        }

        return {
            authorization_url: data.data.authorization_url,
            access_code: data.data.access_code,
            reference: data.data.reference,
        }
    }

    async verifyPayment(reference: string): Promise<PaymentVerification> {
        const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
            },
        })

        const data = await response.json()

        if (!response.ok || !data.status) {
            throw new Error(data.message || 'Failed to verify payment')
        }

        const paymentData = data.data

        return {
            success: paymentData.status === 'success',
            status: this.mapPaystackStatus(paymentData.status),
            amount_cents: paymentData.amount,
            currency: paymentData.currency,
            reference: paymentData.reference,
            gateway_payment_id: paymentData.id.toString(),
            raw_response: paymentData,
        }
    }

    async verifyWebhook(headers: Headers, body: string): Promise<WebhookVerification> {
        const signature = headers.get('x-paystack-signature')

        if (!signature) {
            return { valid: false, event_type: '', data: null }
        }

        // Verify signature
        const hash = crypto.createHmac('sha512', this.secretKey).update(body).digest('hex')

        if (hash !== signature) {
            return { valid: false, event_type: '', data: null }
        }

        const event = JSON.parse(body)

        return {
            valid: true,
            event_type: event.event,
            data: event.data,
        }
    }

    async refund(params: {
        payment_reference: string
        amount_cents?: number
        reason?: string
    }): Promise<RefundResult> {
        const response = await fetch(`${this.baseUrl}/refund`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transaction: params.payment_reference,
                amount: params.amount_cents,
                merchant_note: params.reason,
            }),
        })

        const data = await response.json()

        if (!response.ok || !data.status) {
            throw new Error(data.message || 'Failed to process refund')
        }

        return {
            success: true,
            refund_id: data.data.id.toString(),
            amount_cents: data.data.amount || params.amount_cents || 0,
            status: data.data.status,
            raw_response: data.data,
        }
    }

    async getPaymentStatus(payment_id: string): Promise<PaymentStatus> {
        const verification = await this.verifyPayment(payment_id)
        return verification.status
    }

    private generateReference(orderId: string): string {
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 8).toUpperCase()
        return `PAY-${orderId.substring(0, 8)}-${timestamp}-${random}`
    }

    private mapPaystackStatus(paystackStatus: string): PaymentStatus {
        switch (paystackStatus) {
            case 'success':
                return 'paid'
            case 'failed':
            case 'abandoned':
                return 'not_paid'
            case 'pending':
                return 'pending'
            default:
                return 'not_paid'
        }
    }
}
