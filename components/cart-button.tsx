"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function CartButton() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    // Get initial cart count
    const getCartCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from("cart_items").select("quantity").eq("user_id", user.id)

        const count = data?.reduce((sum, item) => sum + item.quantity, 0) || 0
        setCartCount(count)
      } else {
        // Get from localStorage for non-authenticated users
        const cart = JSON.parse(localStorage.getItem("cart") || "[]")
        const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
        setCartCount(count)
      }
    }

    getCartCount()

    // Listen for cart updates
    const handleCartUpdate = () => getCartCount()
    window.addEventListener("cartUpdated", handleCartUpdate)

    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [])

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {cartCount}
          </span>
        )}
        <span className="sr-only">Shopping cart</span>
      </Link>
    </Button>
  )
}
