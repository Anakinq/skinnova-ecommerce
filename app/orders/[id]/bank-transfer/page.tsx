import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Banknote } from "lucide-react"
import { formatPrice } from "@/lib/format-currency"
import { BANK_ACCOUNT_INFO } from "@/lib/bank-config"

interface BankTransferPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function BankTransferConfirmationPage({ params }: BankTransferPageProps) {
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

    // Update order status to pending_payment
    await supabase
        .from("orders")
        .update({
            order_status: 'pending_payment',
            payment_status: 'pending',
            payment_method: 'bank_transfer'
        })
        .eq("id", id)

    return (
        <div className="container px-4 py-12 md:px-6">
            <div className="mx-auto max-w-2xl">
                <Card className="border-primary/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Banknote className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="font-serif text-2xl md:text-3xl">Bank Transfer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <p className="text-muted-foreground">
                                Please transfer the exact amount to the bank account below.
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
                                    <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bank Account Details */}
                        <Card className="border-dashed border-primary">
                            <CardHeader>
                                <CardTitle className="text-center">Bank Transfer Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Account Name</span>
                                        <span className="font-medium">{BANK_ACCOUNT_INFO.accountName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Account Number</span>
                                        <span className="font-mono font-bold text-lg">{BANK_ACCOUNT_INFO.accountNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Bank Name</span>
                                        <span className="font-medium">{BANK_ACCOUNT_INFO.bankName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Contact Email</span>
                                        <span className="font-medium">{BANK_ACCOUNT_INFO.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Contact Phone</span>
                                        <span className="font-medium">{BANK_ACCOUNT_INFO.phoneNumber}</span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-warning bg-warning/10 p-3 text-sm">
                                    <p className="font-medium text-warning">Important:</p>
                                    <p>Please use your order number ({order.order_number}) as the transfer reference.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Confirmation Button */}
                        <div className="space-y-3">
                            <Button asChild className="w-full" size="lg">
                                <Link href={`/orders/${id}/bank-transfer/confirm`}>
                                    I've Completed the Transfer
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full bg-transparent">
                                <Link href="/account/orders">View Order Details</Link>
                            </Button>
                        </div>

                        <div className="rounded-lg border bg-card p-4 text-sm">
                            <h3 className="mb-2 font-semibold">Next Steps</h3>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Make the bank transfer using the details above</li>
                                <li>• Click "I've Completed the Transfer" after sending the money</li>
                                <li>• Our team will verify the payment and process your order</li>
                                <li>• You'll receive a confirmation email once payment is verified</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}