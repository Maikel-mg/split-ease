"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import type { Expense } from "@/core/entities/Expense"
import type { Payment } from "@/core/entities/Payment"
import type { Group } from "@/core/entities/Group"

interface MemberExpensesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberName: string
  memberId: string
  expenses: Expense[]
  payments: Payment[]
  group: Group
}

export function MemberExpensesDialog({
  open,
  onOpenChange,
  memberName,
  memberId,
  expenses,
  payments,
  group,
}: MemberExpensesDialogProps) {
  // Filter expenses where the member participated
  const memberExpenses = expenses.filter((expense) => expense.participants.includes(memberId))

  const paymentsMade = payments.filter((payment) => payment.from === memberName)
  const paymentsReceived = payments.filter((payment) => payment.to === memberName)

  // Calculate totals
  let totalPaid = 0
  let totalOwed = 0

  memberExpenses.forEach((expense) => {
    const shareAmount = expense.amount / expense.participants.length

    if (expense.paidBy === memberId) {
      totalPaid += expense.amount
    }

    if (expense.participants.includes(memberId)) {
      totalOwed += shareAmount
    }
  })

  paymentsMade.forEach((payment) => {
    totalPaid += payment.amount
  })

  paymentsReceived.forEach((payment) => {
    totalOwed += payment.amount
  })

  const netBalance = totalPaid - totalOwed

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transacciones de {memberName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total pagado:</span>
                <span className="font-semibold">{totalPaid.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total debe:</span>
                <span className="font-semibold">{totalOwed.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-medium">Balance:</span>
                <span
                  className={`font-bold ${
                    netBalance > 0.01
                      ? "text-primary"
                      : netBalance < -0.01
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {netBalance > 0.01
                    ? `+${netBalance.toFixed(2)}€`
                    : netBalance < -0.01
                      ? `${netBalance.toFixed(2)}€`
                      : "0.00€"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Expense list */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Gastos ({memberExpenses.length})</h3>

            {memberExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay gastos para mostrar</p>
            ) : (
              memberExpenses.map((expense) => {
                const shareAmount = expense.amount / expense.participants.length
                const isPayer = expense.paidBy === memberId
                const payerName = group.members.find((m) => m.id === expense.paidBy)?.name || "Desconocido"

                return (
                  <Card key={expense.id}>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-semibold text-sm">{expense.amount.toFixed(2)}€</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-2 border-t">
                        <span className="text-muted-foreground">
                          Pagado por: <span className="font-medium">{payerName}</span>
                        </span>
                        <span className={`font-semibold ${isPayer ? "text-primary" : "text-destructive"}`}>
                          {isPayer ? `Pagó ${expense.amount.toFixed(2)}€` : `Debe ${shareAmount.toFixed(2)}€`}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Dividido entre {expense.participants.length}{" "}
                        {expense.participants.length === 1 ? "persona" : "personas"}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {paymentsMade.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Pagos realizados ({paymentsMade.length})</h3>

              {paymentsMade.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">{payment.from}</span>
                        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{payment.to}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary ml-2">{payment.amount.toFixed(2)}€</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(payment.date).toLocaleDateString("es-ES")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {paymentsReceived.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">
                Pagos recibidos ({paymentsReceived.length})
              </h3>

              {paymentsReceived.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">{payment.from}</span>
                        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{payment.to}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary ml-2">{payment.amount.toFixed(2)}€</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(payment.date).toLocaleDateString("es-ES")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
