"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { formatPrice } from "@/lib/format-currency"
import { createOrder } from "@/lib/actions/create-order"

interface CartItem {
  id: string
  quantity: number
  products: {
    id: string
    name: string
    price: number
    image_url: string
  }
}

interface Address {
  id: string
  full_name: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  is_default: boolean
}

interface CheckoutFormProps {
  cartItems: CartItem[]
  profile: any
  addresses: Address[]
  userId: string
}

export function CheckoutForm({ cartItems, profile, addresses, userId }: CheckoutFormProps) {
  const [selectedAddress, setSelectedAddress] = useState(
    addresses.find((a) => a.is_default)?.id || addresses[0]?.id || "",
  )
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paystack')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // New address form state
  const [newAddress, setNewAddress] = useState({
    full_name: profile?.full_name || "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States",
    phone: profile?.phone || "",
  })

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0)
  const shipping = subtotal > 80000 ? 0 : 10000
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()

      // Add address data
      if (showNewAddress) {
        formData.append('new_address', JSON.stringify(newAddress))
      } else {
        formData.append('address_id', selectedAddress)
      }

      // Add payment method
      formData.append('payment_method', selectedPaymentMethod)

      // Call server action
      const result = await createOrder(userId, formData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to process order')
      }

      // Update cart count
      window.dispatchEvent(new Event("cartUpdated"))

      // Redirect based on payment method
      if (result.payment_url) {
        window.location.href = result.payment_url
      } else {
        router.push(`/orders/${result.order_id}/success`)
      }
    } catch (err: any) {
      console.error("Order error:", err)
      setError(err.message || "Failed to process order. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {addresses.length > 0 && !showNewAddress && (
              <>
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-start space-x-3 rounded-lg border p-4">
                      <RadioGroupItem value={address.id} id={address.id} />
                      <label htmlFor={address.id} className="flex-1 cursor-pointer text-sm">
                        <div className="font-semibold">{address.full_name}</div>
                        <div className="text-muted-foreground">
                          {address.address_line1}
                          {address.address_line2 && `, ${address.address_line2}`}
                        </div>
                        <div className="text-muted-foreground">
                          {address.city}, {address.state} {address.postal_code}
                        </div>
                        <div className="text-muted-foreground">{address.phone}</div>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
                <Button variant="outline" onClick={() => setShowNewAddress(true)} className="w-full">
                  Add New Address
                </Button>
              </>
            )}

            {showNewAddress && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={newAddress.full_name}
                      onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address_line1">Address Line 1</Label>
                  <Input
                    id="address_line1"
                    value={newAddress.address_line1}
                    onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                  <Input
                    id="address_line2"
                    value={newAddress.address_line2}
                    onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={newAddress.postal_code}
                      onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {addresses.length > 0 && (
                  <Button variant="outline" onClick={() => setShowNewAddress(false)} className="w-full">
                    Use Existing Address
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="space-y-3">
              <div className="flex items-center space-x-3 rounded-lg border p-4">
                <RadioGroupItem value="paystack" id="paystack" />
                <label htmlFor="paystack" className="flex-1 cursor-pointer">
                  <div className="font-medium">Paystack</div>
                  <div className="text-sm text-muted-foreground">Pay with credit/debit card</div>
                </label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-4">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                  <div className="font-medium">Bank Transfer</div>
                  <div className="text-sm text-muted-foreground">Transfer to our bank account</div>
                </label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-4">
                <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                <label htmlFor="cash_on_delivery" className="flex-1 cursor-pointer">
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                </label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div>
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.products.image_url || "/placeholder.svg"}
                      alt={item.products.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.products.name}</div>
                    <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-sm font-medium">{formatPrice(item.products.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={
                isProcessing ||
                (!selectedAddress && !showNewAddress) ||
                (showNewAddress &&
                  (!newAddress.full_name ||
                    !newAddress.address_line1 ||
                    !newAddress.city ||
                    !newAddress.state ||
                    !newAddress.postal_code ||
                    !newAddress.phone))
              }
            >
              {isProcessing ? "Processing..." : "Place Order"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By placing your order, you agree to our Terms & Conditions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
