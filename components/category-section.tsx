import Link from "next/link"
import { Card } from "@/components/ui/card"

const categories = [
  {
    name: "Cleansers",
    description: "Gentle formulas for every skin type",
    image: "/skincare-cleanser-bottle.jpg",
    href: "/shop?category=Cleansers",
  },
  {
    name: "Serums",
    description: "Targeted treatments for visible results",
    image: "/skincare-serum-dropper.png",
    href: "/shop?category=Serums",
  },
  {
    name: "Moisturizers",
    description: "Hydration that lasts all day",
    image: "/skincare-moisturizer-jar.jpg",
    href: "/shop?category=Moisturizers",
  },
]

export function CategorySection() {
  return (
    <section className="bg-muted/50 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">Shop by Category</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">Find the perfect products for your skincare routine</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.name} href={category.href}>
              <Card className="group overflow-hidden transition-all hover:shadow-lg">
                <div className="relative aspect-square overflow-hidden bg-background">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-serif text-xl font-bold">{category.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
