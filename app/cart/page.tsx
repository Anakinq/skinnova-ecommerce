import { createClient } from "@/lib/supabase/server"
import { CartItems } from "@/components/cart-items"
import { CartSummary } from "@/components/cart-summary"

export default async function CartPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let cartItems = []

  if (user) {
    // Fetch cart items from database for authenticated users
    const { data } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        products (
          id,
          name,
          slug,
          price,
          image_url,
          stock_quantity
        )
      `)
      .eq("user_id", user.id)

    cartItems = data || []
  }

  return (
    <div className="container px-4 py-12 md:px-6">
      <h1 className="mb-8 font-serif text-3xl font-bold md:text-4xl">Shopping Cart</h1>

      {cartItems.length === 0 && user ? (
        <div className="py-16 text-center">
          <p className="mb-4 text-muted-foreground">Your cart is empty</p>
          <a href="/shop" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CartItems items={cartItems} isAuthenticated={!!user} />
          </div>
          <div>
            <CartSummary items={cartItems} />
          </div>
        </div>
      )}
    </div>
  )
}
