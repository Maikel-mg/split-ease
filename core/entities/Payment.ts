// Domain entity: Payment record
export interface Payment {
  id: string
  groupId: string
  from: string // Member name who pays
  to: string // Member name who receives
  amount: number
  date: Date
  registeredAt: Date
}
