// Domain service: Expense management logic
import type { ExpenseRepository } from "@/core/ports/ExpenseRepository"
import type { Expense } from "@/core/entities/Expense"

export class ExpenseService {
  constructor(private expenseRepository: ExpenseRepository) {}

  async createExpense(
    groupId: string,
    amount: number,
    paidBy: string,
    description: string,
    participants: string[],
    date?: Date,
    imageUrl?: string,
    splitMode?: "equally" | "shares" | "amounts",
    splitData?: Record<string, number>,
  ): Promise<Expense> {
    if (amount <= 0) {
      throw new Error("El monto debe ser mayor a 0")
    }
    if (!paidBy) {
      throw new Error("Debe seleccionar quién pagó")
    }
    if (participants.length === 0) {
      throw new Error("Debe seleccionar al menos un participante")
    }
    if (!description.trim()) {
      throw new Error("La descripción es requerida")
    }

    return await this.expenseRepository.createExpense({
      groupId,
      amount,
      paidBy,
      description,
      date: date || new Date(),
      participants,
      imageUrl,
      splitMode: splitMode || "equally",
      splitData,
    })
  }

  async getExpensesByGroup(groupId: string): Promise<Expense[]> {
    return await this.expenseRepository.getExpensesByGroup(groupId)
  }

  async deleteExpense(id: string): Promise<void> {
    await this.expenseRepository.deleteExpense(id)
  }

  async updateExpense(
    id: string,
    amount?: number,
    paidBy?: string,
    description?: string,
    participants?: string[],
    date?: Date,
    imageUrl?: string,
    splitMode?: "equally" | "shares" | "amounts",
    splitData?: Record<string, number>,
  ): Promise<Expense> {
    if (amount !== undefined && amount <= 0) {
      throw new Error("El monto debe ser mayor a 0")
    }
    if (paidBy !== undefined && !paidBy) {
      throw new Error("Debe seleccionar quién pagó")
    }
    if (participants !== undefined && participants.length === 0) {
      throw new Error("Debe seleccionar al menos un participante")
    }
    if (description !== undefined && !description.trim()) {
      throw new Error("La descripción es requerida")
    }

    const updates: Partial<Omit<Expense, "id" | "createdAt">> = {}
    if (amount !== undefined) updates.amount = amount
    if (paidBy !== undefined) updates.paidBy = paidBy
    if (description !== undefined) updates.description = description
    if (participants !== undefined) updates.participants = participants
    if (date !== undefined) updates.date = date
    if (imageUrl !== undefined) updates.imageUrl = imageUrl
    if (splitMode !== undefined) updates.splitMode = splitMode
    if (splitData !== undefined) updates.splitData = splitData

    return await this.expenseRepository.updateExpense(id, updates)
  }
}
