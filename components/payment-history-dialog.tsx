"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
        title: "Error",
        description: "No se pudo cancelar el pago",
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
        <Button variant="link" className="text-xs text-muted-foreground h-auto p-0">
          Ver historial de pagos ({payments.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de Pagos</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay pagos registrados</p>
          ) : (
            payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        De <span className="font-bold">{payment.from}</span> → Para{" "}
                        <span className="font-bold">{payment.to}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{formatDate(payment.registeredAt)}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold">{payment.amount.toFixed(2)}€</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeletePayment(payment.id)}
                        disabled={deletingId === payment.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
