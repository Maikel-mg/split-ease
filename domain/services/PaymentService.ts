// Domain service: Payment management
import type { Payment } from "@/core/entities/Payment"
import type { PaymentRepository } from "@/core/ports/PaymentRepository"

export class PaymentService {
  constructor(private repository: PaymentRepository) {}

  async registerPayment(groupId: string, from: string, to: string, amount: number): Promise<Payment> {
    const payment: Payment = {
      id: crypto.randomUUID(),
      groupId,
      from,
      to,
      amount,
      date: new Date(),
      registeredAt: new Date(),
    }

    await this.repository.save(payment)
    return payment
  }

  async getPaymentsByGroup(groupId: string): Promise<Payment[]> {
    return this.repository.findByGroupId(groupId)
  }

  async deletePayment(id: string): Promise<void> {
    await this.repository.deleteById(id)
  }
}
