import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/product-card"
import { ShopFilters } from "@/components/shop-filters"

interface SearchParams {
  category?: string
  search?: string
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from("products").select("*")

  if (params.category) {
    query = query.eq("category", params.category)
  }

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`)
  }

  const { data: products } = await query.order("created_at", { ascending: false })

  return (
    <div className="container px-4 py-12 md:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold">Shop All Products</h1>
        <p className="mt-2 text-muted-foreground">Discover our complete collection of science-backed skincare</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64">
          <ShopFilters currentCategory={params.category} />
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{products?.length || 0} products</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {(!products || products.length === 0) && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
