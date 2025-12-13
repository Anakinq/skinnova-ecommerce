import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
    return (
        <div className="container px-4 py-12 md:px-6">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 font-serif text-3xl font-bold md:text-4xl">About Skinnova</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Our Story</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray dark:prose-invert">
                        <p>At Skinnova, we believe healthy skin shouldn't be complicated. Our mission is to make premium, science-backed skincare accessible to everyone.</p>

                        <h3>Our Philosophy</h3>
                        <p>We focus on clean formulations with proven active ingredients. Every product in our collection is carefully crafted to deliver real results without harsh chemicals or unnecessary additives.</p>

                        <h3>Quality Assurance</h3>
                        <p>All our products are dermatologist-tested and manufactured in facilities that meet international quality standards. We source our ingredients ethically and sustainably whenever possible.</p>

                        <h3>Community Impact</h3>
                        <p>We're committed to giving back to our community through education and outreach programs that promote healthy skincare habits and environmental sustainability.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}