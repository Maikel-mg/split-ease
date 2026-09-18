// Domain service: member validation of expenses and payments
import type { Expense } from "@/core/entities/Expense"
import type { Group } from "@/core/entities/Group"
import type { GroupValidationState, Validation } from "@/core/entities/Validation"

export class ValidationService {
  /**
   * Canonical representation of the group's expenses.
   *
   * Only the fields that change somebody's money take part: id, amount, payer,
   * participants and split. Description, date and image are deliberately left
   * out, so editing them does not invalidate anybody. Ordering of every
   * collection is normalised so it never depends on how the database returns
   * rows, on JSONB key order, or on participant insertion order.
   */
  computeExpensesFingerprint(expenses: Expense[]): string {
    return expenses
      .map((expense) => this.expenseFingerprintLine(expense))
      .sort()
      .join(";")
  }

  computeState(group: Group, expenses: Expense[], validations: Validation[]): GroupValidationState {
    const hasExpenses = expenses.length > 0
    const currentFingerprint = this.computeExpensesFingerprint(expenses)
    const eligibleMemberIds = this.eligibleMemberIds(group, expenses)
    const eligible = new Set(eligibleMemberIds)

    const validatedMemberIds: string[] = []
    const staleMemberIds: string[] = []

    validations.forEach((validation) => {
      if (!eligible.has(validation.memberId)) return

      const bucket =
        validation.expensesFingerprint === currentFingerprint ? validatedMemberIds : staleMemberIds

      if (!bucket.includes(validation.memberId)) bucket.push(validation.memberId)
    })

    const validated = new Set(validatedMemberIds)
    const pendingMemberIds = eligibleMemberIds.filter((memberId) => !validated.has(memberId))

    return {
      hasExpenses,
      eligibleMemberIds,
      validatedMemberIds,
      staleMemberIds,
      pendingMemberIds,
      validatedCount: validatedMemberIds.length,
      totalEligible: eligibleMemberIds.length,
      isComplete: hasExpenses && pendingMemberIds.length === 0,
    }
  }

  // A member counts if they paid for or took part in at least one expense.
  eligibleMemberIds(group: Group, expenses: Expense[]): string[] {
    const involved = new Set<string>()

    expenses.forEach((expense) => {
      involved.add(expense.paidBy)
      expense.participants.forEach((participantId) => involved.add(participantId))
    })

    return group.members.map((member) => member.id).filter((memberId) => involved.has(memberId))
  }

  private expenseFingerprintLine(expense: Expense): string {
    return [
      expense.id,
      this.formatNumber(expense.amount),
      expense.paidBy,
      [...expense.participants].sort().join(","),
      expense.splitMode,
      this.canonicalSplitData(expense.splitData),
    ].join("|")
  }

  private canonicalSplitData(splitData?: Record<string, number>): string {
    if (!splitData) return ""

    return Object.keys(splitData)
      .sort()
      .map((key) => `${key}=${this.formatNumber(splitData[key])}`)
      .join(",")
  }

  // Postgres hands `numeric` back as a string, so "30.00" and 30 must produce
  // the same fingerprint.
  private formatNumber(value: number): string {
    return Number(value).toFixed(2)
  }
}
