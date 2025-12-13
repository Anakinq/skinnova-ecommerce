import type { PaymentProvider, PaymentGateway } from './types'
import { PaystackProvider } from './paystack'

/**
 * Payment Provider Factory
 * Returns the appropriate payment provider based on gateway type
 */
export function getPaymentProvider(gateway: PaymentGateway): PaymentProvider {
    switch (gateway) {
        case 'paystack':
            return new PaystackProvider()

        case 'stripe':
            // TODO: Implement Stripe provider
            throw new Error('Stripe provider not yet implemented')

        case 'flutterwave':
            // TODO: Implement Flutterwave provider
            throw new Error('Flutterwave provider not yet implemented')

        case 'bank_transfer':
        case 'cash_on_delivery':
            throw new Error(`${gateway} does not require a payment provider`)

        default:
            throw new Error(`Unknown payment gateway: ${gateway}`)
    }
}

/**
 * Get the default payment gateway from environment or config
 */
export function getDefaultGateway(): PaymentGateway {
    const gateway = (process.env.DEFAULT_PAYMENT_GATEWAY || 'paystack') as PaymentGateway
    return gateway
}
