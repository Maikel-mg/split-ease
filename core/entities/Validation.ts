// Domain entity: Validation of expenses and payments
export interface Validation {
  id: string
  groupId: string
  memberId: string
  expensesFingerprint: string // Fingerprint of the group's expenses at validation time
  createdAt: Date
}

export interface GroupValidationState {
  hasExpenses: boolean
  eligibleMemberIds: string[] // Members taking part in at least one expense, in group order
  validatedMemberIds: string[] // Eligible members whose validation is still current
  staleMemberIds: string[] // Eligible members who validated and whose expenses have changed since
  pendingMemberIds: string[] // Eligible members who have not validated
  validatedCount: number
  totalEligible: number
  isComplete: boolean
}
