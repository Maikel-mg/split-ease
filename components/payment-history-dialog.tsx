"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MemberDot } from "@/components/member-dot"
import { formatMoney } from "@/lib/format"
import { Trash2 } from "lucide-react"
import type { Payment } from "@/core/entities/Payment"
import { useState } from "react"
import { getPaymentService } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

interface PaymentHistoryDialogProps {
  payments: Payment[]
  onPaymentDeleted: () => void
}

export function PaymentHistoryDialog({ payments, onPaymentDeleted }: PaymentHistoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDeletePayment = async (paymentId: string) => {
    setDeletingId(paymentId)
    try {
      const paymentService = getPaymentService()
      await paymentService.deletePayment(paymentId)

      toast({
        title: "Pago cancelado",
        description: "El pago ha sido eliminado del registro",
      })

      onPaymentDeleted()
    } catch (error) {
      console.error("[v0] Error deleting payment:", error)
      toast({
        title: "No se pudo cancelar el pago",
        description: "Inténtalo de nuevo en unos segundos.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="text-xs text-ink-2 h-auto p-0">
          Ver historial de pagos ({payments.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de pagos</DialogTitle>
        </DialogHeader>

        {payments.length === 0 ? (
          <p className="py-8 text-center text-ink-2">No hay pagos registrados.</p>
        ) : (
          <ul className="divide-y divide-rule">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-start gap-2 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <MemberDot name={payment.from} />
                    <span className="truncate">{payment.from}</span>
                    <span aria-hidden="true" className="text-ink-2">→</span>
                    <MemberDot name={payment.to} />
                    <span className="truncate">{payment.to}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-2">
                    {formatDate(payment.registeredAt)}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <span className="tabular-nums font-bold">{formatMoney(payment.amount)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Cancelar el pago de ${payment.from} a ${payment.to}`}
                    className="h-8 w-8"
                    onClick={() => handleDeletePayment(payment.id)}
                    disabled={deletingId === payment.id}
                  >
                    <Trash2 className="h-4 w-4 text-ink-2" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
