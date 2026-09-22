"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { BalanceService } from "@/core/services/BalanceService"

import { SupabaseGroupRepository } from "@/data/repositories/SupabaseGroupRepository"
import { SupabaseExpenseRepository } from "@/data/repositories/SupabaseExpenseRepository"
import { SupabasePaymentRepository } from "@/data/repositories/SupabasePaymentRepository"
import { GetUserGroupsUseCase, type UserGroupIdentity } from "@/core/use-cases/GetUserGroupsUseCase"

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

export async function getUserGroupsFromIdentities(identities: UserGroupIdentity[]) {
  try {
    const supabase = createServiceRoleClient()
    const groupRepo = new SupabaseGroupRepository(supabase)
    const expenseRepo = new SupabaseExpenseRepository(supabase)
    const paymentRepo = new SupabasePaymentRepository(supabase)
    const balanceService = new BalanceService()

    const useCase = new GetUserGroupsUseCase(groupRepo, expenseRepo, paymentRepo, balanceService)

    return await useCase.execute(identities)
  } catch (error) {
    console.error("[v0] Error in getUserGroupsFromIdentities:", error)
    throw error
  }
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
        archived: false,
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

export async function joinGroupWithCode(userId: string, displayName: string, groupCode: string) {
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
      .eq("member_name", displayName)
      .maybeSingle()

    if (existingMember) {
      return { success: true, groupId: group.id, alreadyMember: true }
    }

    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: null,
      member_name: displayName,
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

export async function archiveGroup(groupId: string) {
  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase
      .from("groups")
      .update({ archived: true })
      .eq("id", groupId)

    if (error) {
      console.error("[v0] Error archiving group:", error)
      throw new Error("Error al archivar el grupo")
    }

    revalidatePath("/grupos")
    revalidatePath(`/group/${groupId}`)

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in archiveGroup:", error)
    throw error
  }
}

export async function unarchiveGroup(groupId: string) {
  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase
      .from("groups")
      .update({ archived: false })
      .eq("id", groupId)

    if (error) {
      console.error("[v0] Error unarchiving group:", error)
      throw new Error("Error al desarchivar el grupo")
    }

    revalidatePath("/grupos")
    revalidatePath(`/group/${groupId}`)

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in unarchiveGroup:", error)
    throw error
  }
}

export async function deleteGroup(groupId: string) {
  try {
    const supabase = createServiceRoleClient()

    // First delete all related records (expenses, payments, members)
    const { error: expensesError } = await supabase.from("expenses").delete().eq("group_id", groupId)
    if (expensesError) {
      console.error("[v0] Error deleting expenses:", expensesError)
    }

    const { error: paymentsError } = await supabase.from("payments").delete().eq("group_id", groupId)
    if (paymentsError) {
      console.error("[v0] Error deleting payments:", paymentsError)
    }

    const { error: membersError } = await supabase.from("group_members").delete().eq("group_id", groupId)
    if (membersError) {
      console.error("[v0] Error deleting members:", membersError)
    }

    // Finally delete the group
    const { error } = await supabase.from("groups").delete().eq("id", groupId)

    if (error) {
      console.error("[v0] Error deleting group:", error)
      throw new Error("Error al eliminar el grupo")
    }

    revalidatePath("/grupos")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in deleteGroup:", error)
    throw error
  }
}

export async function copyGroup(sourceGroupId: string, newGroupName: string) {
  try {
    const supabase = createServiceRoleClient()

    // Fetch the source group with its members
    const { data: sourceGroup, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", sourceGroupId)
      .single()

    if (groupError || !sourceGroup) {
      console.error("[v0] Error fetching source group:", groupError)
      throw new Error("Grupo no encontrado")
    }

    // Fetch members of the source group
    const { data: members, error: membersError } = await supabase
      .from("group_members")
      .select("member_name")
      .eq("group_id", sourceGroupId)

    if (membersError) {
      console.error("[v0] Error fetching members:", membersError)
      throw new Error("Error al obtener los miembros del grupo")
    }

    if (!members || members.length === 0) {
      throw new Error("El grupo no tiene miembros para copiar")
    }

    // Extract member names
    const memberNames = members.map((m) => m.member_name)

    // Use the same user_id as the source group (or null if not set)
    const ownerUserId = sourceGroup.user_id || null

    console.log("[v0] Copying group:", sourceGroup.name, "with members:", memberNames)

    // Create the new group with the same members using createGroupWithMembers
    const result = await createGroupWithMembers(ownerUserId, newGroupName, memberNames)

    console.log("[v0] Group copied successfully:", result)

    return { success: true, newGroupId: result.groupId }
  } catch (error: any) {
    console.error("[v0] Error in copyGroup:", error)
    throw new Error(error.message || "Error al copiar el grupo")
  }
}
