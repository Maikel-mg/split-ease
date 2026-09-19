"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MemberDot } from "@/components/member-dot"
import { MemberExpensesDialog } from "@/components/member-expenses-dialog"
import { InfoHint } from "@/components/info-hint"
import { formatMoney } from "@/lib/format"
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
      <p className="py-6 text-sm text-ink-2">
        No sabemos quién eres en este grupo. Abre el enlace de invitación del grupo para
        identificarte.
      </p>
    )
  }

  const iOwe = debts.filter((debt) => debt.from === member.name)
  const owedToMe = debts.filter((debt) => debt.to === member.name)
  const canValidate = validationState.eligibleMemberIds.includes(member.id)
  const isStale = validationState.staleMemberIds.includes(member.id)

  const netBalance = balances.find((b) => b.memberName === member.name)?.netBalance ?? 0
  const credit = netBalance > 0.01
  const debit = netBalance < -0.01

  return (
    <div className="space-y-8">
      <section
        className={`rounded-2xl px-5 py-5 ${
          credit ? "bg-credit-tint" : debit ? "bg-debit-tint" : "bg-muted"
        }`}
      >
        <p className="text-sm font-medium text-ink-2">
          {credit ? "Te deben" : debit ? "Debes" : "Estás al día"}
        </p>
        <p
          className={`text-4xl font-bold tracking-tight tabular-nums ${
            credit ? "text-credit" : debit ? "text-debit" : "text-ink-2"
          }`}
        >
          {formatMoney(Math.abs(netBalance))}
        </p>
      </section>

      <section className="space-y-4">
        {iOwe.length > 0 && (
          <div>
            <p className="text-sm font-medium text-ink-2">Tienes que pagar a</p>
            <ul className="mt-1 divide-y divide-rule">
              {iOwe.map((debt, index) => (
                <li key={`${debt.to}-${index}`} className="flex items-center gap-3 py-3">
                  <MemberDot name={debt.to} />
                  <span className="flex-1 truncate">{debt.to}</span>
                  <span className="tabular-nums font-bold text-debit">
                    {formatMoney(debt.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {owedToMe.length > 0 && (
          <div>
            <p className="text-sm font-medium text-ink-2">Te tienen que pagar</p>
            <ul className="mt-1 divide-y divide-rule">
              {owedToMe.map((debt, index) => (
                <li key={`${debt.from}-${index}`} className="flex items-center gap-3 py-3">
                  <MemberDot name={debt.from} />
                  <span className="flex-1 truncate">{debt.from}</span>
                  <span className="tabular-nums font-bold text-credit">
                    {formatMoney(debt.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {iOwe.length === 0 && owedToMe.length === 0 && (
          <p className="text-ink-2">No tienes pagos pendientes en este grupo.</p>
        )}

        <Button variant="outline" className="w-full" onClick={() => setDetailsOpen(true)}>
          Ver mis gastos y pagos
        </Button>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-bold">Validación</h2>
          <InfoHint label="Qué es la validación">
            Antes de pagar, cada persona revisa y confirma que sus gastos y pagos son correctos.
            Nadie debería pagar hasta que todos hayan validado.
          </InfoHint>
        </div>

        {validationState.hasExpenses ? (
          canValidate ? (
            <>
              {myValidation ? (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>Has validado tus gastos y pagos.</span>
                </div>
              ) : (
                <p className="text-sm text-ink-2">
                  {isStale
                    ? "Validaste, pero ha cambiado algo desde entonces. Revísalo y vuelve a validar."
                    : "Revisa que tus gastos y pagos sean correctos. Nadie debería pagar hasta que todo el grupo haya validado."}
                </p>
              )}

              {myValidation ? (
                <Button
                  data-tour="validate-action"
                  variant="outline"
                  className="w-full"
                  onClick={onRetire}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Retirar la validación
                </Button>
              ) : (
                <Button
                  data-tour="validate-action"
                  className="h-12 w-full text-base font-bold"
                  onClick={onValidate}
                  disabled={saving}
                >
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  He revisado mis gastos y pagos
                </Button>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-2">
              No participas en ningún gasto de este grupo, así que no hay nada que validar.
            </p>
          )
        ) : (
          <p className="text-sm text-ink-2">Todavía no hay gastos que validar.</p>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-debit">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

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
