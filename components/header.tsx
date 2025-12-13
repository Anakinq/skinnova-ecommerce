import Link from "next/link"
import { User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartButton } from "@/components/cart-button"
import { createClient } from "@/lib/supabase/server"
import { checkIsAdmin } from "@/lib/check-admin"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdmin = await checkIsAdmin()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-bold text-primary">skinnova.ng</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/shop" className="text-sm font-medium transition-colors hover:text-primary">
            Shop
          </Link>
          <Link href="/shop?category=Serums" className="text-sm font-medium transition-colors hover:text-primary">
            Serums
          </Link>
          <Link href="/shop?category=Moisturizers" className="text-sm font-medium transition-colors hover:text-primary">
            Moisturizers
          </Link>
          <Link href="/shop?category=Cleansers" className="text-sm font-medium transition-colors hover:text-primary">
            Cleansers
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/account">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Link>
          </Button>
          <CartButton />
        </div>
      </div>
    </header>
  )
}
