import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ShippingPage() {
    return (
        <div className="container px-4 py-12 md:px-6">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 font-serif text-3xl font-bold md:text-4xl">Shipping & Returns</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Our Policies</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray dark:prose-invert">
                        <h3>Shipping Information</h3>
                        <p>We offer fast and reliable shipping throughout Nigeria.</p>
                        <ul>
                            <li>Free shipping on orders over ₦80,000</li>
                            <li>Standard delivery: 3-5 business days</li>
                            <li>Express delivery: 1-2 business days (additional fee applies)</li>
                        </ul>

                        <h3>Returns Policy</h3>
                        <p>We want you to be completely satisfied with your purchase.</p>
                        <ul>
                            <li>30-day return window from date of delivery</li>
                            <li>Items must be unused and in original packaging</li>
                            <li>Return shipping costs are the customer's responsibility</li>
                            <li>Refunds processed within 5-7 business days after inspection</li>
                        </ul>

                        <h3>How to Initiate a Return</h3>
                        <p>To start a return, please contact our customer service team at <a href="mailto:returns@skinnova.ng">returns@skinnova.ng</a> with your order number and reason for return.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}