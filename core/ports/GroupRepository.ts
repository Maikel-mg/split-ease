// Port: Repository interface for Groups
import type { Group, Member } from "../entities/Group"

export interface GroupRepository {
  createGroup(name: string, members: string[], isPrivate: boolean): Promise<Group>
  getGroup(id: string): Promise<Group | null>
  getGroupByCode(code: string): Promise<Group | null>
  addMember(groupId: string, memberName: string): Promise<Member>
  removeMember(groupId: string, memberId: string): Promise<void>
  updateGroup(group: Group): Promise<void>
  getGroupsByIds(groupIds: string[]): Promise<Group[]>
}
