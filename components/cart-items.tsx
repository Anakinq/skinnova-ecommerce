"use client"

import { useEffect, useState } from "react"
import { CartItemCard } from "@/components/cart-item-card"
import { createClient } from "@/lib/supabase/client"

interface CartItem {
  id: string
  quantity: number
  products: {
    id: string
    name: string
    slug: string
    price: number
    image_url: string
    stock_quantity: number
  }
}

interface CartItemsProps {
  items: CartItem[]
  isAuthenticated: boolean
}

export function CartItems({ items: initialItems, isAuthenticated }: CartItemsProps) {
  const [items, setItems] = useState(initialItems)
  const [localCartItems, setLocalCartItems] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      // Load from localStorage for non-authenticated users
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      setLocalCartItems(cart)

      // Fetch product details
      const fetchProducts = async () => {
        if (cart.length === 0) return

        const supabase = createClient()
        const productIds = cart.map((item: any) => item.productId)

        const { data } = await supabase
          .from("products")
          .select("id, name, slug, price, image_url, stock_quantity")
          .in("id", productIds)

        setProducts(data || [])
      }

      fetchProducts()
    }
  }, [isAuthenticated])

  const handleRemove = async (itemId: string, productId?: string) => {
    if (isAuthenticated) {
      const supabase = createClient()
      await supabase.from("cart_items").delete().eq("id", itemId)
      setItems(items.filter((item) => item.id !== itemId))
    } else {
      const cart = localCartItems.filter((item: any) => item.productId !== productId)
      localStorage.setItem("cart", JSON.stringify(cart))
      setLocalCartItems(cart)
    }

    window.dispatchEvent(new Event("cartUpdated"))
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number, productId?: string) => {
    if (newQuantity < 1) return

    if (isAuthenticated) {
      const supabase = createClient()
      await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", itemId)

      setItems(items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
    } else {
      const cart = localCartItems.map((item: any) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item,
      )
      localStorage.setItem("cart", JSON.stringify(cart))
      setLocalCartItems(cart)
    }

    window.dispatchEvent(new Event("cartUpdated"))
  }

  // Show items for authenticated users
  if (isAuthenticated) {
    if (items.length === 0) {
      return <div className="py-8 text-center text-muted-foreground">Your cart is empty</div>
    }

    return (
      <div className="space-y-4">
        {items.map((item) => (
          <CartItemCard
            key={item.id}
            id={item.id}
            product={item.products}
            quantity={item.quantity}
            onRemove={handleRemove}
            onUpdateQuantity={handleUpdateQuantity}
          />
        ))}
      </div>
    )
  }

  // Show items for non-authenticated users
  const cartWithProducts = localCartItems
    .map((item: any) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { ...item, product } : null
    })
    .filter((item) => item !== null)

  if (cartWithProducts.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">Your cart is empty</div>
  }

  return (
    <div className="space-y-4">
      {cartWithProducts.map((item: any) => (
        <CartItemCard
          key={item.productId}
          id={item.productId}
          product={item.product}
          quantity={item.quantity}
          onRemove={handleRemove}
          onUpdateQuantity={handleUpdateQuantity}
        />
      ))}
    </div>
  )
}
