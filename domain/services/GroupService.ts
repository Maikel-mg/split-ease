// Domain service: Group management logic
import type { GroupRepository } from "@/core/ports/GroupRepository"
import type { Group } from "@/core/entities/Group"

export class GroupService {
  constructor(private groupRepository: GroupRepository) {}

  async createGroup(name: string, memberNames: string[]): Promise<Group> {
    if (!name.trim()) {
      throw new Error("El nombre del grupo es requerido")
    }
    if (memberNames.length === 0) {
      throw new Error("Debe agregar al menos un miembro")
    }

    return await this.groupRepository.createGroup(name, memberNames)
  }

  async joinGroup(code: string, memberName: string): Promise<Group> {
    if (!code.trim()) {
      throw new Error("El código es requerido")
    }
    if (!memberName.trim()) {
      throw new Error("El nombre es requerido")
    }

    const group = await this.groupRepository.getGroupByCode(code)
    if (!group) {
      throw new Error("Grupo no encontrado")
    }

    // Check if member already exists
    const memberExists = group.members.some((m) => m.name.toLowerCase() === memberName.toLowerCase())
    if (memberExists) {
      throw new Error("Este nombre ya existe en el grupo")
    }

    await this.groupRepository.addMember(group.id, memberName)
    return (await this.groupRepository.getGroup(group.id)) as Group
  }

  async getGroup(id: string): Promise<Group | null> {
    return await this.groupRepository.getGroup(id)
  }

  async getGroupByCode(code: string): Promise<Group | null> {
    return await this.groupRepository.getGroupByCode(code)
  }

  async addMemberToGroup(groupId: string, memberName: string): Promise<void> {
    if (!memberName.trim()) {
      throw new Error("El nombre del miembro es requerido")
    }

    const group = await this.groupRepository.getGroup(groupId)
    if (!group) {
      throw new Error("Grupo no encontrado")
    }

    // Check if member already exists
    const memberExists = group.members.some((m) => m.name.toLowerCase() === memberName.toLowerCase())
    if (memberExists) {
      throw new Error("Este nombre ya existe en el grupo")
    }

    await this.groupRepository.addMember(groupId, memberName)
  }

  async removeMember(groupId: string, memberId: string): Promise<void> {
    const group = await this.groupRepository.getGroup(groupId)
    if (!group) {
      throw new Error("Grupo no encontrado")
    }

    const memberExists = group.members.some((m) => m.id === memberId)
    if (!memberExists) {
      throw new Error("Miembro no encontrado")
    }

    if (group.members.length <= 1) {
      throw new Error("No se puede eliminar el último miembro del grupo")
    }

    await this.groupRepository.removeMember(groupId, memberId)
  }
}
