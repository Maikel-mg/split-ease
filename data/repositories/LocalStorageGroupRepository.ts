// Adapter: LocalStorage implementation of GroupRepository
import type { GroupRepository } from "@/core/ports/GroupRepository"
import type { Group, Member } from "@/core/entities/Group"

export class LocalStorageGroupRepository implements GroupRepository {
  private readonly STORAGE_KEY = "expense-groups"

  private generateCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getGroups(): Group[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(this.STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private saveGroups(groups: Group[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(groups))
  }

  async createGroup(name: string, memberNames: string[]): Promise<Group> {
    const groups = this.getGroups()

    const members: Member[] = memberNames.map((name) => ({
      id: this.generateId(),
      name,
      joinedAt: new Date(),
    }))

    const group: Group = {
      id: this.generateId(),
      name,
      code: this.generateCode(),
      members,
      createdAt: new Date(),
    }

    groups.push(group)
    this.saveGroups(groups)
    return group
  }

  async getGroup(id: string): Promise<Group | null> {
    const groups = this.getGroups()
    return groups.find((g) => g.id === id) || null
  }

  async getGroupByCode(code: string): Promise<Group | null> {
    const groups = this.getGroups()
    return groups.find((g) => g.code === code.toUpperCase()) || null
  }

  async addMember(groupId: string, memberName: string): Promise<Member> {
    const groups = this.getGroups()
    const group = groups.find((g) => g.id === groupId)

    if (!group) {
      throw new Error("Grupo no encontrado")
    }

    const member: Member = {
      id: this.generateId(),
      name: memberName,
      joinedAt: new Date(),
    }

    group.members.push(member)
    this.saveGroups(groups)
    return member
  }

  async updateGroup(group: Group): Promise<void> {
    const groups = this.getGroups()
    const index = groups.findIndex((g) => g.id === group.id)

    if (index !== -1) {
      groups[index] = group
      this.saveGroups(groups)
    }
  }
}
