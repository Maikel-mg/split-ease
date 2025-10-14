// Adapter: LocalStorage implementation of PaymentRepository
import type { Payment } from "@/core/entities/Payment"
import type { PaymentRepository } from "@/core/ports/PaymentRepository"

export class LocalStoragePaymentRepository implements PaymentRepository {
  private readonly STORAGE_KEY = "gastogrupal_payments"

  async save(payment: Payment): Promise<void> {
    const payments = await this.getAll()
    const existingIndex = payments.findIndex((p) => p.id === payment.id)

    if (existingIndex >= 0) {
      payments[existingIndex] = payment
    } else {
      payments.push(payment)
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payments))
  }

  async findByGroupId(groupId: string): Promise<Payment[]> {
    const payments = await this.getAll()
    return payments.filter((p) => p.groupId === groupId)
  }

  async deleteById(id: string): Promise<void> {
    const payments = await this.getAll()
    const filtered = payments.filter((p) => p.id !== id)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }

  private async getAll(): Promise<Payment[]> {
    const data = localStorage.getItem(this.STORAGE_KEY)
    if (!data) return []

    const payments = JSON.parse(data)
    // Convert date strings back to Date objects
    return payments.map((p: any) => ({
      ...p,
      date: new Date(p.date),
      registeredAt: new Date(p.registeredAt),
    }))
  }
}
