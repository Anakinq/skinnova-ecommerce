import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout-form"

export default async function CheckoutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/checkout")
  }

  // Fetch cart items
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      products (
        id,
        name,
        price,
        image_url
      )
    `)
    .eq("user_id", user.id)

  if (!cartItems || cartItems.length === 0) {
    redirect("/cart")
  }

  // Fetch user profile and addresses
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })

  return (
    <div className="container px-4 py-12 md:px-6">
      <h1 className="mb-8 font-serif text-3xl font-bold md:text-4xl">Checkout</h1>
      <CheckoutForm cartItems={cartItems} profile={profile} addresses={addresses || []} userId={user.id} />
    </div>
  )
}
