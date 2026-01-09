import type { GroupRepository } from "@/core/ports/GroupRepository"
import type { ExpenseRepository } from "@/core/ports/ExpenseRepository"
import type { PaymentRepository } from "@/core/ports/PaymentRepository"
import type { BalanceService } from "@/domain/services/BalanceService"

export interface UserGroupIdentity {
  groupId: string
  memberName: string
}

export interface GroupSummary {
  id: string
  name: string
  code: string
  memberCount: number
  totalExpenses: number
  userBalance: number
  archived: boolean
  isPrivate: boolean
}

export class GetUserGroupsUseCase {
  constructor(
    private groupRepository: GroupRepository,
    private expenseRepository: ExpenseRepository,
    private paymentRepository: PaymentRepository,
    private balanceService: BalanceService,
  ) {}

  async execute(identities: UserGroupIdentity[]): Promise<GroupSummary[]> {
    const groupIds = identities.map((i) => i.groupId)
    if (groupIds.length === 0) return []

    // 1. Fetch all groups details
    const groups = await this.groupRepository.getGroupsByIds(groupIds)

    // 2. For each group, calculate stats
    const summaries = await Promise.all(
      groups.map(async (group) => {
        const expenses = await this.expenseRepository.getExpensesByGroup(group.id)
        const payments = await this.paymentRepository.findByGroupId(group.id)
        
        const identity = identities.find((i) => i.groupId === group.id)
        const userMemberName = identity?.memberName || ""

        // Filter expenses if private (only show where user is payer or participant)
        let filteredExpenses = expenses
        if (group.isPrivate && userMemberName) {
          const member = group.members.find((m) => m.name === userMemberName)
          if (member) {
            filteredExpenses = expenses.filter(
              (e) => e.paidBy === member.id || e.participants.includes(member.id),
            )
          }
        }

        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        
        // Calculate balances
        const balances = this.balanceService.calculateBalances(group, filteredExpenses, payments)
        const userBalance = balances.find((b) => b.memberName === userMemberName)?.netBalance || 0

        return {
          id: group.id,
          name: group.name,
          code: group.code,
          memberCount: group.members.length,
          totalExpenses,
          userBalance,
          archived: group.archived,
          isPrivate: group.isPrivate,
        }
      }),
    )

    return summaries
  }
}