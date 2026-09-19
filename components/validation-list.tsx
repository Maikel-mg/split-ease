"use client"

import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { InfoHint } from "@/components/info-hint"
import { MemberDot } from "@/components/member-dot"
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
    return <p className="py-6 text-center text-sm text-ink-2">Todavía no hay gastos que validar.</p>
  }

  const nameOf = (memberId: string) =>
    group.members.find((m) => m.id === memberId)?.name || "Desconocido"

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        <h2 className="text-sm font-bold">Validación del grupo</h2>
        <InfoHint label="Qué es la validación">
          Antes de pagar, cada persona revisa y confirma que sus gastos y pagos son correctos.
          Nadie debería pagar hasta que todos hayan validado.
        </InfoHint>
      </div>

      <p className="text-sm text-ink-2">
        {state.isComplete
          ? "Todos los miembros han validado sus gastos y pagos."
          : `Faltan ${state.pendingMemberIds.length} de ${state.totalEligible} por validar.`}
      </p>

      <div className="max-h-[60vh] overflow-y-auto">
        <ul className="divide-y divide-rule">
          {state.pendingMemberIds.map((memberId) => {
            const isStale = state.staleMemberIds.includes(memberId)
            const name = nameOf(memberId)

            return (
              <li key={memberId} className="flex items-center gap-3 py-3 text-sm">
                <MemberDot name={name} />
                <span className="flex-1 truncate">{name}</span>
                <span
                  className={`flex items-center gap-1 text-xs font-medium ${
                    isStale ? "text-warning" : "text-ink-2"
                  }`}
                >
                  {isStale && <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />}
                  {isStale ? "Ha cambiado algo" : "Pendiente"}
                </span>
              </li>
            )
          })}

          {state.validatedMemberIds.map((memberId) => {
            const name = nameOf(memberId)

            return (
              <li key={memberId} className="flex items-center gap-3 py-3 text-sm">
                <MemberDot name={name} />
                <span className="flex-1 truncate">{name}</span>
                <span className="flex items-center gap-1 text-xs font-medium text-ink-2">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                  Validado
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
