'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { getGroupService } from '@/lib/services'
import { useToast } from '@/hooks/use-toast'
import type { Group } from '@/core/entities/Group'

interface EditGroupTitleDialogProps {
  group: Group
  open: boolean
  onOpenChange: (open: boolean) => void
  onGroupUpdated: () => void
}

export function EditGroupTitleDialog({ group, open, onOpenChange, onGroupUpdated }: EditGroupTitleDialogProps) {
  const [newTitle, setNewTitle] = useState(group.name)
  const [isPrivate, setIsPrivate] = useState(group.isPrivate || false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setNewTitle(group.name)
    }
  }, [open, group.name])

  const handleSave = async () => {
    if (!newTitle.trim()) {
      toast({
        title: 'El nombre no puede estar vacío',
        description: 'Escribe un nombre para el grupo.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    const groupService = getGroupService()
    try {
      await groupService.updateGroupSettings(group.id, newTitle.trim(), isPrivate)
      toast({
        title: 'Grupo actualizado',
        description: 'El grupo se ha actualizado correctamente.',
      })
      onGroupUpdated()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error updating group name:', error)
      toast({
        title: 'No se pudo actualizar el grupo',
        description: error.message || 'Inténtalo de nuevo en unos segundos.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajustes del grupo</DialogTitle>
          <DialogDescription>Cambia el nombre y si es un grupo privado.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Nombre del grupo</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nombre del grupo"
              className="h-11"
            />
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="edit-isPrivate"
              className="mt-0.5"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="edit-isPrivate" className="cursor-pointer">
                Grupo privado
              </Label>
              <p className="text-xs text-ink-2">
                Cada miembro solo verá los gastos en los que participa.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
