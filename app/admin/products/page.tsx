import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/products-table"
import { checkIsAdmin } from "@/lib/check-admin"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function AdminProductsPage() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    redirect("/auth/login?redirect=/admin/products")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/admin/products")
  }

  const { data: products, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="container px-4 py-12 md:px-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Products</AlertTitle>
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container px-4 py-12 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">Manage Products</h1>
          <p className="text-muted-foreground">View and manage your product catalog</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      <ProductsTable products={products || []} />
    </div>
  )
}
