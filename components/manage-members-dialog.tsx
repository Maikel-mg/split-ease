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
import { MemberDot } from "@/components/member-dot"
import { Trash2 } from "lucide-react"
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
      await groupService.removeMember(group.id, memberId)
      toast({
        title: "Miembro eliminado",
        description: "El miembro ha sido eliminado del grupo.",
      })
      onMemberRemoved()
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "No se pudo eliminar al miembro",
        description: "Inténtalo de nuevo en unos segundos.",
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
          <DialogTitle>Miembros del grupo</DialogTitle>
          <DialogDescription>
            Solo puedes eliminar a quien tiene el saldo a cero.
          </DialogDescription>
        </DialogHeader>

        <ul className="divide-y divide-rule">
          {group.members.map((member) => {
            const balance = balances.find((b) => b.memberId === member.id)
            const canBeRemoved = balance && Math.abs(balance.netBalance) < 0.01

            return (
              <li key={member.id} className="flex items-center gap-3 py-3">
                <MemberDot name={member.name} />
                <span className="flex-1 truncate">{member.name}</span>

                {canBeRemoved ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar a ${member.name}`}
                        className="h-8 w-8 text-ink-2 hover:text-debit"
                        disabled={isRemoving === member.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar a {member.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          No se puede deshacer. Sus gastos y pagos seguirán en el grupo, pero
                          dejará de aparecer como miembro.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <span className="text-xs text-ink-2">Con deudas</span>
                )}
              </li>
            )
          })}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
