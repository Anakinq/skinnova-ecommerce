"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

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

interface AddressManagerProps {
  addresses: Address[]
  userId: string
}

export function AddressManager({ addresses: initialAddresses, userId }: AddressManagerProps) {
  const [addresses, setAddresses] = useState(initialAddresses)
  const router = useRouter()

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    const supabase = createClient()
    const { error } = await supabase.from("addresses").delete().eq("id", addressId)

    if (!error) {
      setAddresses(addresses.filter((addr) => addr.id !== addressId))
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <Card key={address.id}>
          <CardContent className="flex items-start justify-between p-6">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-semibold">{address.full_name}</span>
                {address.is_default && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    Default
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {address.address_line1}
                {address.address_line2 && `, ${address.address_line2}`}
                <br />
                {address.city}, {address.state} {address.postal_code}
                <br />
                {address.phone}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleDelete(address.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}

      {addresses.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="mb-4 text-muted-foreground">You haven't added any addresses yet</p>
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground">Note: New addresses can be added during checkout</p>
    </div>
  )
}
