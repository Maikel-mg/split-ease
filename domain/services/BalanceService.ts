// Domain service: Balance calculation and debt simplification
import type { Expense } from "@/core/entities/Expense"
import type { Group } from "@/core/entities/Group"
import type { Balance, Debt } from "@/core/entities/Balance"
import type { Payment } from "@/core/entities/Payment"

export class BalanceService {
  calculateBalances(group: Group, expenses: Expense[], payments: Payment[] = []): Balance[] {
    const balances = new Map<string, Balance>()

    // Initialize balances for all members
    group.members.forEach((member) => {
      balances.set(member.id, {
        memberId: member.id,
        memberName: member.name,
        totalPaid: 0,
        totalOwed: 0,
        netBalance: 0,
      })
    })

    // Calculate totals from expenses
    expenses.forEach((expense) => {
      const payer = balances.get(expense.paidBy)
      if (payer) {
        payer.totalPaid += expense.amount
      }

      if (expense.splitMode === "equally") {
        // Split equally among participants
        const sharePerPerson = expense.amount / expense.participants.length
        expense.participants.forEach((participantId) => {
          const participant = balances.get(participantId)
          if (participant) {
            participant.totalOwed += sharePerPerson
          }
        })
      } else if (expense.splitMode === "shares" && expense.splitData) {
        // Split by shares (multipliers)
        const totalShares = expense.participants.reduce((sum, id) => sum + (expense.splitData?.[id] || 1), 0)
        expense.participants.forEach((participantId) => {
          const participant = balances.get(participantId)
          if (participant) {
            const shares = expense.splitData?.[participantId] || 1
            participant.totalOwed += (expense.amount * shares) / totalShares
          }
        })
      } else if (expense.splitMode === "amounts" && expense.splitData) {
        // Split by custom amounts
        expense.participants.forEach((participantId) => {
          const participant = balances.get(participantId)
          if (participant) {
            const customAmount = expense.splitData?.[participantId] || 0
            participant.totalOwed += customAmount
          }
        })
      }
    })

    payments.forEach((payment) => {
      // Find members by name
      const payer = Array.from(balances.values()).find((b) => b.memberName === payment.from)
      const receiver = Array.from(balances.values()).find((b) => b.memberName === payment.to)

      if (payer && receiver) {
        // Payer made a payment, so they paid more
        payer.totalPaid += payment.amount
        // Receiver received payment, so they owe more (settling the debt)
        receiver.totalOwed += payment.amount
      }
    })

    // Calculate net balance
    balances.forEach((balance) => {
      balance.netBalance = balance.totalPaid - balance.totalOwed
    })

    return Array.from(balances.values())
  }

  simplifyDebts(balances: Balance[]): Debt[] {
    // Greedy algorithm to minimize transactions
    const creditors = balances
      .filter((b) => b.netBalance > 0.01)
      .map((b) => ({ name: b.memberName, amount: b.netBalance }))
      .sort((a, b) => b.amount - a.amount)

    const debtors = balances
      .filter((b) => b.netBalance < -0.01)
      .map((b) => ({ name: b.memberName, amount: -b.netBalance }))
      .sort((a, b) => b.amount - a.amount)

    const debts: Debt[] = []
    let i = 0
    let j = 0

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i]
      const debtor = debtors[j]

      const amount = Math.min(creditor.amount, debtor.amount)

      if (amount > 0.01) {
        debts.push({
          from: debtor.name,
          to: creditor.name,
          amount: Math.round(amount * 100) / 100,
        })
      }

      creditor.amount -= amount
      debtor.amount -= amount

      if (creditor.amount < 0.01) i++
      if (debtor.amount < 0.01) j++
    }

    return debts
  }
}
