import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { formatPrice } from "@/lib/format-currency"

interface SuccessPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrderSuccessPage({ params }: SuccessPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch order
  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      addresses (
        full_name,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    notFound()
  }

  return (
    <div className="container px-4 py-12 md:px-6">
      <div className="mx-auto max-w-2xl">
        <Card className="border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-serif text-2xl md:text-3xl">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Thank you for your order. We've sent a confirmation email with your order details.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-6">
              <div className="mb-4 grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-mono font-semibold">{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold">{formatPrice(order.total)}</span>
                </div>
              </div>

              {order.addresses && (
                <div className="mt-4 border-t pt-4 text-sm">
                  <div className="mb-1 font-semibold">Shipping Address</div>
                  <div className="text-muted-foreground">
                    {order.addresses.full_name}
                    <br />
                    {order.addresses.address_line1}
                    {order.addresses.address_line2 && (
                      <>
                        <br />
                        {order.addresses.address_line2}
                      </>
                    )}
                    <br />
                    {order.addresses.city}, {order.addresses.state} {order.addresses.postal_code}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/account/orders">View Order Details</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>

            <div className="rounded-lg border bg-card p-4 text-sm">
              <h3 className="mb-2 font-semibold">What's Next?</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• You'll receive a shipping confirmation email once your order ships</li>
                <li>• Track your order status in your account</li>
                <li>• Estimated delivery: 3-5 business days</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
