"use client"

import { Button } from "@/components/ui/button"
import { MemberDot } from "@/components/member-dot"
import { formatMoney } from "@/lib/format"
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
      <div className="py-10 text-center">
        <p className="font-medium">No hay gastos registrados aún</p>
        <p className="mt-1 text-sm text-ink-2">Añade el primer gasto del grupo para empezar.</p>
      </div>
    )
  }

  const groupedExpenses = groupExpensesByDate(expenses)

  return (
    <div className="space-y-6">
      {groupedExpenses.map(([dateKey, dateExpenses]) => (
        <section key={dateKey}>
          <h2 className="mb-1 text-xs font-semibold text-ink-2">
            {formatDateHeader(dateKey)}
          </h2>

          <ul className="divide-y divide-rule">
            {dateExpenses.map((expense) => {
              const payer = getMemberName(expense.paidBy)

              return (
                <li key={expense.id} className="flex items-center gap-3 py-4">
                  <MemberDot name={payer} className="size-3" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate font-medium">{expense.description}</h3>
                      {expense.imageUrl && (
                        <ImageIcon className="h-4 w-4 flex-shrink-0 text-ink-2" />
                      )}
                    </div>
                    <p className="truncate text-sm text-ink-2">
                      Pagó {payer} · {getParticipantText(expense.participants)}
                    </p>
                  </div>

                  <p className="tabular-nums flex-shrink-0 font-bold">
                    {formatMoney(expense.amount)}
                  </p>

                  <div className="flex flex-shrink-0 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${expense.description}`}
                      onClick={() => onExpenseEdit(expense)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 text-ink-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Eliminar ${expense.description}`}
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === expense.id}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-ink-2" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
