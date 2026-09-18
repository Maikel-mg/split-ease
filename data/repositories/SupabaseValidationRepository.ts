import type { ValidationRepository } from "@/core/ports/ValidationRepository"
import type { Validation } from "@/core/entities/Validation"
import type { SupabaseClient } from "@supabase/supabase-js"

export class SupabaseValidationRepository implements ValidationRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(groupId: string, memberId: string, expensesFingerprint: string): Promise<Validation> {
    // created_at is sent on purpose: upserting an existing row refreshes it, so
    // it always means "when this member last validated", not "when the row was born".
    const { data, error } = await this.supabase
      .from("expense_validations")
      .upsert(
        {
          group_id: groupId,
          member_id: memberId,
          expenses_fingerprint: expensesFingerprint,
          created_at: new Date().toISOString(),
        },
        { onConflict: "group_id,member_id" },
      )
      .select()
      .single()

    if (error) throw error

    return this.toValidation(data)
  }

  async retire(groupId: string, memberId: string): Promise<void> {
    const { error } = await this.supabase
      .from("expense_validations")
      .delete()
      .eq("group_id", groupId)
      .eq("member_id", memberId)

    if (error) throw error
  }

  async findByGroup(groupId: string): Promise<Validation[]> {
    const { data, error } = await this.supabase
      .from("expense_validations")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true })

    if (error) throw error

    return (data || []).map((row) => this.toValidation(row))
  }

  private toValidation(row: any): Validation {
    return {
      id: row.id,
      groupId: row.group_id,
      memberId: row.member_id,
      expensesFingerprint: row.expenses_fingerprint,
      createdAt: new Date(row.created_at),
    }
  }
}
