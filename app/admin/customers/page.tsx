import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { checkIsAdmin } from "@/lib/check-admin"

export default async function AdminCustomersPage() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    redirect("/auth/login?redirect=/admin/customers")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/admin/customers")
  }

  const { data: customers } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  // Get order counts for each customer
  const customersWithOrders = await Promise.all(
    (customers || []).map(async (customer) => {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", customer.id)

      return { ...customer, orderCount: count || 0 }
    }),
  )

  return (
    <div className="container px-4 py-12 md:px-6">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">Customers</h1>
        <p className="text-muted-foreground">View registered customers</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersWithOrders.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.full_name || "Not set"}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.phone || "—"}</TableCell>
                    <TableCell className="text-right">
                      {customer.orderCount > 0 ? (
                        <Link
                          href={`/admin/customers/${customer.id}/orders`}
                          className="font-medium text-primary hover:underline"
                        >
                          {customer.orderCount}
                        </Link>
                      ) : (
                        <span>{customer.orderCount}</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
