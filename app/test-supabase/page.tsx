import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/check-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function TestSupabasePage() {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
        redirect("/auth/login?redirect=/test-supabase")
    }

    const supabase = await createClient()

    // Test user authentication
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    // Test database connection
    const { data: products, error: productsError } = await supabase.from("products").select("*").limit(5)

    // Test profile access
    let profileData = null
    let profileError = null
    if (user) {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        profileData = data
        profileError = error
    }

    return (
        <div className="container px-4 py-12 md:px-6">
            <div className="mb-8">
                <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">Supabase Connection Test</h1>
                <p className="text-muted-foreground">Debugging information for Supabase connectivity</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Authentication</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {userError ? (
                            <div className="text-red-500">
                                <p>Error: {userError.message}</p>
                            </div>
                        ) : user ? (
                            <div>
                                <p><strong>ID:</strong> {user.id}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Role:</strong> {profileData?.is_admin ? "Admin" : "Customer"}</p>
                            </div>
                        ) : (
                            <p>No user authenticated</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Database Connection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {productsError ? (
                            <div className="text-red-500">
                                <p>Error: {productsError.message}</p>
                            </div>
                        ) : products ? (
                            <div>
                                <p>Successfully connected to database</p>
                                <p>Found {products.length} products</p>
                                {products.length > 0 && (
                                    <div className="mt-2">
                                        <p><strong>Sample product:</strong> {products[0].name}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p>No products found</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Profile Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {profileError ? (
                            <div className="text-red-500">
                                <p>Error: {profileError.message}</p>
                            </div>
                        ) : profileData ? (
                            <div>
                                <pre className="bg-muted p-4 text-sm">
                                    {JSON.stringify(profileData, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <p>No profile data found</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <Button asChild>
                    <Link href="/admin/products">Back to Products</Link>
                </Button>
            </div>
        </div>
    )
}