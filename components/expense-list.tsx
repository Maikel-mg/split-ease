"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, ImageIcon } from "lucide-react"
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

  const getParticipantText = (participantIds: string[]) => {
    const participantCount = participantIds.length
    const totalMembers = group.members.length

    if (participantCount === totalMembers) {
      return "Todos"
    }

    return `${participantCount} ${participantCount === 1 ? "persona" : "personas"}`
  }

  const groupExpensesByDate = (expenses: Expense[]) => {
    const groups: { [key: string]: Expense[] } = {}

    expenses.forEach((expense) => {
      const dateKey = new Date(expense.date).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(expense)
    })

    return Object.entries(groups).sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
  }

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0)
    yesterday.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    if (date.getTime() === today.getTime()) {
      return "Hoy"
    } else if (date.getTime() === yesterday.getTime()) {
      return "Ayer"
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    }
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

  const groupedExpenses = groupExpensesByDate(expenses)

  return (
    <div className="space-y-3">
      {groupedExpenses.map(([dateKey, dateExpenses]) => (
        <div key={dateKey} className="space-y-1">
          <h2 className="text-sm font-semibold text-muted-foreground px-1 mb-1">{formatDateHeader(dateKey)}</h2>

          {dateExpenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-base">{expense.description}</h3>
                      {expense.imageUrl && <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Pagado por: {getMemberName(expense.paidBy)}</p>
                    <p className="text-xs text-muted-foreground">
                      Participantes: {getParticipantText(expense.participants)}
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
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}
