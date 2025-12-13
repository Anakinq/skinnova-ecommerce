"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/format-currency"

interface CartItem {
  id: string
  quantity: number
  products: {
    id: string
    price: number
  }
}

interface CartSummaryProps {
  items: CartItem[]
}

export function CartSummary({ items: initialItems }: CartSummaryProps) {
  const [items, setItems] = useState(initialItems)
  const [localTotal, setLocalTotal] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)

      if (!user) {
        // Calculate from localStorage
        const cart = JSON.parse(localStorage.getItem("cart") || "[]")
        if (cart.length > 0) {
          const productIds = cart.map((item: any) => item.productId)
          const { data: products } = await supabase.from("products").select("id, price").in("id", productIds)

          const total = cart.reduce((sum: number, item: any) => {
            const product = products?.find((p) => p.id === item.productId)
            return sum + (product ? product.price * item.quantity : 0)
          }, 0)

          setLocalTotal(total)
        }
      }
    }

    checkAuth()

    const handleCartUpdate = () => {
      checkAuth()
    }

    window.addEventListener("cartUpdated", handleCartUpdate)
    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [])

  const subtotal = isAuthenticated
    ? items.reduce((sum, item) => sum + item.products.price * item.quantity, 0)
    : localTotal

  const shipping = subtotal > 80000 ? 0 : 10000
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Tax</span>
            <span className="font-medium">{formatPrice(tax)}</span>
          </div>

          {subtotal > 0 && subtotal < 80000 && (
            <div className="rounded-md bg-muted p-3 text-sm">
              Add <span className="font-semibold">{formatPrice(80000 - subtotal)}</span> more for free shipping
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <Button className="w-full" size="lg" asChild disabled={subtotal === 0}>
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>

        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>

        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Secure checkout
          </p>
          <p className="flex items-center gap-2">
            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            30-day money-back guarantee
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
