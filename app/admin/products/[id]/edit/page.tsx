import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/check-admin"
import { ProductEditForm } from "@/components/product-edit-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default async function EditProductPage({ params }: { params: { id: string } }) {
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

  const { data: product, error } = await supabase.from("products").select("*").eq("id", params.id).single()

  if (error) {
    return (
      <div className="container px-4 py-12 md:px-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load product: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!product) {
    redirect("/admin/products")
  }

  return (
    <div className="container px-4 py-12 md:px-6">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">Edit Product</h1>
        <p className="text-muted-foreground">Update product details and images</p>
      </div>

      <ProductEditForm product={product} />
    </div>
  )
}
