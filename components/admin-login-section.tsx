import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

export function AdminLoginSection() {
  return (
    <section className="border-t bg-muted/20 py-8">
      <div className="container px-4 md:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-lg border bg-card/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Admin Access</h3>
              <p className="text-sm text-muted-foreground">Manage products, orders, and customers</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/auth/login?admin=true">Admin Login</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
