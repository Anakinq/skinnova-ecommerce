import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductImages } from "@/components/product-images"
import { ProductInfo } from "@/components/product-info"
import { ProductTabs } from "@/components/product-tabs"
import { RelatedProducts } from "@/components/related-products"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch product
  const { data: product } = await supabase.from("products").select("*").eq("slug", slug).single()

  if (!product) {
    notFound()
  }

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:user_id (
        full_name
      )
    `)
    .eq("product_id", product.id)
    .order("created_at", { ascending: false })

  // Calculate average rating
  const averageRating =
    reviews && reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  // Fetch related products
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(4)

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductImages images={[product.image_url, ...(product.additional_images || [])]} productName={product.name} />
        <ProductInfo product={product} averageRating={averageRating} reviewCount={reviews?.length || 0} />
      </div>

      <ProductTabs
        description={product.description}
        ingredients={product.ingredients}
        benefits={product.benefits}
        howToUse={product.how_to_use}
        reviews={reviews || []}
        productId={product.id}
        averageRating={averageRating}
      />

      {relatedProducts && relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}
    </div>
  )
}
