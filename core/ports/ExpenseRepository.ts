// Port: Repository interface for Expenses
import type { Expense } from "../entities/Expense"

export interface ExpenseRepository {
  createExpense(expense: Omit<Expense, "id" | "createdAt">): Promise<Expense>
  getExpensesByGroup(groupId: string): Promise<Expense[]>
  getExpense(id: string): Promise<Expense | null>
  updateExpense(id: string, expense: Partial<Omit<Expense, "id" | "createdAt">>): Promise<Expense>
  deleteExpense(id: string): Promise<void>
}
