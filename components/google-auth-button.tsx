"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface GoogleAuthButtonProps {
    type: "sign-in" | "sign-up"
    redirectUrl?: string
}

export function GoogleAuthButton({ type, redirectUrl }: GoogleAuthButtonProps) {
    const supabase = createClient()

    const handleGoogleAuth = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: redirectUrl || `${window.location.origin}/account`,
            },
        })

        if (error) {
            console.error("Google auth error:", error)
            // Handle error appropriately in your UI
        }
    }

    return (
        <Button
            variant="outline"
            type="button"
            onClick={handleGoogleAuth}
            className="w-full"
        >
            <Icons.google className="mr-2 h-4 w-4" />
            {type === "sign-in" ? "Sign in with Google" : "Sign up with Google"}
        </Button>
    )
}