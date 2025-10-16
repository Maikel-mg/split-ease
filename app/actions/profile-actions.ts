"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createUserProfile(userId: string, displayName: string) {
  try {
    const supabase = await createClient()

    // Validate display name
    if (!displayName || displayName.trim().length === 0) {
      return { success: false, error: "El nombre no puede estar vacío" }
    }

    if (displayName.length > 50) {
      return { success: false, error: "El nombre no puede tener más de 50 caracteres" }
    }

    const { error } = await supabase.from("profiles").insert({
      id: userId,
      display_name: displayName.trim(),
    })

    if (error) {
      console.error("[v0] Error creating profile:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in createUserProfile:", error)
    return { success: false, error: "Error al crear el perfil" }
  }
}

export async function updateUserProfile(userId: string, displayName: string) {
  try {
    const supabase = await createClient()

    // Validate display name
    if (!displayName || displayName.trim().length === 0) {
      return { success: false, error: "El nombre no puede estar vacío" }
    }

    if (displayName.length > 50) {
      return { success: false, error: "El nombre no puede tener más de 50 caracteres" }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
      })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Error updating profile:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in updateUserProfile:", error)
    return { success: false, error: "Error al actualizar el perfil" }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle() // Use maybeSingle() instead of single() to handle 0 rows

    if (error) {
      console.error("[v0] Error fetching profile:", error)
      return { success: false, error: error.message, profile: null }
    }

    if (!data) {
      console.log("[v0] No profile found for user, fetching email to create one")

      // Get user's email from auth
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        return { success: false, error: "No se pudo obtener el email del usuario", profile: null }
      }

      // Create profile with email as display name
      const displayName = user.email.split("@")[0] // Use part before @ as default name

      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          display_name: displayName,
        })
        .select()
        .single()

      if (createError) {
        console.error("[v0] Error auto-creating profile:", createError)
        // Return a temporary profile object even if creation fails
        return {
          success: true,
          profile: {
            id: userId,
            display_name: displayName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }
      }

      return { success: true, profile: newProfile }
    }

    return { success: true, profile: data }
  } catch (error) {
    console.error("[v0] Error in getUserProfile:", error)
    return { success: false, error: "Error al obtener el perfil", profile: null }
  }
}
