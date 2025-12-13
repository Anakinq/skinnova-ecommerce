"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const categories = ["All Products", "Cleansers", "Toners", "Serums", "Moisturizers", "Sunscreen"]

interface ShopFiltersProps {
  currentCategory?: string
}

export function ShopFilters({ currentCategory }: ShopFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {categories.map((category) => {
            const isActive = category === "All Products" ? !currentCategory : currentCategory === category
            const href = category === "All Products" ? "/shop" : `/shop?category=${category}`

            return (
              <li key={category}>
                <Link
                  href={href}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {category}
                </Link>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
