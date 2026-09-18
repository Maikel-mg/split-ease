"use client"

import { AlertTriangle } from "lucide-react"

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
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
      <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
      <div className="space-y-1">
        <p className="font-medium text-amber-700">Ya hay pagos registrados</p>
        <p className="text-amber-700/90">
          Todavía no han validado todos ({validatedCount}/{totalEligible}). Si alguien cambia un
          gasto ahora, el plan de pagos cambiará y puede que alguno ya haya hecho su Bizum: habría
          que rechazarlo y volver a empezar.
        </p>
      </div>
    </div>
  )
}
