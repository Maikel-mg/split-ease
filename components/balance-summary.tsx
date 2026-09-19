"use client"

import { useState } from "react"
import { MemberDot } from "@/components/member-dot"
import { MemberExpensesDialog } from "@/components/member-expenses-dialog"
import { formatSignedMoney } from "@/lib/format"
import type { Balance } from "@/core/entities/Balance"
import type { Expense } from "@/core/entities/Expense"
import type { Payment } from "@/core/entities/Payment"
import type { Group } from "@/core/entities/Group"

interface BalanceSummaryProps {
  balances: Balance[]
  expenses: Expense[]
  payments: Payment[]
  group: Group
}

export function BalanceSummary({ balances, expenses, payments, group }: BalanceSummaryProps) {
  const [selectedMember, setSelectedMember] = useState<{
    id: string
    name: string
  } | null>(null)

  if (balances.length === 0) {
    return (
      <p className="py-8 text-ink-2">Aún no hay saldos: añade el primer gasto del grupo.</p>
    )
  }

  const ordered = [...balances].sort((a, b) => b.netBalance - a.netBalance)

  return (
    <>
      <ul className="divide-y divide-rule">
        {ordered.map((balance) => {
          const credit = balance.netBalance > 0.01
          const debit = balance.netBalance < -0.01

          return (
            <li key={balance.memberId}>
              <button
                type="button"
                onClick={() =>
                  setSelectedMember({ id: balance.memberId, name: balance.memberName })
                }
                className="flex w-full items-center gap-3 py-4 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MemberDot name={balance.memberName} />
                <span className="flex-1 truncate font-medium">{balance.memberName}</span>
                <span
                  className={`tabular-nums font-bold ${
                    credit ? "text-credit" : debit ? "text-debit" : "text-ink-2"
                  }`}
                >
                  {formatSignedMoney(balance.netBalance)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-3 text-xs text-ink-2">Toca un miembro para ver sus gastos.</p>

      {selectedMember && (
        <MemberExpensesDialog
          open={!!selectedMember}
          onOpenChange={(open) => !open && setSelectedMember(null)}
          memberName={selectedMember.name}
          memberId={selectedMember.id}
          expenses={expenses}
          payments={payments}
          group={group}
        />
      )}
    </>
  )
}
