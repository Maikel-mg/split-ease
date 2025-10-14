// Port: Repository interface for Groups
import type { Group, Member } from "../entities/Group"

export interface GroupRepository {
  createGroup(name: string, members: string[]): Promise<Group>
  getGroup(id: string): Promise<Group | null>
  getGroupByCode(code: string): Promise<Group | null>
  addMember(groupId: string, memberName: string): Promise<Member>
  updateGroup(group: Group): Promise<void>
}
