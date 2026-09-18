"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MemberExpensesDialog } from "@/components/member-expenses-dialog"
import { AlertCircle, CheckCircle2, Loader2, RotateCcw } from "lucide-react"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"
import type { Payment } from "@/core/entities/Payment"
import type { Balance, Debt } from "@/core/entities/Balance"
import type { GroupValidationState } from "@/core/entities/Validation"

interface MyStatusTabProps {
  group: Group
  expenses: Expense[]
  payments: Payment[]
  balances: Balance[]
  debts: Debt[]
  validationState: GroupValidationState
  myValidation: boolean
  userMemberName: string | null
  saving: boolean
  error: string | null
  onValidate: () => void
  onRetire: () => void
}

export function MyStatusTab({
  group,
  expenses,
  payments,
  balances,
  debts,
  validationState,
  myValidation,
  userMemberName,
  saving,
  error,
  onValidate,
  onRetire,
}: MyStatusTabProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  const member = userMemberName ? group.members.find((m) => m.name === userMemberName) : undefined

  if (!member) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          No sabemos quién eres en este grupo. Abre el enlace de invitación del grupo para identificarte.
        </CardContent>
      </Card>
    )
  }

  const netBalance = balances.find((b) => b.memberName === member.name)?.netBalance ?? 0
  const iOwe = debts.filter((debt) => debt.from === member.name)
  const owedToMe = debts.filter((debt) => debt.to === member.name)
  const canValidate = validationState.eligibleMemberIds.includes(member.id)
  const isStale = validationState.staleMemberIds.includes(member.id)

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Tu saldo</p>
            <p
              className={`text-2xl font-bold ${
                netBalance > 0.01 ? "text-primary" : netBalance < -0.01 ? "text-destructive" : ""
              }`}
            >
              {netBalance > 0.01 ? `+${netBalance.toFixed(2)}€` : `${netBalance.toFixed(2)}€`}
            </p>
            <p className="text-xs text-muted-foreground">
              {netBalance > 0.01
                ? "Te tienen que pagar"
                : netBalance < -0.01
                  ? "Tienes que pagar"
                  : "Estás al día"}
            </p>
          </div>

          {iOwe.length > 0 && (
            <div className="space-y-1 pt-3 border-t">
              <p className="text-xs font-medium text-muted-foreground">Tienes que pagar a</p>
              {iOwe.map((debt, index) => (
                <div key={`${debt.to}-${index}`} className="flex justify-between gap-2 text-sm">
                  <span className="truncate">{debt.to}</span>
                  <span className="font-semibold whitespace-nowrap">{debt.amount.toFixed(2)}€</span>
                </div>
              ))}
            </div>
          )}

          {owedToMe.length > 0 && (
            <div className="space-y-1 pt-3 border-t">
              <p className="text-xs font-medium text-muted-foreground">Te tienen que pagar</p>
              {owedToMe.map((debt, index) => (
                <div key={`${debt.from}-${index}`} className="flex justify-between gap-2 text-sm">
                  <span className="truncate">{debt.from}</span>
                  <span className="font-semibold text-primary whitespace-nowrap">
                    {debt.amount.toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={() => setDetailsOpen(true)}>
            Ver mis gastos y pagos
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          {validationState.hasExpenses ? (
            canValidate ? (
              <>
                {myValidation ? (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>Has validado tus gastos y pagos</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isStale
                      ? "Validaste, pero ha cambiado algo desde entonces. Revísalo y vuelve a validar."
                      : "Revisa que tus gastos y pagos sean correctos. Nadie debería pagar hasta que todo el grupo haya validado."}
                  </p>
                )}

                {myValidation ? (
                  <Button variant="outline" className="w-full" onClick={onRetire} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Retirar la validación
                  </Button>
                ) : (
                  <Button className="w-full" onClick={onValidate} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    He revisado mis gastos y pagos
                  </Button>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No participas en ningún gasto de este grupo, así que no hay nada que validar.
              </p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">Todavía no hay gastos que validar.</p>
          )}

          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <MemberExpensesDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        memberName={member.name}
        memberId={member.id}
        expenses={expenses}
        payments={payments}
        group={group}
      />
    </div>
  )
}
