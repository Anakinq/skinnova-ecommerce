import Link from "next/link"
import { ProductCard } from "@/components/product-card"

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

interface FeaturedProductsProps {
  products: Product[]
  title?: string
  subtitle?: string
}

export function FeaturedProducts({
  products,
  title = "Featured Products",
  subtitle = "Discover our most-loved formulations",
}: FeaturedProductsProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">{subtitle}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/shop" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
            View all products
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
