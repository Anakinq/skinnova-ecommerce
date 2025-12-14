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

  // Fetch orders with user email from auth.users table
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      user:profiles!inner (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  // Debug: Log results
  console.log("Orders fetch result:", { orders: orders?.length, error })

  if (error) {
    console.error("Error fetching orders:", error)
    
    // Fallback: Try without the join
    if (error.message.includes("relationship")) {
      console.log("Trying fallback query without join...")
      const { data: fallbackOrders, error: fallbackError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (fallbackError) {
        console.error("Fallback query also failed:", fallbackError)
      } else {
        console.log("Fallback query succeeded, got", fallbackOrders?.length, "orders")
        
        // Try to get user info separately
        if (fallbackOrders && fallbackOrders.length > 0) {
          const userIds = [...new Set(fallbackOrders.map(order => order.user_id).filter(Boolean))]
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, full_name, email")
              .in("id", userIds)
            
            if (profiles) {
              // Merge profile data with orders
              fallbackOrders.forEach(order => {
                const profile = profiles.find(p => p.id === order.user_id)
                if (profile) {
                  order.profiles = profile
                }
              })
            }
          }
        }
        
        return (
          <div className="container px-4 py-12 md:px-6">
            <div className="mb-8">
              <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">Manage Orders</h1>
              <p className="text-muted-foreground">View and update order status</p>
              <div className="mt-4 rounded bg-yellow-100 p-4 text-yellow-800">
                Note: Using fallback query due to relationship issue
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Loaded {fallbackOrders?.length} orders
              </div>
            </div>
            <OrdersTable orders={fallbackOrders || []} />
          </div>
        )
      }
    }
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