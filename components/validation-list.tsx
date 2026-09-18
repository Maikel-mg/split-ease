"use client"

import { AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import type { Group } from "@/core/entities/Group"
import type { GroupValidationState } from "@/core/entities/Validation"

interface ValidationListProps {
  group: Group
  state: GroupValidationState
}

// Names live here and only here, inside a scrollable box with the pending ones
// on top, so fifteen members are a list and not a broken layout.
export function ValidationList({ group, state }: ValidationListProps) {
  if (!state.hasExpenses) return null

  const nameOf = (memberId: string) =>
    group.members.find((m) => m.id === memberId)?.name || "Desconocido"

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground">
        Validación ({state.validatedCount}/{state.totalEligible})
      </h3>

      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {state.pendingMemberIds.map((memberId) => {
          const isStale = state.staleMemberIds.includes(memberId)

          return (
            <div
              key={memberId}
              className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm"
            >
              {isStale ? (
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className="flex-1 truncate">{nameOf(memberId)}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {isStale ? "Validó, pero ha cambiado algo" : "Pendiente"}
              </span>
            </div>
          )
        })}

        {state.validatedMemberIds.map((memberId) => (
          <div key={memberId} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="flex-1 truncate">{nameOf(memberId)}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">Validado</span>
          </div>
        ))}
      </div>
    </div>
  )
}
