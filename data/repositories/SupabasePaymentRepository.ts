import type { Payment } from "@/core/entities/Payment"
import type { PaymentRepository } from "@/core/ports/PaymentRepository"
import type { SupabaseClient } from "@supabase/supabase-js"

export class SupabasePaymentRepository implements PaymentRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(payment: Payment): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { error } = await this.supabase.from("payments").upsert({
      id: payment.id,
      group_id: payment.groupId,
      from_member: payment.from,
      to_member: payment.to,
      amount: payment.amount,
      date: payment.date.toISOString(),
      user_id: user.id,
    })

    if (error) throw error
  }

  async findByGroupId(groupId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from("payments")
      .select("*")
      .eq("group_id", groupId)
      .order("date", { ascending: false })

    if (error) throw error

    return (data || []).map((row) => ({
      id: row.id,
      groupId: row.group_id,
      from: row.from_member,
      to: row.to_member,
      amount: row.amount,
      date: new Date(row.date),
      registeredAt: new Date(row.date),
    }))
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await this.supabase.from("payments").delete().eq("id", id)

    if (error) throw error
  }
}
