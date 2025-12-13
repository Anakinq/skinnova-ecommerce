import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddressManager } from "@/components/address-manager"

export default async function AddressesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/account/addresses")
  }

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })

  return (
    <div className="container px-4 py-12 md:px-6">
      <h1 className="mb-8 font-serif text-3xl font-bold md:text-4xl">Shipping Addresses</h1>
      <AddressManager addresses={addresses || []} userId={user.id} />
    </div>
  )
}
