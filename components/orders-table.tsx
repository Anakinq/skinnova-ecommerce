"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/format-currency"
import { Package } from "lucide-react"

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  tracking_number?: string
  tracking_company?: string
  tracking_url?: string
  estimated_delivery_date?: string
  delivery_notes?: string
  profiles: {
    full_name: string
    email: string
  } | null
}

interface OrdersTableProps {
  orders: Order[]
}

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingData, setTrackingData] = useState({
    tracking_number: "",
    tracking_company: "",
    tracking_url: "",
    estimated_delivery_date: "",
    delivery_notes: "",
  })
  const router = useRouter()

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

    if (!error) {
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
      router.refresh()
    }
  }

  const handleTrackingUpdate = async () => {
    if (!selectedOrder) return

    const supabase = createClient()
    const { error } = await supabase
      .from("orders")
      .update({
        tracking_number: trackingData.tracking_number || null,
        tracking_company: trackingData.tracking_company || null,
        tracking_url: trackingData.tracking_url || null,
        estimated_delivery_date: trackingData.estimated_delivery_date || null,
        delivery_notes: trackingData.delivery_notes || null,
      })
      .eq("id", selectedOrder.id)

    if (!error) {
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id ? { ...order, ...trackingData } : order
        )
      )
      setSelectedOrder(null)
      router.refresh()
    }
  }

  const openTrackingDialog = (order: Order) => {
    setSelectedOrder(order)
    setTrackingData({
      tracking_number: order.tracking_number || "",
      tracking_company: order.tracking_company || "",
      tracking_url: order.tracking_url || "",
      estimated_delivery_date: order.estimated_delivery_date || "",
      delivery_notes: order.delivery_notes || "",
    })
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-semibold">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.profiles?.full_name || "Guest"}</div>
                      <div className="text-sm text-muted-foreground">{order.profiles?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-semibold">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Dialog open={selectedOrder?.id === order.id} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openTrackingDialog(order)}>
                          <Package className="mr-2 h-4 w-4" />
                          {order.tracking_number ? "Update" : "Add"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Order Tracking Information</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="tracking_number">Tracking Number</Label>
                            <Input
                              id="tracking_number"
                              value={trackingData.tracking_number}
                              onChange={(e) => setTrackingData({ ...trackingData, tracking_number: e.target.value })}
                              placeholder="e.g., 1234567890"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tracking_company">Shipping Company</Label>
                            <Input
                              id="tracking_company"
                              value={trackingData.tracking_company}
                              onChange={(e) => setTrackingData({ ...trackingData, tracking_company: e.target.value })}
                              placeholder="e.g., DHL, FedEx, UPS"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tracking_url">Tracking URL</Label>
                            <Input
                              id="tracking_url"
                              value={trackingData.tracking_url}
                              onChange={(e) => setTrackingData({ ...trackingData, tracking_url: e.target.value })}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="estimated_delivery_date">Estimated Delivery Date</Label>
                            <Input
                              id="estimated_delivery_date"
                              type="date"
                              value={trackingData.estimated_delivery_date}
                              onChange={(e) => setTrackingData({ ...trackingData, estimated_delivery_date: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="delivery_notes">Delivery Notes</Label>
                            <Textarea
                              id="delivery_notes"
                              value={trackingData.delivery_notes}
                              onChange={(e) => setTrackingData({ ...trackingData, delivery_notes: e.target.value })}
                              placeholder="Additional delivery information..."
                            />
                          </div>
                          <Button onClick={handleTrackingUpdate} className="w-full">
                            Save Tracking Information
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
