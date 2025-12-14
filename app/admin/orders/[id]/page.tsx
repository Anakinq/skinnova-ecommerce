import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/check-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/format-currency"
import { OrderStatusManager } from "@/components/admin/order-status-manager"
import Image from "next/image"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
        redirect("/auth/login?redirect=/admin/orders")
    }

    const { id } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Fetch order with all related data
    const { data: order, error } = await supabase
        .from("orders")
        .select(`
      *,
      profiles (
        full_name,
        email,
        phone
      ),
      order_items (
        *,
        products (
          name,
          image_url,
          price
        )
      ),
      order_payments (
        *
      ),
      refunds (
        *
      )
    `)
        .eq("id", id)
        .single()

    if (error || !order) {
        redirect("/admin/orders")
    }

    // Get address if available
    let shippingAddress: any = null
    if (order.shipping_address_id) {
        const { data: addr } = await supabase
            .from("addresses")
            .select("*")
            .eq("id", order.shipping_address_id)
            .single()
        shippingAddress = addr
    } else if (order.shipping_address) {
        shippingAddress = order.shipping_address
    }

    // Parse metadata logs
    const logs = order.metadata?.logs || []

    return (
        <div className="container px-4 py-12 md:px-6">
            <div className="mb-8">
                <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">
                    Order #{order.order_number}
                </h1>
                <p className="text-muted-foreground">
                    Created on {new Date(order.created_at).toLocaleDateString()} at{" "}
                    {new Date(order.created_at).toLocaleTimeString()}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Order Status Management */}
                    <OrderStatusManager order={order} adminId={user.id} />

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                                        <Image
                                            src={item.products?.image_url || "/placeholder.svg"}
                                            alt={item.products?.name || "Product"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{item.products?.name}</div>
                                        <div className="text-sm text-muted-foreground">Quantity: {item.quantity}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Unit Price: {formatPrice(item.price)}
                                        </div>
                                    </div>
                                    <div className="font-semibold">{formatPrice(item.price * item.quantity)}</div>
                                </div>
                            ))}

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{formatPrice(order.shipping_cost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>{formatPrice(order.tax)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Log */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {logs.length > 0 ? (
                                    logs.reverse().map((log: any, index: number) => (
                                        <div key={index} className="flex gap-4 text-sm">
                                            <div className="flex-shrink-0 text-muted-foreground">
                                                {new Date(log.at).toLocaleString()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{log.action}</div>
                                                <div className="text-muted-foreground">{log.message}</div>
                                                <div className="text-xs text-muted-foreground">by {log.actor}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No activity logs available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm text-muted-foreground">Order Status</div>
                                <Badge variant={getOrderStatusVariant(order.order_status)} className="mt-1">
                                    {order.order_status?.replace(/_/g, " ").toUpperCase()}
                                </Badge>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Payment Status</div>
                                <Badge variant={getPaymentStatusVariant(order.payment_status)} className="mt-1">
                                    {order.payment_status?.replace(/_/g, " ").toUpperCase()}
                                </Badge>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Payment Method</div>
                                <div className="mt-1 capitalize">{order.payment_method || "Not specified"}</div>
                            </div>
                            {order.payment_reference && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Payment Reference</div>
                                    <div className="mt-1 font-mono text-xs">{order.payment_reference}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm text-muted-foreground">Name</div>
                                <div className="mt-1">{order.profiles?.full_name || "Guest"}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Email</div>
                                <div className="mt-1 text-sm">{order.profiles?.email || order.guest_email}</div>
                            </div>
                            {order.profiles?.phone && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Phone</div>
                                    <div className="mt-1">{order.profiles.phone}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    {shippingAddress && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-sm">
                                    <div className="font-medium">{shippingAddress.full_name}</div>
                                    <div>{shippingAddress.address_line1}</div>
                                    {shippingAddress.address_line2 && <div>{shippingAddress.address_line2}</div>}
                                    <div>
                                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                                    </div>
                                    <div>{shippingAddress.country}</div>
                                    <div className="mt-2 text-muted-foreground">{shippingAddress.phone}</div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Fulfillment Info */}
                    {order.fulfillment && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Fulfillment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {order.fulfillment.courier && (
                                    <div>
                                        <div className="text-sm text-muted-foreground">Courier</div>
                                        <div className="mt-1">{order.fulfillment.courier}</div>
                                    </div>
                                )}
                                {order.fulfillment.tracking_number && (
                                    <div>
                                        <div className="text-sm text-muted-foreground">Tracking Number</div>
                                        <div className="mt-1 font-mono text-sm">{order.fulfillment.tracking_number}</div>
                                    </div>
                                )}
                                {order.fulfillment.estimated_delivery && (
                                    <div>
                                        <div className="text-sm text-muted-foreground">Estimated Delivery</div>
                                        <div className="mt-1">
                                            {new Date(order.fulfillment.estimated_delivery).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment History */}
                    {order.order_payments && order.order_payments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {order.order_payments.map((payment: any) => (
                                        <div key={payment.id} className="text-sm">
                                            <div className="font-medium">{payment.gateway}</div>
                                            <div className="text-muted-foreground">
                                                {formatPrice(payment.amount_cents / 100)} - {payment.status}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(payment.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Refunds */}
                    {order.refunds && order.refunds.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Refunds</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {order.refunds.map((refund: any) => (
                                        <div key={refund.id} className="text-sm">
                                            <div className="font-medium">{formatPrice(refund.amount_cents / 100)}</div>
                                            <div className="text-muted-foreground">{refund.reason}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(refund.created_at).toLocaleString()} - {refund.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

function getOrderStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "delivered":
        case "paid":
            return "default"
        case "shipped":
        case "processing":
            return "secondary"
        case "cancelled":
        case "payment_failed":
        case "disputed":
            return "destructive"
        default:
            return "outline"
    }
}

function getPaymentStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "paid":
            return "default"
        case "pending":
            return "secondary"
        case "not_paid":
        case "disputed":
        case "payment_failed":
            return "destructive"
        case "refunded":
        case "partially_refunded":
            return "outline"
        default:
            return "outline"
    }
}
