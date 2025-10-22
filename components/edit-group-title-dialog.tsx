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
  const [name, setName] = useState(group.name)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setName(group.name)
    }
  }, [open, group.name])

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del grupo no puede estar vacío.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    const groupService = getGroupService()
    try {
      await groupService.updateGroupName(group.id, name.trim())
      toast({
        title: 'Grupo actualizado',
        description: 'El nombre del grupo se ha cambiado correctamente.',
      })
      onGroupUpdated()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error updating group name:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el nombre del grupo.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar nombre del grupo</DialogTitle>
          <DialogDescription>Cambia el nombre de tu grupo aquí. Haz clic en guardar cuando hayas terminado.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
