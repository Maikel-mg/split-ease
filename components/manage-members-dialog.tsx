"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { User, Trash2 } from "lucide-react"
import type { Group } from "@/core/entities/Group"
import type { Balance } from "@/core/entities/Balance"
import { getGroupService } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

interface ManageMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group
  balances: Balance[]
  onMemberRemoved: () => void
}

export function ManageMembersDialog({ open, onOpenChange, group, balances, onMemberRemoved }: ManageMembersDialogProps) {
  const { toast } = useToast()
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const handleRemoveMember = async (memberId: string) => {
    setIsRemoving(memberId)
    const groupService = getGroupService()
    try {
      // This method needs to be created in GroupService
      await groupService.removeMember(group.id, memberId)
      toast({
        title: "Miembro eliminado",
        description: "El miembro ha sido eliminado del grupo.",
      })
      onMemberRemoved()
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar al miembro. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gestionar miembros</DialogTitle>
          <DialogDescription>Elimina miembros que no tengan deudas pendientes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1 py-4">
          {group.members.map((member) => {
            const balance = balances.find((b) => b.memberId === member.id)
            const canBeRemoved = balance && Math.abs(balance.netBalance) < 0.01

            return (
              <div key={member.id} className="flex items-center justify-between p-2 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="font-medium">{member.name}</p>
                </div>
                {canBeRemoved ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" disabled={isRemoving === member.id}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de que quieres eliminar a {member.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente al miembro del grupo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>
                          Sí, eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <div style={{ width: '2.25rem' }} /> // to align with button
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}