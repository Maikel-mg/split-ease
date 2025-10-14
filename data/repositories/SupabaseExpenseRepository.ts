import type { ExpenseRepository } from "@/core/ports/ExpenseRepository"
import type { Expense } from "@/core/entities/Expense"
import type { SupabaseClient } from "@supabase/supabase-js"

export class SupabaseExpenseRepository implements ExpenseRepository {
  constructor(private supabase: SupabaseClient) {}

  async createExpense(expense: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { data, error } = await this.supabase
      .from("expenses")
      .insert({
        group_id: expense.groupId,
        amount: expense.amount,
        description: expense.description,
        payer: expense.paidBy, // Changed from expense.payer to expense.paidBy
        participants: expense.participants,
        date: expense.date.toISOString(),
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      groupId: data.group_id,
      amount: data.amount,
      description: data.description,
      paidBy: data.payer, // Map payer column to paidBy field
      participants: data.participants,
      date: new Date(data.date),
      createdAt: new Date(data.created_at),
    }
  }

  async getExpensesByGroup(groupId: string): Promise<Expense[]> {
    const { data, error } = await this.supabase
      .from("expenses")
      .select("*")
      .eq("group_id", groupId)
      .order("date", { ascending: false })

    if (error) throw error

    return (data || []).map((row) => ({
      id: row.id,
      groupId: row.group_id,
      amount: row.amount,
      description: row.description,
      paidBy: row.payer, // Map payer column to paidBy field
      participants: row.participants,
      date: new Date(row.date),
      createdAt: new Date(row.created_at),
    }))
  }

  async getExpense(id: string): Promise<Expense | null> {
    const { data, error } = await this.supabase.from("expenses").select("*").eq("id", id).single()

    if (error || !data) return null

    return {
      id: data.id,
      groupId: data.group_id,
      amount: data.amount,
      description: data.description,
      paidBy: data.payer, // Map payer column to paidBy field
      participants: data.participants,
      date: new Date(data.date),
      createdAt: new Date(data.created_at),
    }
  }

  async deleteExpense(id: string): Promise<void> {
    const { error } = await this.supabase.from("expenses").delete().eq("id", id)

    if (error) throw error
  }

  async updateExpense(id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>): Promise<Expense> {
    const updateData: any = {}
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.paidBy !== undefined) updateData.payer = updates.paidBy // Map paidBy field to payer column
    if (updates.participants !== undefined) updateData.participants = updates.participants
    if (updates.date !== undefined) updateData.date = updates.date.toISOString()

    const { data, error } = await this.supabase.from("expenses").update(updateData).eq("id", id).select().single()

    if (error) throw error

    return {
      id: data.id,
      groupId: data.group_id,
      amount: data.amount,
      description: data.description,
      paidBy: data.payer, // Map payer column to paidBy field
      participants: data.participants,
      date: new Date(data.date),
      createdAt: new Date(data.created_at),
    }
  }
}
