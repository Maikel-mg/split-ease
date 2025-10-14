// Domain entity: Expense
export interface Expense {
  id: string
  groupId: string
  amount: number
  paidBy: string // Member ID
  description: string
  date: Date
  participants: string[] // Array of Member IDs
  createdAt: Date
}
