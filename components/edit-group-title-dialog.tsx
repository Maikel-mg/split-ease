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
        title: 'Error',
        description: 'El nombre del grupo no puede estar vacío.',
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
        title: 'Error',
        description: error.message || 'No se pudo actualizar el nombre del grupo.',
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
          <DialogTitle>Cambiar nombre del grupo</DialogTitle>
          <DialogDescription>Cambia el nombre de tu grupo aquí. Haz clic en guardar cuando hayas terminado.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nombre del grupo</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nombre del grupo"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="edit-isPrivate" checked={isPrivate} onCheckedChange={(checked) => setIsPrivate(checked as boolean)} />
            <div className="grid gap-1.5 leading-none">
               <Label
                htmlFor="edit-isPrivate"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
               >
                 Grupo privado
               </Label>
               <p className="text-xs text-muted-foreground">
                 Si activas esta opción, los miembros solo verán los gastos en los que participan.
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
