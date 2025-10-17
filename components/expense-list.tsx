"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil } from "lucide-react"
import type { Expense } from "@/core/entities/Expense"
import type { Group } from "@/core/entities/Group"
import { getExpenseService } from "@/lib/services"
import { deleteExpenseImage } from "@/lib/upload-image"
import { useState } from "react"

interface ExpenseListProps {
  group: Group
  expenses: Expense[]
  onExpenseDeleted: () => void
  onExpenseEdit: (expense: Expense) => void
}

export function ExpenseList({ group, expenses, onExpenseDeleted, onExpenseEdit }: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const getMemberName = (memberId: string) => {
    return group.members.find((m) => m.id === memberId)?.name || "Desconocido"
  }

  const handleDelete = async (expenseId: string) => {
    if (!confirm("¿Estás seguro de eliminar este gasto?")) return

    setDeletingId(expenseId)
    try {
      const expense = expenses.find((e) => e.id === expenseId)
      if (expense?.imageUrl) {
        await deleteExpenseImage(expense.imageUrl)
      }

      const expenseService = getExpenseService()
      await expenseService.deleteExpense(expenseId)
      onExpenseDeleted()
    } catch (error) {
      console.error("Error deleting expense:", error)
    } finally {
      setDeletingId(null)
    }
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No hay gastos registrados aún</p>
          <p className="text-sm text-muted-foreground mt-1">Agrega tu primer gasto para comenzar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="p-4">
            {expense.imageUrl && (
              <img
                src={expense.imageUrl || "/placeholder.svg"}
                alt={expense.description}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            )}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-1">{expense.description}</h3>
                <p className="text-sm text-muted-foreground mb-2">Pagado por: {getMemberName(expense.paidBy)}</p>
                <p className="text-xs text-muted-foreground">
                  Participantes: {expense.participants.map((id) => getMemberName(id)).join(", ")}
                </p>
              </div>
              <div className="flex items-start gap-2 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xl font-bold">{expense.amount.toFixed(2)}€</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onExpenseEdit(expense)} className="h-8 w-8">
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                {new Date(expense.date).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
