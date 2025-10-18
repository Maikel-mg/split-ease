"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"
import { MemberExpensesDialog } from "@/components/member-expenses-dialog"
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
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No hay balances para mostrar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-1">
        <div>
          <Card>
            <CardContent className="p-2">
              {balances.map((balance) => (
                <div
                  key={balance.memberId}
                  onClick={() => setSelectedMember({ id: balance.memberId, name: balance.memberName })}
                  className="flex items-center gap-2 py-1.5 px-1 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base">{balance.memberName}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-lg font-semibold ${
                        balance.netBalance > 0.01
                          ? "text-green-500"
                          : balance.netBalance < -0.01
                            ? "text-red-500"
                            : "text-muted-foreground"
                      }`}
                    >
                      {balance.netBalance > 0.01
                        ? `+${balance.netBalance.toFixed(2)} €`
                        : balance.netBalance < -0.01
                          ? `-${Math.abs(balance.netBalance).toFixed(2)} €`
                          : "0,00 €"}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-center mt-2">Toca un miembro para ver sus gastos</p>
        </div>
      </div>

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
