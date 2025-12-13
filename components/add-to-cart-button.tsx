"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AddToCartButtonProps {
  productId: string
  quantity?: number
}

export function AddToCartButton({ productId, quantity = 1 }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const addToCart = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Authenticated user - save to database
        const { data: existingItem } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .single()

        if (existingItem) {
          // Update quantity
          await supabase
            .from("cart_items")
            .update({ quantity: existingItem.quantity + quantity })
            .eq("id", existingItem.id)
        } else {
          // Insert new item
          await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity })
        }
      } else {
        // Non-authenticated user - save to localStorage
        const cart = JSON.parse(localStorage.getItem("cart") || "[]")
        const existingItemIndex = cart.findIndex((item: any) => item.productId === productId)

        if (existingItemIndex > -1) {
          cart[existingItemIndex].quantity += quantity
        } else {
          cart.push({ productId, quantity })
        }

        localStorage.setItem("cart", JSON.stringify(cart))
      }

      // Dispatch event to update cart count
      window.dispatchEvent(new Event("cartUpdated"))

      // Show success feedback (optional: add toast notification here)
      router.refresh()
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={addToCart} disabled={isLoading} className="w-full" size="sm">
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isLoading ? "Adding..." : "Add to Cart"}
    </Button>
  )
}
