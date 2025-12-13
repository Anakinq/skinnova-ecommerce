"use client"

import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/format-currency"

interface ProductInfoProps {
  product: {
    id: string
    name: string
    short_description: string
    price: number
    compare_at_price: number | null
    category: string
    stock_quantity: number
  }
  averageRating: number
  reviewCount: number
}

export function ProductInfo({ product, averageRating, reviewCount }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  const addToCart = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: existingItem } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .single()

        if (existingItem) {
          await supabase
            .from("cart_items")
            .update({ quantity: existingItem.quantity + quantity })
            .eq("id", existingItem.id)
        } else {
          await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity })
        }
      } else {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]")
        const existingItemIndex = cart.findIndex((item: any) => item.productId === product.id)

        if (existingItemIndex > -1) {
          cart[existingItemIndex].quantity += quantity
        } else {
          cart.push({ productId: product.id, quantity })
        }

        localStorage.setItem("cart", JSON.stringify(cart))
      }

      window.dispatchEvent(new Event("cartUpdated"))
      router.push("/cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">{product.category}</div>
        <h1 className="font-serif text-3xl font-bold leading-tight text-balance md:text-4xl">{product.name}</h1>
      </div>

      {reviewCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(averageRating) ? "fill-primary text-primary" : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {averageRating.toFixed(1)} ({reviewCount} reviews)
          </span>
        </div>
      )}

      <p className="text-muted-foreground text-pretty">{product.short_description}</p>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
        {hasDiscount && (
          <>
            <span className="text-xl text-muted-foreground line-through">{formatPrice(product.compare_at_price!)}</span>
            <span className="rounded-full bg-destructive px-3 py-1 text-sm font-semibold text-destructive-foreground">
              Save {discountPercent}%
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <span className="w-16 text-center font-semibold">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= product.stock_quantity}
          >
            +
          </Button>
        </div>

        <Button className="flex-1" size="lg" onClick={addToCart} disabled={isLoading || product.stock_quantity < 1}>
          {isLoading ? "Adding..." : product.stock_quantity < 1 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>

      {product.stock_quantity > 0 && product.stock_quantity < 10 && (
        <p className="text-sm text-destructive">Only {product.stock_quantity} left in stock!</p>
      )}

      <div className="rounded-lg border bg-muted/50 p-4">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Free shipping on orders over ₦80,000
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            30-day money-back guarantee
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Dermatologist tested & cruelty-free
          </li>
        </ul>
      </div>
    </div>
  )
}
