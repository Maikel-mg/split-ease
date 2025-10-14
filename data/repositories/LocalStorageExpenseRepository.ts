// Adapter: LocalStorage implementation of ExpenseRepository
import type { ExpenseRepository } from "@/core/ports/ExpenseRepository"
import type { Expense } from "@/core/entities/Expense"

export class LocalStorageExpenseRepository implements ExpenseRepository {
  private readonly STORAGE_KEY = "expense-expenses"

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getExpenses(): Expense[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(this.STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private saveExpenses(expenses: Expense[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(expenses))
  }

  async createExpense(expense: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
    const expenses = this.getExpenses()

    const newExpense: Expense = {
      ...expense,
      id: this.generateId(),
      createdAt: new Date(),
    }

    expenses.push(newExpense)
    this.saveExpenses(expenses)
    return newExpense
  }

  async getExpensesByGroup(groupId: string): Promise<Expense[]> {
    const expenses = this.getExpenses()
    return expenses.filter((e) => e.groupId === groupId)
  }

  async getExpense(id: string): Promise<Expense | null> {
    const expenses = this.getExpenses()
    return expenses.find((e) => e.id === id) || null
  }

  async deleteExpense(id: string): Promise<void> {
    const expenses = this.getExpenses()
    const filtered = expenses.filter((e) => e.id !== id)
    this.saveExpenses(filtered)
  }

  async updateExpense(id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>): Promise<Expense> {
    const expenses = this.getExpenses()
    const index = expenses.findIndex((e) => e.id === id)

    if (index === -1) {
      throw new Error("Gasto no encontrado")
    }

    const updatedExpense: Expense = {
      ...expenses[index],
      ...updates,
    }

    expenses[index] = updatedExpense
    this.saveExpenses(expenses)
    return updatedExpense
  }
}
