import type { GroupService } from "@/domain/services/GroupService"
import type { ExpenseService } from "@/domain/services/ExpenseService"
import type { BalanceService } from "@/domain/services/BalanceService"
import type { PaymentService } from "@/domain/services/PaymentService"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"
import type { Payment } from "@/core/entities/Payment"
import type { Balance, Debt } from "@/core/entities/Balance"

export interface GroupDetailsDTO {
  group: Group
  visibleExpenses: Expense[]
  visiblePayments: Payment[]
  balances: Balance[]
  debts: Debt[]
}

export class GetGroupDetailsUseCase {
  constructor(
    private groupService: GroupService,
    private expenseService: ExpenseService,
    private balanceService: BalanceService,
    private paymentService: PaymentService,
  ) {}

  async execute(groupId: string, userMemberName?: string): Promise<GroupDetailsDTO | null> {
    const group = await this.groupService.getGroup(groupId)
    if (!group) return null

    const expensesData = await this.expenseService.getExpensesByGroup(groupId)
    const paymentsData = await this.paymentService.getPaymentsByGroup(groupId)

    let visibleExpenses: Expense[] = []
    let visiblePayments: Payment[] = paymentsData

    // 1. Visibility Logic
    if (group.isPrivate) {
      if (userMemberName) {
        const member = group.members.find((m) => m.name === userMemberName)
        if (member) {
          visibleExpenses = expensesData.filter(
            (e) => e.paidBy === member.id || e.participants.includes(member.id),
          )
          // Only show payments involving the user
          visiblePayments = paymentsData.filter(
            (p) => p.from === userMemberName || p.to === userMemberName
          )
        }
      }
      
      if (!userMemberName) {
          visiblePayments = []
      }
    } else {
      visibleExpenses = expensesData
    }

    // 2. Base Balance Calculation
    const balancesData = this.balanceService.calculateBalances(group, visibleExpenses, visiblePayments)
    
    // 3. Debt Calculation Strategy
    let debtsData: Debt[] = []
    if (group.isPrivate) {
       // Private: Direct Debts filtered by user
       const allDirectDebts = this.balanceService.calculateDirectDebts(group, visibleExpenses, visiblePayments)
       
       if (userMemberName) {
          debtsData = allDirectDebts.filter(d => d.from === userMemberName || d.to === userMemberName)
       } else {
          debtsData = []
       }
    } else {
       // Public: Global Greedy Simplification
       debtsData = this.balanceService.simplifyDebts(balancesData)
    }

    // 4. Final Balance Display Logic (Relative vs Absolute)
    let finalBalances = balancesData
    if (group.isPrivate && userMemberName) {
      // Use Relative Balances based on Direct Debts
      const directDebts = this.balanceService.calculateDirectDebts(group, visibleExpenses, visiblePayments)
      finalBalances = this.balanceService.calculateRelativeBalances(group, directDebts, userMemberName)
    }

    return {
      group,
      visibleExpenses,
      visiblePayments,
      balances: finalBalances,
      debts: debtsData
    }
  }
}
