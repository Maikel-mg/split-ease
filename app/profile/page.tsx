"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import ProfileForm from "@/components/profile-form"

export default function ProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [displayName, setDisplayName] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)
      setUserEmail(user.email || "")

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

      setDisplayName(profile?.display_name || "")
      setLoading(false)
    }

    loadProfile()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    )
  }

  if (!userId) {
    return null
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <ProfileForm userId={userId} userEmail={userEmail} currentDisplayName={displayName} />
    </div>
  )
}
