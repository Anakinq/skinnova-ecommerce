import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/product-card"
import { SearchInput } from "@/components/search-input"

interface SearchParams {
  q?: string
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let products = []

  if (params.q) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${params.q}%, description.ilike.%${params.q}%`)

    products = data || []
  }

  return (
    <div className="container px-4 py-12 md:px-6">
      <div className="mb-8">
        <h1 className="mb-4 font-serif text-4xl font-bold">Search Products</h1>
        <SearchInput initialQuery={params.q} />
      </div>

      {params.q && (
        <>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {products.length} results for "{params.q}"
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="mb-4 text-muted-foreground">No products found matching "{params.q}"</p>
              <a href="/shop" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                Browse all products
              </a>
            </div>
          )}
        </>
      )}
    </div>
  )
}
