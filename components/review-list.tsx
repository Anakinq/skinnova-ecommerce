import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  created_at: string
  profiles: {
    full_name: string
  } | null
}

interface ReviewListProps {
  reviews: Review[]
  averageRating: number
}

export function ReviewList({ reviews, averageRating }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">No reviews yet. Be the first to review this product!</div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(averageRating) ? "fill-primary text-primary" : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">{reviews.length} reviews</div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{review.profiles?.full_name || "Anonymous"}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.title && <h4 className="mb-2 font-semibold">{review.title}</h4>}
              <p className="text-sm text-muted-foreground text-pretty">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
