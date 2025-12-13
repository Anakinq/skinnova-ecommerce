import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function VerifyAdminPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Verification</h1>

            <div className="space-y-4">
                <div className="border rounded-lg p-4">
                    <h2 className="font-semibold mb-2">User Information</h2>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>User ID:</strong> {user.id}</p>
                </div>

                <div className="border rounded-lg p-4">
                    <h2 className="font-semibold mb-2">Profile Information</h2>
                    {error ? (
                        <p className="text-red-600">Error: {error.message}</p>
                    ) : profile ? (
                        <>
                            <p><strong>Full Name:</strong> {profile.full_name || 'Not set'}</p>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Is Admin:</strong> {profile.is_admin ? '✅ Yes' : '❌ No'}</p>
                            <p><strong>Created At:</strong> {new Date(profile.created_at).toLocaleString()}</p>
                        </>
                    ) : (
                        <p>No profile found</p>
                    )}
                </div>

                {profile && !profile.is_admin && (
                    <div className="border border-yellow-500 bg-yellow-50 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Not an Admin</h3>
                        <p className="text-sm text-yellow-700 mb-2">
                            To make this account an admin, run the following SQL in your Supabase SQL Editor:
                        </p>
                        <pre className="bg-gray-800 text-white p-3 rounded text-xs overflow-x-auto">
                            {`UPDATE profiles 
SET is_admin = true 
WHERE email = '${user.email}';`}
                        </pre>
                    </div>
                )}

                {profile && profile.is_admin && (
                    <div className="border border-green-500 bg-green-50 rounded-lg p-4">
                        <h3 className="font-semibold text-green-800 mb-2">✅ Admin Access Confirmed</h3>
                        <p className="text-sm text-green-700">
                            You should be able to access the admin dashboard.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
