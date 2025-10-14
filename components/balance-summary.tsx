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
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold px-1 mb-4">Balances</h2>

          <Card>
            <CardContent className="p-4 space-y-3">
              {balances.map((balance) => (
                <div
                  key={balance.memberId}
                  onClick={() => setSelectedMember({ id: balance.memberId, name: balance.memberName })}
                  className="flex items-center gap-3 py-2 cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base">{balance.memberName}</p>
                    <p
                      className={`text-sm font-medium ${
                        balance.netBalance > 0.01
                          ? "text-primary"
                          : balance.netBalance < -0.01
                            ? "text-destructive"
                            : "text-muted-foreground"
                      }`}
                    >
                      {balance.netBalance > 0.01
                        ? `Le deben ${balance.netBalance.toFixed(2)}€`
                        : balance.netBalance < -0.01
                          ? `Debe ${Math.abs(balance.netBalance).toFixed(2)}€`
                          : "Equilibrado"}
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
