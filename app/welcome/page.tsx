"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getUserProfile } from "@/app/actions/profile-actions"
import HomePage from "@/components/home-page"

export default function WelcomePage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const profileResult = await getUserProfile(user.id)
      if (profileResult.success && profileResult.profile) {
        setDisplayName(profileResult.profile.display_name)
      } else {
        // Fallback to email if no profile exists
        setDisplayName(user.email || null)
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </main>
    )
  }

  return <HomePage displayName={displayName} />
}
