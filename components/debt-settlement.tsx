"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MemberDot } from "@/components/member-dot"
import { formatMoney } from "@/lib/format"
import type { Debt } from "@/core/entities/Balance"
import type { Payment } from "@/core/entities/Payment"
import { PaymentHistoryDialog } from "./payment-history-dialog"
import { useState } from "react"
import { getPaymentService } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

interface DebtSettlementProps {
  debts: Debt[]
  groupId: string
  payments: Payment[]
  userMemberName?: string | null
  onPaymentsRegistered: () => void
}

export function DebtSettlement({
  debts,
  groupId,
  payments,
  userMemberName,
  onPaymentsRegistered,
}: DebtSettlementProps) {
  const [selectedDebts, setSelectedDebts] = useState<Set<number>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const toggleDebt = (index: number) => {
    const newSelected = new Set(selectedDebts)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedDebts(newSelected)
  }

  // The colour repeats the balance rule: red what you pay, green what you receive,
  // ink everything that is between other people.
  const amountClass = (debt: Debt) => {
    if (!userMemberName) return "text-ink"
    if (debt.from === userMemberName) return "text-debit"
    if (debt.to === userMemberName) return "text-credit"
    return "text-ink"
  }

  const handleSavePayments = async () => {
    if (selectedDebts.size === 0) return

    setIsSaving(true)
    try {
      const paymentService = getPaymentService()

      const selectedDebtsArray = Array.from(selectedDebts).map((index) => debts[index])

      for (const debt of selectedDebtsArray) {
        await paymentService.registerPayment(groupId, debt.from, debt.to, debt.amount)
      }

      toast({
        title: "Pagos registrados",
        description: `Se ${selectedDebts.size === 1 ? "ha registrado 1 pago" : `han registrado ${selectedDebts.size} pagos`} correctamente`,
      })

      setSelectedDebts(new Set())
      onPaymentsRegistered()
    } catch (error) {
      console.error("[v0] Error registering payments:", error)
      toast({
        title: "No se pudieron registrar los pagos",
        description: "Inténtalo de nuevo en unos segundos.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (debts.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-lg font-bold">No hay deudas pendientes</p>
        <p className="mt-1 text-sm text-ink-2">Todos los saldos están a cero.</p>
      </div>
    )
  }

  const count = selectedDebts.size

  return (
    <div>
      <p className="text-sm text-ink-2">
        {debts.length === 1 ? "Saldar con un pago" : `Saldar con ${debts.length} pagos`}
      </p>

      <ul className="mt-3 divide-y divide-rule">
        {debts.map((debt, index) => (
          <li key={index}>
            <div
              onClick={() => !isSaving && toggleDebt(index)}
              className="flex cursor-pointer items-center gap-3 py-4"
            >
              <Checkbox
                checked={selectedDebts.has(index)}
                onCheckedChange={() => toggleDebt(index)}
                disabled={isSaving}
                className="pointer-events-none flex-shrink-0"
                aria-label={`Saldar ${formatMoney(debt.amount)} de ${debt.from} a ${debt.to}`}
              />
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <MemberDot name={debt.from} />
                <span className="truncate">{debt.from}</span>
                <span aria-hidden="true" className="px-0.5 text-ink-2">
                  →
                </span>
                <MemberDot name={debt.to} />
                <span className="truncate">{debt.to}</span>
              </div>
              <span className={`tabular-nums text-lg font-bold flex-shrink-0 ${amountClass(debt)}`}>
                {formatMoney(debt.amount)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <Button
        className="mt-6 h-12 w-full text-base font-bold"
        size="lg"
        disabled={count === 0 || isSaving}
        onClick={handleSavePayments}
      >
        {isSaving
          ? "Registrando..."
          : count === 0
            ? "Registrar pagos"
            : count === 1
              ? "Registrar 1 pago"
              : `Registrar ${count} pagos`}
      </Button>

      {payments.length > 0 && (
        <div className="flex justify-center pt-4">
          <PaymentHistoryDialog payments={payments} onPaymentDeleted={onPaymentsRegistered} />
        </div>
      )}
    </div>
  )
}
