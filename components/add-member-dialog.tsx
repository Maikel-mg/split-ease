"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
      setError("El nombre es requerido")
      return
    }

    // Check if member already exists
    const memberExists = group.members.some((m) => m.name.toLowerCase() === memberName.trim().toLowerCase())

    if (memberExists) {
      setError("Este nombre ya existe en el grupo")
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
      setError(err instanceof Error ? err.message : "Error al agregar persona")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar nueva persona</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberName">Nombre de la persona</Label>
            <Input
              id="memberName"
              placeholder="Ej: Juan"
              value={memberName}
              onChange={(e) => {
                setMemberName(e.target.value)
                setError("")
              }}
              disabled={loading}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Agregando..." : "Agregar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
