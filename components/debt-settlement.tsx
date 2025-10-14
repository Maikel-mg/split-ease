"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2 } from "lucide-react"
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
  onPaymentsRegistered: () => void
}

export function DebtSettlement({ debts, groupId, payments, onPaymentsRegistered }: DebtSettlementProps) {
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

      // Clear selection after saving
      setSelectedDebts(new Set())

      // Notify parent to refresh data
      onPaymentsRegistered()
    } catch (error) {
      console.error("[v0] Error registering payments:", error)
      toast({
        title: "Error",
        description: "No se pudieron registrar los pagos",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (debts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
          <p className="text-muted-foreground">No hay deudas pendientes</p>
          <p className="text-sm text-muted-foreground">Todos los gastos están equilibrados</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {debts.map((debt, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedDebts.has(index)}
                  onCheckedChange={() => toggleDebt(index)}
                  className="flex-shrink-0"
                  disabled={isSaving}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    De <span className="font-bold">{debt.from}</span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    Para <span className="font-medium">{debt.to}</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-foreground flex-shrink-0">{debt.amount.toFixed(2)}€</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button className="w-full" size="lg" disabled={selectedDebts.size === 0 || isSaving} onClick={handleSavePayments}>
        {isSaving ? "Guardando..." : "Guardar pagos"}
      </Button>

      {payments.length > 0 && (
        <div className="flex justify-center pt-2">
          <PaymentHistoryDialog payments={payments} onPaymentDeleted={onPaymentsRegistered} />
        </div>
      )}
    </div>
  )
}
