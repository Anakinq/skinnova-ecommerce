import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/format-currency"
import { Package, Truck, Calendar, User } from "lucide-react"

interface OrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

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
        country,
        phone
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    notFound()
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select(`
      *,
      products (
        id,
        name,
        slug,
        image_url
      )
    `)
    .eq("order_id", order.id)

  // Extract fulfillment data for easier access
  const fulfillment = order.fulfillment || {}

  return (
    <div className="container px-4 py-12 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">Order Details</h1>
          <p className="font-mono text-sm text-muted-foreground">{order.order_number}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/account/orders">Back to Orders</Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems?.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.products.image_url || "/placeholder.svg"}
                      alt={item.products.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.products.slug}`} className="font-semibold hover:text-primary">
                        {item.products.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">Quantity: {item.quantity}</div>
                    </div>
                    <div className="font-semibold">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {order.addresses && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="font-semibold">{order.addresses.full_name}</div>
                <div className="text-muted-foreground">
                  {order.addresses.address_line1}
                  {order.addresses.address_line2 && (
                    <>
                      <br />
                      {order.addresses.address_line2}
                    </>
                  )}
                  <br />
                  {order.addresses.city}, {order.addresses.state} {order.addresses.postal_code}
                  <br />
                  {order.addresses.phone}
                </div>
              </CardContent>
            </Card>
          )}

          {(fulfillment.tracking_number || fulfillment.courier || fulfillment.delivery_agent) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Tracking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {fulfillment.tracking_number && (
                    <div className="flex items-start gap-2">
                      <Truck className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Tracking Number</div>
                        <div className="font-mono text-sm text-muted-foreground">{fulfillment.tracking_number}</div>
                      </div>
                    </div>
                  )}
                  {fulfillment.courier && (
                    <div className="flex items-start gap-2">
                      <Package className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Shipping Company</div>
                        <div className="text-sm text-muted-foreground">{fulfillment.courier}</div>
                      </div>
                    </div>
                  )}
                  {fulfillment.delivery_agent && (
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Delivery Agent</div>
                        <div className="text-sm text-muted-foreground">{fulfillment.delivery_agent}</div>
                        {fulfillment.agent_contact && (
                          <div className="text-xs text-muted-foreground">Contact: {fulfillment.agent_contact}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {fulfillment.estimated_delivery && (
                    <div className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Estimated Delivery</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(fulfillment.estimated_delivery).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  {order.delivery_notes && (
                    <div className="rounded-lg border bg-muted/50 p-3">
                      <div className="text-sm font-medium">Delivery Notes</div>
                      <div className="mt-1 text-sm text-muted-foreground">{order.delivery_notes}</div>
                    </div>
                  )}
                  {order.tracking_url && (
                    <Button asChild className="w-full" variant="outline">
                      <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                        Track Package
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "payment_failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {order.shipping_cost === 0 ? "Free" : formatPrice(order.shipping_cost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{formatPrice(order.tax)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
