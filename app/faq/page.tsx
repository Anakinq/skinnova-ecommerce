import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FAQPage() {
    return (
        <div className="container px-4 py-12 md:px-6">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 font-serif text-3xl font-bold md:text-4xl">Frequently Asked Questions</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Common Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray dark:prose-invert">
                        <h3>How do I place an order?</h3>
                        <p>Browse our products, add items to your cart, and proceed to checkout. You'll need to create an account or log in to complete your purchase.</p>

                        <h3>What payment methods do you accept?</h3>
                        <p>We accept all major credit cards and bank transfers through our secure payment partner, Paystack.</p>

                        <h3>Are your products tested on animals?</h3>
                        <p>No, all our products are cruelty-free and never tested on animals.</p>

                        <h3>How should I store my skincare products?</h3>
                        <p>Store products in a cool, dry place away from direct sunlight. Some products may require refrigeration - check the packaging for specific instructions.</p>

                        <h3>Can I return a product if I'm not satisfied?</h3>
                        <p>Yes, we offer a 30-day return policy. Please see our Shipping & Returns page for more details.</p>

                        <h3>Do you ship internationally?</h3>
                        <p>Currently, we only ship within Nigeria. We're working on expanding to international markets soon.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}