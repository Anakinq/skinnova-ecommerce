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

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="mt-16 border-t pt-16">
      <h2 className="mb-8 font-serif text-2xl font-bold md:text-3xl">You May Also Like</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
