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
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const members: Member[] = memberNames.map((name, index) => ({
      id: `member-${Date.now()}-${index}`,
      name,
      joinedAt: new Date(),
    }))

    const code = this.generateCode()

    const { data, error } = await this.supabase
      .from("groups")
      .insert({
        name,
        code,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      members,
      createdAt: new Date(data.created_at),
    }
  }

  async getGroup(id: string): Promise<Group | null> {
    const { data, error } = await this.supabase.from("groups").select("*").eq("id", id).single()

    if (error || !data) return null

    const { data: expenses } = await this.supabase.from("expenses").select("payer, participants").eq("group_id", id)

    const memberNames = new Set<string>()
    expenses?.forEach((expense) => {
      memberNames.add(expense.payer)
      expense.participants.forEach((p: string) => memberNames.add(p))
    })

    const members: Member[] = Array.from(memberNames).map((name, index) => ({
      id: `member-${index}`,
      name,
      joinedAt: new Date(data.created_at),
    }))

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      members,
      createdAt: new Date(data.created_at),
    }
  }

  async getGroupByCode(code: string): Promise<Group | null> {
    const { data, error } = await this.supabase.from("groups").select("*").eq("code", code.toUpperCase()).single()

    if (error || !data) return null

    return this.getGroup(data.id)
  }

  async addMember(groupId: string, memberName: string): Promise<Member> {
    const member: Member = {
      id: `member-${Date.now()}`,
      name: memberName,
      joinedAt: new Date(),
    }
    return member
  }

  async updateGroup(group: Group): Promise<void> {
    const { error } = await this.supabase.from("groups").update({ name: group.name }).eq("id", group.id)

    if (error) throw error
  }
}
