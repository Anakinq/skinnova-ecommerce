import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SustainabilityPage() {
    return (
        <div className="container px-4 py-12 md:px-6">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 font-serif text-3xl font-bold md:text-4xl">Sustainability</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Our Commitment to the Planet</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray dark:prose-invert">
                        <p>At Skinnova, we recognize our responsibility to protect the environment and are committed to sustainable practices throughout our operations.</p>

                        <h3>Eco-Friendly Packaging</h3>
                        <p>We use recyclable and biodegradable packaging materials wherever possible. Our product containers are made from recycled plastics, and we encourage customers to recycle them after use.</p>

                        <h3>Ingredient Sourcing</h3>
                        <p>We prioritize ingredients that are ethically sourced and have minimal environmental impact. We work with suppliers who share our commitment to sustainability and fair trade practices.</p>

                        <h3>Carbon Neutral Shipping</h3>
                        <p>We offset the carbon emissions from our shipping by investing in verified carbon reduction projects. This ensures that every order contributes to a cleaner environment.</p>

                        <h3>Water Conservation</h3>
                        <p>Our manufacturing processes are designed to minimize water usage and waste. We continuously invest in technologies that improve our water efficiency and treatment systems.</p>

                        <h3>Community Engagement</h3>
                        <p>We partner with local organizations to support environmental initiatives and educate communities about sustainable skincare practices.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}