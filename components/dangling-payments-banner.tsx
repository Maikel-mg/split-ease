"use client"

import { AlertTriangle, HelpCircle } from "lucide-react"
import { requestTour } from "@/lib/tour/tour-runtime"

interface DanglingPaymentsBannerProps {
  validatedCount: number
  totalEligible: number
}

// Shown while there are registered payments and validation is not complete. The
// app cannot undo a Bizum, so this only makes the risk visible.
export function DanglingPaymentsBanner({
  validatedCount,
  totalEligible,
}: DanglingPaymentsBannerProps) {
  return (
    <div
      data-tour="payments-banner"
      className="flex items-start gap-2 rounded-lg bg-warning-surface p-3 text-sm"
    >
      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-warning" />
      <div className="space-y-1 text-warning">
        <p className="font-bold">Ya hay pagos registrados</p>
        <p>
          Todavía no han validado todos ({validatedCount}/{totalEligible}). Si alguien cambia un
          gasto ahora, el plan de pagos cambiará y puede que alguno ya haya hecho su Bizum: habría
          que rechazarlo y volver a empezar.
        </p>
        <button
          type="button"
          onClick={() => requestTour("validation")}
          className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          ¿Cómo funciona la validación?
        </button>
      </div>
    </div>
  )
}
