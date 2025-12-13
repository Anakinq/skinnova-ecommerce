"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { formatPrice } from "@/lib/format-currency"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  image_url: string
  stock_quantity: number
}

interface CartItemCardProps {
  id: string
  product: Product
  quantity: number
  onRemove: (id: string, productId?: string) => void
  onUpdateQuantity: (id: string, quantity: number, productId?: string) => void
}

export function CartItemCard({ id, product, quantity, onRemove, onUpdateQuantity }: CartItemCardProps) {
  const subtotal = product.price * quantity

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Link
            href={`/products/${product.slug}`}
            className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted"
          >
            <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </Link>

          <div className="flex flex-1 flex-col justify-between">
            <div>
              <Link href={`/products/${product.slug}`} className="font-semibold hover:text-primary">
                {product.name}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{formatPrice(product.price)} each</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => onUpdateQuantity(id, quantity - 1, product.id)}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => onUpdateQuantity(id, quantity + 1, product.id)}
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold">{formatPrice(subtotal)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onRemove(id, product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove item</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
