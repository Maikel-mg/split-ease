import type { ExpenseRepository } from "@/core/ports/ExpenseRepository"
import type { Expense } from "@/core/entities/Expense"
import type { SupabaseClient } from "@supabase/supabase-js"

export class SupabaseExpenseRepository implements ExpenseRepository {
  constructor(private supabase: SupabaseClient) {}

  async createExpense(expense: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
    //const {
    //  data: { user },
    //} = await this.supabase.auth.getUser()
    //if (!user) throw new Error("Usuario no autenticado")

    const { data, error } = await this.supabase
      .from("expenses")
      .insert({
        group_id: expense.groupId,
        amount: expense.amount,
        description: expense.description,
        payer: expense.paidBy,
        participants: expense.participants,
        date: expense.date.toISOString(),
        image_url: expense.imageUrl || null,
        split_mode: expense.splitMode,
        split_data: expense.splitData || null,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      groupId: data.group_id,
      amount: data.amount,
      description: data.description,
      paidBy: data.payer,
      participants: data.participants,
      date: new Date(data.date),
      imageUrl: data.image_url,
      splitMode: data.split_mode || "equally",
      splitData: data.split_data || undefined,
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
      paidBy: row.payer,
      participants: row.participants,
      date: new Date(row.date),
      imageUrl: row.image_url,
      splitMode: row.split_mode || "equally",
      splitData: row.split_data || undefined,
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
      paidBy: data.payer,
      participants: data.participants,
      date: new Date(data.date),
      imageUrl: data.image_url,
      splitMode: data.split_mode || "equally",
      splitData: data.split_data || undefined,
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
    if (updates.paidBy !== undefined) updateData.payer = updates.paidBy
    if (updates.participants !== undefined) updateData.participants = updates.participants
    if (updates.date !== undefined) updateData.date = updates.date.toISOString()
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl
    if (updates.splitMode !== undefined) updateData.split_mode = updates.splitMode
    if (updates.splitData !== undefined) updateData.split_data = updates.splitData

    const { data, error } = await this.supabase.from("expenses").update(updateData).eq("id", id).select().single()

    if (error) throw error

    return {
      id: data.id,
      groupId: data.group_id,
      amount: data.amount,
      description: data.description,
      paidBy: data.payer,
      participants: data.participants,
      date: new Date(data.date),
      imageUrl: data.image_url,
      splitMode: data.split_mode || "equally",
      splitData: data.split_data || undefined,
      createdAt: new Date(data.created_at),
    }
  }
}
