import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OrdersTable } from "@/components/orders-table"
import { checkIsAdmin } from "@/lib/check-admin"

export default async function AdminOrdersPage() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    redirect("/auth/login?redirect=/admin/orders")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/admin/orders")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="container px-4 py-12 md:px-6">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">Manage Orders</h1>
        <p className="text-muted-foreground">View and update order status</p>
      </div>

      <OrdersTable orders={orders || []} />
    </div>
  )
}
