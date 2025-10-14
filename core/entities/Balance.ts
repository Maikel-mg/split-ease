// Domain entity: Balance and Debt
export interface Balance {
  memberId: string
  memberName: string
  totalPaid: number
  totalOwed: number
  netBalance: number // positive = owed to them, negative = they owe
}

export interface Debt {
  from: string // Member name
  to: string // Member name
  amount: number
}
