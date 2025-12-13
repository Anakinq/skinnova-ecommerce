import { createClient } from "@/lib/supabase/server"

export async function checkIsAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // Hardcoded admin check for debugging
  if (user.email === 'administrator@skinnova.ng') {
    return true
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  return profile?.is_admin === true
}
