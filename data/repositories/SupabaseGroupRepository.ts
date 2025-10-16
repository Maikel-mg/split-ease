import type { GroupRepository } from "@/core/ports/GroupRepository"
import type { Group, Member } from "@/core/entities/Group"
import type { SupabaseClient } from "@supabase/supabase-js"

export class SupabaseGroupRepository implements GroupRepository {
  constructor(private supabase: SupabaseClient) {}

  private generateCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  async createGroup(name: string, memberNames: string[]): Promise<Group> {
    console.log("[v0] Creating group:", { name, memberNames })

    const code = this.generateCode()
    console.log("[v0] Generated code:", code)

    const { data: groupData, error: groupError } = await this.supabase
      .from("groups")
      .insert({
        name,
        code,
        user_id: null, // No authentication required
      })
      .select()
      .single()

    if (groupError) {
      console.error("[v0] Error creating group:", groupError)
      throw new Error(`Error al crear el grupo: ${groupError.message}`)
    }

    console.log("[v0] Group created:", groupData)

    const membersToInsert = memberNames.map((memberName) => ({
      group_id: groupData.id,
      user_id: null,
      member_name: memberName,
    }))

    console.log("[v0] Inserting members:", membersToInsert)

    const { error: membersError } = await this.supabase.from("group_members").insert(membersToInsert)

    if (membersError) {
      console.error("[v0] Error inserting members:", membersError)
      throw new Error(`Error al agregar miembros: ${membersError.message}`)
    }

    console.log("[v0] Members inserted successfully")

    const { data: membersData } = await this.supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupData.id)
      .order("joined_at", { ascending: true })

    console.log("[v0] Members data:", membersData)

    const members: Member[] =
      membersData?.map((m) => ({
        id: m.id,
        name: m.member_name,
        joinedAt: new Date(m.joined_at),
      })) || []

    return {
      id: groupData.id,
      name: groupData.name,
      code: groupData.code,
      members,
      createdAt: new Date(groupData.created_at),
    }
  }

  async getGroup(id: string): Promise<Group | null> {
    const { data: groupData, error: groupError } = await this.supabase.from("groups").select("*").eq("id", id).single()

    if (groupError || !groupData) return null

    const { data: membersData } = await this.supabase
      .from("group_members")
      .select("*")
      .eq("group_id", id)
      .order("joined_at", { ascending: true })

    const members: Member[] =
      membersData?.map((m) => ({
        id: m.id,
        name: m.member_name,
        joinedAt: new Date(m.joined_at),
      })) || []

    return {
      id: groupData.id,
      name: groupData.name,
      code: groupData.code,
      members,
      createdAt: new Date(groupData.created_at),
    }
  }

  async getGroupByCode(code: string): Promise<Group | null> {
    const { data, error } = await this.supabase.from("groups").select("*").eq("code", code.toUpperCase()).single()

    if (error || !data) return null

    return this.getGroup(data.id)
  }

  async addMember(groupId: string, memberName: string): Promise<Member> {
    const { data, error } = await this.supabase
      .from("group_members")
      .insert({
        group_id: groupId,
        user_id: null,
        member_name: memberName,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.member_name,
      joinedAt: new Date(data.joined_at),
    }
  }

  async updateGroup(group: Group): Promise<void> {
    const { error } = await this.supabase.from("groups").update({ name: group.name }).eq("id", group.id)

    if (error) throw error
  }
}
