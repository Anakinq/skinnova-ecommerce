"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { updateOrderStatus, issueRefund, cancelOrder } from "@/lib/actions/admin-orders"
import { toast } from "sonner"
import { Loader2, Package, XCircle, DollarSign } from "lucide-react"

interface OrderStatusManagerProps {
    order: any
    adminId: string
}

export function OrderStatusManager({ order, adminId }: OrderStatusManagerProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // Status update form
    const [newStatus, setNewStatus] = useState(order.order_status)
    const [statusReason, setStatusReason] = useState("")
    const [trackingNumber, setTrackingNumber] = useState(order.fulfillment?.tracking_number || "")
    const [courier, setCourier] = useState(order.fulfillment?.courier || "")
    const [deliveryAgent, setDeliveryAgent] = useState(order.fulfillment?.delivery_agent || "")
    const [agentContact, setAgentContact] = useState(order.fulfillment?.agent_contact || "")
    const [estimatedDelivery, setEstimatedDelivery] = useState(
        order.fulfillment?.estimated_delivery || ""
    )

    // Refund form
    const [refundAmount, setRefundAmount] = useState("")
    const [refundReason, setRefundReason] = useState("")

    // Cancel form
    const [cancelReason, setCancelReason] = useState("")

    const handleUpdateStatus = async () => {
        setIsLoading(true)
        try {
            const result = await updateOrderStatus({
                order_id: order.id,
                new_status: newStatus,
                reason: statusReason,
                tracking_number: trackingNumber,
                courier: courier,
                delivery_agent: deliveryAgent,
                agent_contact: agentContact,
                estimated_delivery: estimatedDelivery,
                admin_id: adminId,
            })

            if (result.success) {
                toast.success("Order status updated successfully")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update status")
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleIssueRefund = async () => {
        setIsLoading(true)
        try {
            const amountCents = refundAmount
                ? parseFloat(refundAmount) * 100
                : Math.round(order.total * 100)

            const result = await issueRefund({
                order_id: order.id,
                amount_cents: amountCents,
                reason: refundReason,
                admin_id: adminId,
            })

            if (result.success) {
                toast.success("Refund issued successfully")
                router.refresh()
                setRefundAmount("")
                setRefundReason("")
            } else {
                toast.error(result.error || "Failed to issue refund")
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelOrder = async () => {
        setIsLoading(true)
        try {
            const result = await cancelOrder({
                order_id: order.id,
                reason: cancelReason,
                admin_id: adminId,
            })

            if (result.success) {
                toast.success("Order cancelled successfully")
                router.refresh()
                setCancelReason("")
            } else {
                toast.error(result.error || "Failed to cancel order")
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const canUpdateStatus = !['cancelled', 'refunded', 'archived'].includes(order.order_status)
    const canRefund = order.payment_status === 'paid'
    const canCancel = !['shipped', 'in_transit', 'delivered', 'cancelled'].includes(order.order_status)

    return (
        <div className="space-y-6">
            {/* Bank Transfer Verification */}
            {order.payment_method === 'bank_transfer' && order.payment_status === 'pending' && (
                <Card className="border-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-primary"></div>
                            Bank Transfer Verification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This order was placed using bank transfer. Verify that the payment has been received before updating the status.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() => {
                                    setNewStatus('paid');
                                    setStatusReason('Bank transfer verified');
                                    handleUpdateStatus();
                                }}
                                disabled={isLoading}
                                className="flex-1 min-w-[120px]"
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Mark as Paid
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setNewStatus('payment_failed');
                                    setStatusReason('Bank transfer not received');
                                    handleUpdateStatus();
                                }}
                                disabled={isLoading}
                                className="flex-1 min-w-[120px]"
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Mark as Failed
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Update Status */}
            {canUpdateStatus && (
                <Card>
                    <CardHeader>
                        <CardTitle>Update Order Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="status">New Status</Label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending_payment">Pending Payment</SelectItem>
                                        <SelectItem value="payment_failed">Payment Failed</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="ready_for_shipment">Ready for Shipment</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="in_transit">In Transit</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason (optional)</Label>
                                <Input
                                    id="reason"
                                    placeholder="Reason for status change"
                                    value={statusReason}
                                    onChange={(e) => setStatusReason(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Shipping Details (shown when status is shipped or later) */}
                        {['shipped', 'in_transit', 'delivered'].includes(newStatus) && (
                            <div className="space-y-4 rounded-lg border p-4">
                                <h4 className="font-semibold">Shipping Details</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="courier">Courier</Label>
                                        <Input
                                            id="courier"
                                            placeholder="DHL, FedEx, UPS, etc."
                                            value={courier}
                                            onChange={(e) => setCourier(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tracking">Tracking Number</Label>
                                        <Input
                                            id="tracking"
                                            placeholder="Tracking number"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="delivery-agent">Delivery Agent Name</Label>
                                        <Input
                                            id="delivery-agent"
                                            placeholder="Agent responsible for delivery"
                                            value={deliveryAgent}
                                            onChange={(e) => setDeliveryAgent(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="agent-contact">Agent Contact</Label>
                                        <Input
                                            id="agent-contact"
                                            placeholder="Phone or email"
                                            value={agentContact}
                                            onChange={(e) => setAgentContact(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="delivery">Estimated Delivery Date</Label>
                                    <Input
                                        id="delivery"
                                        type="date"
                                        value={estimatedDelivery}
                                        onChange={(e) => setEstimatedDelivery(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <Button onClick={handleUpdateStatus} disabled={isLoading} className="w-full md:w-auto">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Package className="mr-2 h-4 w-4" />
                            Update Status
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {/* Issue Refund */}
                    {canRefund && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Issue Refund
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Issue Refund</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Process a refund for this order. Leave amount empty for full refund.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="refund-amount">Refund Amount (₦)</Label>
                                        <Input
                                            id="refund-amount"
                                            type="number"
                                            step="0.01"
                                            placeholder={`Full refund: ₦${order.total}`}
                                            value={refundAmount}
                                            onChange={(e) => setRefundAmount(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="refund-reason">Reason</Label>
                                        <Textarea
                                            id="refund-reason"
                                            placeholder="Reason for refund"
                                            value={refundReason}
                                            onChange={(e) => setRefundReason(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleIssueRefund}
                                        disabled={!refundReason || isLoading}
                                    >
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Process Refund
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {/* Cancel Order */}
                    {canCancel && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="default">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Order
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will cancel the order and release inventory. If the order is paid, a refund will be
                                        automatically processed.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
                                        <Textarea
                                            id="cancel-reason"
                                            placeholder="Why is this order being cancelled?"
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleCancelOrder}
                                        disabled={!cancelReason || isLoading}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Cancel Order
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
