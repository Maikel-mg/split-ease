// Domain entity: Expense
export interface Expense {
  id: string
  groupId: string
  amount: number
  paidBy: string // Member ID
  description: string
  date: Date
  participants: string[] // Array of Member IDs
  imageUrl?: string // Optional photo attachment
  splitMode: "equally" | "shares" | "amounts" // How the expense is split
  splitData?: Record<string, number> // Member ID -> share multiplier or custom amount
  createdAt: Date
}
