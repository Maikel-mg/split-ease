"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MemberDot } from "@/components/member-dot"
import { formatMoney, formatSignedMoney } from "@/lib/format"
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
  const calculateShareAmount = (expense: Expense, participantId: string): number => {
    if (expense.splitMode === "equally") {
      return expense.amount / expense.participants.length
    } else if (expense.splitMode === "shares" && expense.splitData) {
      const totalShares = expense.participants.reduce((sum, id) => sum + (expense.splitData?.[id] || 1), 0)
      const memberShares = expense.splitData[participantId] || 1
      return (expense.amount * memberShares) / totalShares
    } else if (expense.splitMode === "amounts" && expense.splitData) {
      return expense.splitData[participantId] || 0
    }
    return expense.amount / expense.participants.length
  }

  const memberExpenses = expenses.filter((expense) => expense.participants.includes(memberId))

  const paymentsMade = payments.filter((payment) => payment.from === memberName)
  const paymentsReceived = payments.filter((payment) => payment.to === memberName)

  let totalPaid = 0
  let totalOwed = 0

  memberExpenses.forEach((expense) => {
    if (expense.paidBy === memberId) {
      totalPaid += expense.amount
    }

    if (expense.participants.includes(memberId)) {
      totalOwed += calculateShareAmount(expense, memberId)
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
          <DialogTitle className="flex items-center gap-2">
            <MemberDot name={memberName} className="size-3" />
            {memberName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <dl className="space-y-2">
            <div className="flex justify-between text-sm">
              <dt className="text-ink-2">Total pagado</dt>
              <dd className="tabular-nums font-medium">{formatMoney(totalPaid)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-ink-2">Total debe</dt>
              <dd className="tabular-nums font-medium">{formatMoney(totalOwed)}</dd>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <dt className="text-sm font-medium">Balance</dt>
              <dd
                className={`tabular-nums font-bold ${
                  netBalance > 0.01
                    ? "text-credit"
                    : netBalance < -0.01
                      ? "text-debit"
                      : "text-ink-2"
                }`}
              >
                {formatSignedMoney(netBalance)}
              </dd>
            </div>
          </dl>

          <section>
            <h3 className="text-sm font-bold text-ink-2">Gastos ({memberExpenses.length})</h3>

            {memberExpenses.length === 0 ? (
              <p className="py-4 text-sm text-ink-2">No hay gastos para mostrar.</p>
            ) : (
              <ul className="mt-1 divide-y divide-rule">
                {memberExpenses.map((expense) => {
                  const shareAmount = calculateShareAmount(expense, memberId)
                  const isPayer = expense.paidBy === memberId
                  const payerName =
                    group.members.find((m) => m.id === expense.paidBy)?.name || "Desconocido"

                  return (
                    <li key={expense.id} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{expense.description}</p>
                          <p className="text-xs text-ink-2">
                            {new Date(expense.date).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                        <p className="tabular-nums flex-shrink-0 font-bold">
                          {formatMoney(expense.amount)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs">
                        <span className="text-ink-2">Pagó {payerName} · </span>
                        <span className={isPayer ? "text-credit" : "text-debit"}>
                          {isPayer
                            ? `Le corresponde ${formatMoney(shareAmount)}`
                            : `Debe ${formatMoney(shareAmount)}`}
                        </span>
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {paymentsMade.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-ink-2">Pagos realizados ({paymentsMade.length})</h3>
              <ul className="mt-1 divide-y divide-rule">
                {paymentsMade.map((payment) => (
                  <li key={payment.id} className="flex items-center gap-2 py-3">
                    <MemberDot name={payment.from} />
                    <span className="truncate text-sm">{payment.from}</span>
                    <span aria-hidden="true" className="text-ink-2">→</span>
                    <MemberDot name={payment.to} />
                    <span className="flex-1 truncate text-sm">{payment.to}</span>
                    <span className="tabular-nums flex-shrink-0 font-bold text-debit">
                      {formatMoney(payment.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {paymentsReceived.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-ink-2">
                Pagos recibidos ({paymentsReceived.length})
              </h3>
              <ul className="mt-1 divide-y divide-rule">
                {paymentsReceived.map((payment) => (
                  <li key={payment.id} className="flex items-center gap-2 py-3">
                    <MemberDot name={payment.from} />
                    <span className="truncate text-sm">{payment.from}</span>
                    <span aria-hidden="true" className="text-ink-2">→</span>
                    <MemberDot name={payment.to} />
                    <span className="flex-1 truncate text-sm">{payment.to}</span>
                    <span className="tabular-nums flex-shrink-0 font-bold text-credit">
                      {formatMoney(payment.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
