"use client"

import { AlertTriangle, HelpCircle } from "lucide-react"
import { requestTour } from "@/lib/tour/tour-runtime"

interface DanglingPaymentsBannerProps {
  validatedCount: number
  totalEligible: number
}

// Shown while there are registered payments and validation is not complete. The
// app cannot undo a Bizum, so this only makes the risk visible — and it has to
// stay small: it shares the screen with the user's own balance.
export function DanglingPaymentsBanner({
  validatedCount,
  totalEligible,
}: DanglingPaymentsBannerProps) {
  return (
    <div
      data-tour="payments-banner"
      className="flex items-start gap-2 rounded-lg bg-warning-surface px-3 py-2 text-sm text-warning"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p>
        Ya hay pagos registrados y faltan validaciones ({validatedCount}/{totalEligible}). Si
        cambia un gasto, algún Bizum ya hecho puede quedar sin efecto.{" "}
        <button
          type="button"
          onClick={() => requestTour("validation")}
          className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          ¿Cómo funciona?
        </button>
      </p>
    </div>
  )
}
