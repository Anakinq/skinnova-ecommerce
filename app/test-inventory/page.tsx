'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestInventoryPage() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const testFunction = async () => {
            try {
                const supabase = createClient()

                // First, get a sample product ID
                const { data: products, error: productsError } = await supabase
                    .from('products')
                    .select('id')
                    .limit(1)

                if (productsError) {
                    throw new Error(`Failed to fetch products: ${productsError.message}`)
                }

                if (!products || products.length === 0) {
                    throw new Error('No products found')
                }

                const productId = products[0].id

                // Test the get_available_stock function
                const { data, error } = await supabase
                    .rpc('get_available_stock', { p_product_id: productId })

                if (error) {
                    throw new Error(`Function call failed: ${error.message}`)
                }

                setResult({
                    productId,
                    availableStock: data
                })
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        testFunction()
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Inventory Function Test</h1>

            {loading && <p>Loading...</p>}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <p><strong>Product ID:</strong> {result.productId}</p>
                    <p><strong>Available Stock:</strong> {result.availableStock}</p>
                </div>
            )}
        </div>
    )
}