"use client"

import { useCallback, useState } from "react"
import { getValidationRepository, getValidationService } from "@/lib/services"
import { ValidatePlanUseCase } from "@/core/use-cases/ValidatePlanUseCase"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"

export function useGroupValidation() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (action: () => Promise<void>): Promise<boolean> => {
    setSaving(true)
    setError(null)

    try {
      await action()
      return true
    } catch (err) {
      console.error("Error saving validation:", err)
      setError(err instanceof Error ? err.message : "No se ha podido guardar la validación")
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  const validate = useCallback(
    (group: Group, memberName: string, expenses: Expense[]) =>
      run(() =>
        new ValidatePlanUseCase(
          getValidationService(),
          getValidationRepository(),
        ).validate(group, memberName, expenses),
      ),
    [run],
  )

  const retire = useCallback(
    (group: Group, memberName: string) =>
      run(() =>
        new ValidatePlanUseCase(
          getValidationService(),
          getValidationRepository(),
        ).retire(group, memberName),
      ),
    [run],
  )

  const clearError = useCallback(() => setError(null), [])

  return { validate, retire, saving, error, clearError }
}
