import type { GroupService } from "@/core/services/GroupService"
import type { ExpenseService } from "@/core/services/ExpenseService"
import type { BalanceService } from "@/core/services/BalanceService"
import type { PaymentService } from "@/core/services/PaymentService"
import type { ValidationService } from "@/core/services/ValidationService"
import type { ValidationRepository } from "@/core/ports/ValidationRepository"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"
import type { Payment } from "@/core/entities/Payment"
import type { Balance, Debt } from "@/core/entities/Balance"
import type { GroupValidationState } from "@/core/entities/Validation"

export interface GroupDetailsDTO {
  group: Group
  visibleExpenses: Expense[]
  visiblePayments: Payment[]
  balances: Balance[]
  debts: Debt[]
  validationState: GroupValidationState
  myValidation: boolean
}

export class GetGroupDetailsUseCase {
  constructor(
    private groupService: GroupService,
    private expenseService: ExpenseService,
    private balanceService: BalanceService,
    private paymentService: PaymentService,
    private validationService: ValidationService,
    private validationRepository: ValidationRepository,
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

    // 5. Validation State
    // The fingerprint must be built from every expense in the group, never from
    // the visibility-filtered list. A private group has no validation at all, and
    // an empty state is exactly "there is nothing to validate".
    const validations = group.isPrivate ? [] : await this.validationRepository.findByGroup(groupId)
    const validationState = group.isPrivate
      ? this.validationService.computeState(group, [], [])
      : this.validationService.computeState(group, expensesData, validations)

    const myMember = userMemberName
      ? group.members.find((m) => m.name === userMemberName)
      : undefined
    const myValidation = myMember
      ? validationState.validatedMemberIds.includes(myMember.id)
      : false

    return {
      group,
      visibleExpenses,
      visiblePayments,
      balances: finalBalances,
      debts: debtsData,
      validationState,
      myValidation
    }
  }
}
