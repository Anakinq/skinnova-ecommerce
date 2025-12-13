"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewList } from "@/components/review-list"
import { ReviewForm } from "@/components/review-form"

interface ProductTabsProps {
  description: string
  ingredients: string[]
  benefits: string[]
  howToUse: string
  reviews: any[]
  productId: string
  averageRating: number
}

export function ProductTabs({
  description,
  ingredients,
  benefits,
  howToUse,
  reviews,
  productId,
  averageRating,
}: ProductTabsProps) {
  return (
    <div className="mt-16">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="how-to-use">How to Use</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <div className="prose max-w-none">
            <p className="text-muted-foreground text-pretty">{description}</p>
            {benefits && benefits.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 font-semibold">Key Benefits</h3>
                <ul className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        className="mt-1 h-5 w-5 flex-shrink-0 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ingredients" className="mt-6">
          <div>
            <h3 className="mb-3 font-semibold">Full Ingredient List</h3>
            {ingredients && ingredients.length > 0 ? (
              <p className="text-sm text-muted-foreground">{ingredients.join(", ")}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No ingredient information available.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="how-to-use" className="mt-6">
          <div>
            <h3 className="mb-3 font-semibold">Application Instructions</h3>
            <p className="text-muted-foreground text-pretty">{howToUse}</p>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-8">
            <ReviewForm productId={productId} />
            <ReviewList reviews={reviews} averageRating={averageRating} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
