import { createClient } from "@/lib/supabase/server"
import { HeroSection } from "@/components/hero-section"
import { FeaturedProducts } from "@/components/featured-products"
import { CategorySection } from "@/components/category-section"
import { BenefitsSection } from "@/components/benefits-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { AdminLoginSection } from "@/components/admin-login-section"

export default async function Home() {
  const supabase = await createClient()

  // Fetch featured products
  const { data: featuredProducts } = await supabase.from("products").select("*").eq("is_featured", true).limit(4)

  // Fetch bestsellers
  const { data: bestsellers } = await supabase.from("products").select("*").eq("is_bestseller", true).limit(4)

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedProducts products={featuredProducts || []} />
      <CategorySection />
      <FeaturedProducts
        products={bestsellers || []}
        title="Bestsellers"
        subtitle="Customer favorites that deliver real results"
      />
      <BenefitsSection />
      <NewsletterSection />
      <AdminLoginSection />
    </main>
  )
}
