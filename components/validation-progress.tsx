"use client"

import { CheckCircle2, Clock } from "lucide-react"
import type { GroupValidationState } from "@/core/entities/Validation"

interface ValidationProgressProps {
  state: GroupValidationState
}

// Count only. Names never go in the header: a group of fifteen would break it.
export function ValidationProgress({ state }: ValidationProgressProps) {
  if (!state.hasExpenses) return null

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        state.isComplete
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-amber-500/30 bg-amber-500/10 text-amber-600"
      }`}
      title={state.isComplete ? "Todos han validado" : "Todavía faltan miembros por validar"}
    >
      {state.isComplete ? (
        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
      ) : (
        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
      )}
      <span>
        Validación {state.validatedCount}/{state.totalEligible}
      </span>
    </div>
  )
}
