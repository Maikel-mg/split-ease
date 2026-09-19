"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getGroupService } from "@/lib/services"
import type { Group } from "@/core/entities/Group"

interface AddMemberDialogProps {
  group: Group
  onMemberAdded: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMemberDialog({ group, onMemberAdded, open, onOpenChange }: AddMemberDialogProps) {
  const [memberName, setMemberName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!memberName.trim()) {
      setError("Escribe un nombre.")
      return
    }

    const memberExists = group.members.some(
      (m) => m.name.toLowerCase() === memberName.trim().toLowerCase()
    )

    if (memberExists) {
      setError("Ya hay alguien con ese nombre en el grupo.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const groupService = getGroupService()
      await groupService.addMemberToGroup(group.id, memberName.trim())

      setMemberName("")
      onMemberAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo añadir a la persona")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir persona</DialogTitle>
          <DialogDescription>
            Se añade al grupo sin cuenta. Podrá entrar con el código del grupo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="memberName">Nombre</Label>
            <Input
              id="memberName"
              placeholder="Juan"
              value={memberName}
              onChange={(e) => {
                setMemberName(e.target.value)
                setError("")
              }}
              disabled={loading}
              className="h-11"
              autoFocus
            />
            {error && <p className="text-sm text-debit">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Añadiendo..." : "Añadir"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
