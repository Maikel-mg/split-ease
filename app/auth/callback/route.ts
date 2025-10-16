import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createUserProfile, getUserProfile } from "@/app/actions/profile-actions"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data.user) {
      const profileResult = await getUserProfile(data.user.id)

      if (!profileResult.success || !profileResult.profile) {
        // Extract name from user metadata (Google provides this)
        const displayName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split("@")[0] ||
          "Usuario"

        await createUserProfile(data.user.id, displayName)
      }
    }
  }

  // Redirect to home page after successful authentication
  return NextResponse.redirect(`${origin}/`)
}
