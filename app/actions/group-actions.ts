"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { BalanceService } from "@/domain/services/BalanceService"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"
import type { Payment } from "@/core/entities/Payment"

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

export async function getUserGroups(userId: string) {
  try {
    const supabase = createServiceRoleClient()

    // Get all groups where the user is a member
    const { data: memberships, error: membershipsError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId)

    if (membershipsError) {
      console.error("[v0] Error fetching memberships:", membershipsError)
      throw new Error("Error al obtener grupos")
    }

    const groupIds = memberships.map((m) => m.group_id)

    if (groupIds.length === 0) {
      return []
    }

    // Get group details
    const { data: groups, error: groupsError } = await supabase.from("groups").select("*").in("id", groupIds)

    if (groupsError) {
      console.error("[v0] Error fetching groups:", groupsError)
      throw new Error("Error al obtener grupos")
    }

    const balanceService = new BalanceService()

    // For each group, get member count, total expenses, and user balance
    const groupsWithDetails = await Promise.all(
      groups.map(async (group) => {
        // Get member count
        const { count: memberCount } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", group.id)

        // Get all members
        const { data: members } = await supabase.from("group_members").select("*").eq("group_id", group.id)

        // Get all expenses for the group
        const { data: expensesData } = await supabase.from("expenses").select("*").eq("group_id", group.id)

        // Get all payments for the group
        const { data: paymentsData } = await supabase.from("payments").select("*").eq("group_id", group.id)

        // Calculate total expenses
        const totalExpenses = expensesData?.reduce((sum, exp) => sum + exp.amount, 0) || 0

        // Convert to domain entities
        const groupEntity: Group = {
          id: group.id,
          name: group.name,
          code: group.code,
          members: (members || []).map((m) => ({
            id: m.id,
            name: m.member_name,
          })),
        }

        const expenses: Expense[] = (expensesData || []).map((e) => ({
          id: e.id,
          groupId: e.group_id,
          amount: e.amount,
          description: e.description,
          paidBy: e.paidBy,
          participants: e.participants as string[],
          date: new Date(e.date),
        }))

        const payments: Payment[] = (paymentsData || []).map((p) => ({
          id: p.id,
          groupId: p.group_id,
          from: p.from,
          to: p.to,
          amount: p.amount,
          date: new Date(p.date),
        }))

        // Calculate balances using BalanceService
        const balances = balanceService.calculateBalances(groupEntity, expenses, payments)

        // Find the user's member name
        const userMember = members?.find((m) => m.user_id === userId)
        const userName = userMember?.member_name || ""

        // Find user's balance
        const userBalance = balances.find((b) => b.memberName === userName)?.netBalance || 0

        console.log("[v0] Group:", group.name, "User balance:", userBalance)

        return {
          id: group.id,
          name: group.name,
          code: group.code,
          memberCount: memberCount || 0,
          totalExpenses,
          userBalance,
          archived: group.archived,
        }
      }),
    )

    return groupsWithDetails
  } catch (error) {
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
