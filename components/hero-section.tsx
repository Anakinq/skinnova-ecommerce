import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/skincare-products-hero.jpg"
          alt="Beautiful skincare products arrangement"
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/50 to-background/70" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-balance md:text-6xl lg:text-7xl">
            Healthy skin, simplified
          </h1>
          <p className="mt-6 text-lg text-muted-foreground text-pretty md:text-xl">
            Explore science-backed skincare with clean, effective ingredients. Your path to radiant skin begins here.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="text-base">
              <Link href="/shop">Shop All Products</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
              <Link href="/quiz">Find Your Routine</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute -bottom-20 left-1/2 h-40 w-full max-w-4xl -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
    </section>
  )
}
