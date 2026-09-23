"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MemberDot } from "@/components/member-dot"
import { formatMoney } from "@/lib/format"
import type { Debt } from "@/core/entities/Balance"
import type { Payment } from "@/core/entities/Payment"
import { PaymentHistoryDialog } from "./payment-history-dialog"
import { useEffect, useState } from "react"
import { PartyPopper, Share2 } from "lucide-react"
import { CelebrationConfetti } from "@/components/celebration-confetti"
import { getPaymentService } from "@/lib/services"
import { shareSettlement, formatLongDate } from "@/lib/share-settlement"
import { useToast } from "@/hooks/use-toast"

interface DebtSettlementProps {
  debts: Debt[]
  groupId: string
  groupName: string
  /** True when the whole group is even (not just the filtered view). */
  groupSettled: boolean
  /** True when the group has debts, even if the search hides all of them. */
  hasDebts: boolean
  payments: Payment[]
  userMemberName?: string | null
  onPaymentsRegistered: () => void
}

// The milestone is celebrated once per group. When the group stops being
// settled — a new expense, an invalidated payment — the flag clears, so the
// next time it reaches zero it earns its own party.
function celebrationStorageKey(groupId: string): string {
  return `split-ease:celebrated:${groupId}`
}

export function DebtSettlement({
  debts,
  groupId,
  groupName,
  groupSettled,
  hasDebts,
  payments,
  userMemberName,
  onPaymentsRegistered,
}: DebtSettlementProps) {
  const [selectedDebts, setSelectedDebts] = useState<Set<number>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const key = celebrationStorageKey(groupId)

    if (!groupSettled) {
      setCelebrate(false)
      try {
        localStorage.removeItem(key)
      } catch {
        // Storage disabled (private mode): nothing to remember.
      }
      return
    }

    let alreadyCelebrated = false
    try {
      alreadyCelebrated = localStorage.getItem(key) === "1"
    } catch {
      alreadyCelebrated = false
    }

    if (!alreadyCelebrated) {
      setCelebrate(true)
      try {
        localStorage.setItem(key, "1")
      } catch {
        // Worst case the party repeats, which is harmless.
      }
    }
  }, [groupId, groupSettled])

  const handleShareSettlement = async () => {
    setSharing(true)
    try {
      const outcome = await shareSettlement({ groupName, date: new Date() })

      if (outcome === "copied") {
        toast({ title: "Mensaje copiado", description: "Pégalo en el grupo de WhatsApp." })
      } else if (outcome === "unavailable") {
        toast({
          title: "No se pudo compartir",
          description: "Tu navegador no ofrece compartir. Prueba desde el móvil.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sharing settlement:", error)
      toast({
        title: "No se pudo compartir",
        description: "Inténtalo de nuevo en unos segundos.",
        variant: "destructive",
      })
    } finally {
      setSharing(false)
    }
  }

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
    if (groupSettled) {
      return (
        <>
          {celebrate && <CelebrationConfetti />}

          <div className="celebration-pop rounded-2xl border border-rule bg-surface px-6 py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-credit-tint">
              <PartyPopper className="h-8 w-8 text-credit" />
            </div>
            <p className="mt-4 text-xl font-bold">¡Misión cumplida! 🏆</p>
            <p className="mt-1 text-sm text-ink-2">«{groupName}» está al día.</p>
            <p className="mt-3 text-sm text-ink-2">
              No hay deudas pendientes entre los miembros.
            </p>
            <p className="mt-2 text-xs text-ink-2">Estado final: {formatLongDate(new Date())}.</p>

            <Button
              className="mt-6 h-12 w-full text-base font-bold"
              size="lg"
              onClick={handleShareSettlement}
              disabled={sharing}
            >
              <Share2 className="mr-2 h-5 w-5" />
              {sharing ? "Preparando..." : "Enviar al grupo"}
            </Button>
            <p className="mt-2 text-xs text-ink-2">
              Se abrirá tu app para que elijas a quién enviarlo.
            </p>

            {payments.length > 0 && (
              <div className="flex justify-center pt-4">
                <PaymentHistoryDialog payments={payments} onPaymentDeleted={onPaymentsRegistered} />
              </div>
            )}
          </div>
        </>
      )
    }

    if (hasDebts) {
      return (
        <div className="py-10 text-center">
          <p className="text-lg font-bold">No hay deudas que coincidan</p>
          <p className="mt-1 text-sm text-ink-2">Prueba con otra búsqueda.</p>
        </div>
      )
    }

    return (
      <div className="py-10 text-center">
        <p className="text-lg font-bold">Aún no hay nada que saldar</p>
        <p className="mt-1 text-sm text-ink-2">
          Cuando añadáis gastos, aquí verás quién paga a quién.
        </p>
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
