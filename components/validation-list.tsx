"use client"

import { AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { InfoHint } from "@/components/info-hint"
import type { Group } from "@/core/entities/Group"
import type { GroupValidationState } from "@/core/entities/Validation"

interface ValidationListProps {
  group: Group
  state: GroupValidationState
}

// Names live here and only here, inside a scrollable box with the pending ones
// on top, so fifteen members are a list and not a broken layout.
export function ValidationList({ group, state }: ValidationListProps) {
  if (!state.hasExpenses) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Todavía no hay gastos que validar.
      </p>
    )
  }

  const nameOf = (memberId: string) =>
    group.members.find((m) => m.id === memberId)?.name || "Desconocido"

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <h2 className="text-sm font-semibold">Validación del grupo</h2>
        <InfoHint label="Qué es la validación">
          Antes de pagar, cada persona revisa y confirma que sus gastos y pagos son correctos.
          Nadie debería pagar hasta que todos hayan validado.
        </InfoHint>
      </div>

      <p className="text-sm text-muted-foreground">
        {state.isComplete
          ? "Todos los miembros han validado sus gastos y pagos."
          : `Faltan ${state.pendingMemberIds.length} de ${state.totalEligible} por validar.`}
      </p>

      <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
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
