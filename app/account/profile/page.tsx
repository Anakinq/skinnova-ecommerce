import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/account/profile")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="container px-4 py-12 md:px-6">
      <h1 className="mb-8 font-serif text-3xl font-bold md:text-4xl">Edit Profile</h1>
      <div className="mx-auto max-w-2xl">
        <ProfileForm profile={profile} userId={user.id} />
      </div>
    </div>
  )
}
