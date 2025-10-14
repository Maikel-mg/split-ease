// Port: Payment repository interface
import type { Payment } from "@/core/entities/Payment"

export interface PaymentRepository {
  save(payment: Payment): Promise<void>
  findByGroupId(groupId: string): Promise<Payment[]>
  deleteById(id: string): Promise<void>
}
