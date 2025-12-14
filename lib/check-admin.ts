import { createClient } from "@/lib/supabase/server"

export async function checkIsAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Debugging
  console.log("User check result:", { user, userError })

  if (!user || userError) {
    return false
  }

  // Hardcoded admin check for debugging
  if (user.email === 'administrator@skinnova.ng') {
    console.log("Hardcoded admin check passed")
    return true
  }

  try {
    // First try to get admin status from JWT claims
    const { data: { session } } = await supabase.auth.getSession()
    const isAdminClaim = session?.user?.app_metadata?.is_admin

    if (typeof isAdminClaim === 'boolean') {
      console.log("Admin status from JWT claim:", isAdminClaim)
      return isAdminClaim
    }

    // Fallback to checking the profiles table with error handling
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    // Debugging
    console.log("Profile check result:", { profile, profileError })

    if (profileError) {
      console.error("Error checking profile for admin status:", profileError)
      return false
    }

    return profile?.is_admin === true
  } catch (error) {
    console.error("Error in admin check:", error)
    // Even if there's an error, we return false rather than letting it propagate
    return false
  }
}