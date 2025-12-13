import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
    return (
        <div className="container px-4 py-12 md:px-6">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 font-serif text-3xl font-bold md:text-4xl">Contact Us</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Get in Touch</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray dark:prose-invert">
                        <p>We'd love to hear from you! Here are the best ways to reach us:</p>

                        <h3>Email</h3>
                        <p>
                            For general inquiries: <a href="mailto:info@skinnova.ng">info@skinnova.ng</a>
                            <br />
                            For customer support: <a href="mailto:support@skinnova.ng">support@skinnova.ng</a>
                        </p>

                        <h3>Social Media</h3>
                        <p>Follow us on our social channels for the latest updates and skincare tips:</p>
                        <ul>
                            <li>Instagram: @skinnova.ng</li>
                            <li>Twitter/X: @skinnova_ng</li>
                        </ul>

                        <h3>WhatsApp</h3>
                        <p>Chat with us directly on WhatsApp: +234 801 234 5678</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}