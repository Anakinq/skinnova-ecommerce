import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
    return (
        <div className="container px-4 py-12 md:px-6">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 font-serif text-3xl font-bold md:text-4xl">Privacy Policy</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Your Privacy Rights</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray dark:prose-invert">
                        <p>Last updated: {new Date().toLocaleDateString()}</p>

                        <h3>Information We Collect</h3>
                        <p>We collect information you provide directly to us, such as when you create an account, place an order, or contact customer service. This may include your name, email address, phone number, shipping address, and payment information.</p>

                        <h3>How We Use Your Information</h3>
                        <p>We use your information to:</p>
                        <ul>
                            <li>Process and fulfill your orders</li>
                            <li>Communicate with you about your account and orders</li>
                            <li>Send you marketing communications (with your consent)</li>
                            <li>Improve our website and services</li>
                            <li>Prevent fraud and ensure security</li>
                        </ul>

                        <h3>Data Protection</h3>
                        <p>We implement industry-standard security measures to protect your personal information. All data is encrypted in transit and at rest using advanced security protocols.</p>

                        <h3>Your Rights</h3>
                        <p>You have the right to access, update, or delete your personal information at any time. You may also opt out of marketing communications by following the unsubscribe link in our emails.</p>

                        <h3>Contact Us</h3>
                        <p>If you have questions about this privacy policy or concerns about your privacy, please contact us at <a href="mailto:privacy@skinnova.ng">privacy@skinnova.ng</a>.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}