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

  const { data: profile, error: profileError } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  // Debugging
  console.log("Profile check result:", { profile, profileError })

  if (profileError) {
    return false
  }

  return profile?.is_admin === true
}
