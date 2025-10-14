"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

// Create a Supabase client with service role key to bypass RLS
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function createGroupWithMembers(userId: string, groupName: string, memberNames: string[]) {
  try {
    const supabase = createServiceRoleClient()

    // Generate a unique 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: groupName,
        code,
        user_id: userId,
      })
      .select()
      .single()

    if (groupError) {
      console.error("[v0] Error creating group:", groupError)
      throw new Error("Error al crear el grupo")
    }

    console.log("[v0] Group created:", group)

    // Insert members using service role (bypasses RLS)
    const membersToInsert = memberNames.map((name) => ({
      group_id: group.id,
      user_id: null,
      member_name: name,
    }))

    console.log("[v0] Inserting members:", membersToInsert)

    const { error: membersError } = await supabase.from("group_members").insert(membersToInsert)

    if (membersError) {
      console.error("[v0] Error inserting members:", membersError)
      // Try to clean up the group if member insertion fails
      await supabase.from("groups").delete().eq("id", group.id)
      throw new Error("Error al agregar miembros")
    }

    console.log("[v0] Members inserted successfully")

    revalidatePath("/")

    return { success: true, groupId: group.id }
  } catch (error) {
    console.error("[v0] Error in createGroupWithMembers:", error)
    throw error
  }
}

export async function joinGroupWithCode(userId: string, userEmail: string, groupCode: string) {
  try {
    const supabase = createServiceRoleClient()

    // Find the group by code
    const { data: group, error: groupError } = await supabase.from("groups").select("id").eq("code", groupCode).single()

    if (groupError || !group) {
      throw new Error("Grupo no encontrado")
    }

    const { data: existingMember } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", group.id)
      .eq("user_id", userId)
      .maybeSingle()

    if (existingMember) {
      return { success: true, groupId: group.id, alreadyMember: true }
    }

    // Add the user as a member
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: userId,
      member_name: userEmail,
    })

    if (memberError) {
      console.error("[v0] Error adding member:", memberError)
      throw new Error("Error al unirse al grupo")
    }

    revalidatePath("/")

    return { success: true, groupId: group.id, alreadyMember: false }
  } catch (error) {
    console.error("[v0] Error in joinGroupWithCode:", error)
    throw error
  }
}
