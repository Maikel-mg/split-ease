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
      data-tour="validation-progress"
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${
        state.isComplete ? "bg-muted text-ink" : "bg-warning-surface text-warning"
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
