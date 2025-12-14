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

  // Debug: Log user info
  console.log("Fetching orders for user:", user?.id, user?.email)

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  // Debug: Log results
  console.log("Orders fetch result:", { orders: orders?.length, error })

  if (error) {
    console.error("Error fetching orders:", error)
  }

  return (
    <div className="container px-4 py-12 md:px-6">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">Manage Orders</h1>
        <p className="text-muted-foreground">View and update order status</p>
        {error && (
          <div className="mt-4 rounded bg-red-100 p-4 text-red-800">
            Error loading orders: {error.message}
          </div>
        )}
        {orders && (
          <div className="mt-2 text-sm text-muted-foreground">
            Loaded {orders.length} orders
          </div>
        )}
      </div>

      <OrdersTable orders={orders || []} />
    </div>
  )
}