import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { formatPrice } from "@/lib/format-currency"

interface Product {
  id: string
  name: string
  slug: string
  short_description: string
  price: number
  compare_at_price: number | null
  image_url: string
  category: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {hasDiscount && (
            <div className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground">
              -{discountPercent}%
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{product.category}</div>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mb-2 font-semibold leading-tight text-balance transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2 text-pretty">{product.short_description}</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compare_at_price!)}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <AddToCartButton productId={product.id} />
      </CardFooter>
    </Card>
  )
}
