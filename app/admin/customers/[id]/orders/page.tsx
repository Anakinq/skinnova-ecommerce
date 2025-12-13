import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { OrdersTable } from "@/components/orders-table"
import { checkIsAdmin } from "@/lib/check-admin"

export default async function AdminCustomerOrdersPage({
    params,
}: {
    params: { id: string }
}) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
        redirect("/auth/login?redirect=/admin/customers")
    }

    const supabase = await createClient()

    // Fetch customer profile for header
    const { data: customer } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", params.id)
        .single()

    // Fetch all orders for this customer
    const { data: orders } = await supabase
        .from("orders")
        .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
        .eq("user_id", params.id)
        .order("created_at", { ascending: false })

    return (
        <div className="container px-4 py-12 md:px-6">
            <div className="mb-6 flex items-center gap-4">
                <Link
                    href="/admin/customers"
                    className="text-sm font-medium text-primary hover:underline"
                >
                    ← Back to Customers
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">
                    Orders for {customer?.full_name || "User"}
                </h1>
                {customer?.email && (
                    <p className="text-muted-foreground">{customer.email}</p>
                )}
            </div>

            {orders && orders.length > 0 ? (
                <OrdersTable orders={orders} />
            ) : (
                <div className="rounded-lg border p-8 text-center text-muted-foreground">
                    No orders found for this customer.
                </div>
            )}
        </div>
    )
}
