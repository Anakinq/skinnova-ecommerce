import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * CRON JOB: Cleanup expired orders and inventory locks
 * 
 * Schedule this to run every hour via:
 * - Vercel Cron Jobs
 * - AWS EventBridge
 * - GitHub Actions
 * 
 * Example vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET || 'your-cron-secret'

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const results = {
            expired_locks_cleaned: 0,
            expired_orders_cancelled: 0,
            errors: [],
        }

        // 1. Clean up expired inventory locks
        try {
            await supabase.rpc('cleanup_expired_inventory_locks')
            const { count } = await supabase
                .from('inventory_locks')
                .select('*', { count: 'exact', head: true })
                .lt('expires_at', new Date().toISOString())

            results.expired_locks_cleaned = count || 0
        } catch (error: any) {
            results.errors.push(`Lock cleanup error: ${error.message}`)
        }

        // 2. Cancel expired unpaid orders
        try {
            const { data: cancelledOrders } = await supabase.rpc('cancel_expired_orders')
            results.expired_orders_cancelled = cancelledOrders?.length || 0
        } catch (error: any) {
            results.errors.push(`Order cancellation error: ${error.message}`)
        }

        console.log('Cleanup cron results:', results)

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            ...results,
        })
    } catch (error: any) {
        console.error('Cron job error:', error)
        return NextResponse.json(
            { error: 'Cron job failed', message: error.message },
            { status: 500 }
        )
    }
}
