// Port: Repository interface for expense validations
import type { Validation } from "../entities/Validation"

export interface ValidationRepository {
  save(groupId: string, memberId: string, expensesFingerprint: string): Promise<Validation>
  retire(groupId: string, memberId: string): Promise<void>
  findByGroup(groupId: string): Promise<Validation[]>
}
