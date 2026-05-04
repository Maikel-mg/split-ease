"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { copyGroup } from "@/app/actions/group-actions"
import { useToast } from "@/hooks/use-toast"
import { useUserIdentity } from "@/lib/hooks/use-user-identity"
import type { Group } from "@/core/entities/Group"

interface CopyGroupDialogProps {
  sourceGroup: Group
  open: boolean
  onOpenChange: (open: boolean) => void
  onGroupCopied: (newGroupId: string) => void
}

export function CopyGroupDialog({
  sourceGroup,
  open,
  onOpenChange,
  onGroupCopied,
}: CopyGroupDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { setIdentity } = useUserIdentity(null)
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedMember, setSelectedMember] = useState<string>("")
  const [customMemberName, setCustomMemberName] = useState("")
  const [isCustomMember, setIsCustomMember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Reset fields when dialog opens
  useEffect(() => {
    if (open) {
      setNewGroupName(`${sourceGroup.name} (copia)`)
      setSelectedMember("")
      setCustomMemberName("")
      setIsCustomMember(false)
    }
  }, [open, sourceGroup.name])

  const handleCopy = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del grupo no puede estar vacío.",
        variant: "destructive",
      })
      return
    }

    if (newGroupName.trim().length > 100) {
      toast({
        title: "Error",
        description: "El nombre del grupo no puede superar los 100 caracteres.",
        variant: "destructive",
      })
      return
    }

    const memberName = isCustomMember ? customMemberName.trim() : selectedMember
    if (!memberName) {
      toast({
        title: "Error",
        description: "Selecciona qué miembro eres en el nuevo grupo.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await copyGroup(sourceGroup.id, newGroupName.trim())

      if (result.success && result.newGroupId) {
        // Store the group identity in localStorage
        setIdentity(result.newGroupId, memberName)

        toast({
          title: "Grupo copiado",
          description: `Se ha creado el grupo "${newGroupName.trim()}" con ${sourceGroup.members.length} miembros.`,
        })
        onGroupCopied(result.newGroupId)
        onOpenChange(false)
        // Navigate to the new group
        router.push(`/group/${result.newGroupId}`)
      }
    } catch (error: any) {
      console.error("Error copying group:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo copiar el grupo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Copiar grupo</DialogTitle>
          <DialogDescription>
            Crea una copia de este grupo con los mismos miembros.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Nombre del nuevo grupo</Label>
            <Input
              id="groupName"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Nombre del grupo"
              maxLength={100}
            />
          </div>
<div className="text-sm text-muted-foreground">
      <p>Se copian {sourceGroup.members.length} miembros del grupo original:</p>
      <ul className="list-disc list-inside mt-1">
        {sourceGroup.members.slice(0, 5).map((member) => (
          <li key={member.id}>{member.name}</li>
        ))}
        {sourceGroup.members.length > 5 && (
          <li className="text-muted-foreground">
            ...y {sourceGroup.members.length - 5} más
          </li>
        )}
      </ul>
    </div>

    <div className="space-y-2">
      <Label>¿Qué miembro eres en el nuevo grupo?</Label>
      <RadioGroup
        value={isCustomMember ? "custom" : selectedMember}
        onValueChange={(value) => {
          if (value === "custom") {
            setIsCustomMember(true)
            setSelectedMember("")
          } else {
            setIsCustomMember(false)
            setSelectedMember(value)
          }
        }}
        className="flex flex-col space-y-1"
      >
        {sourceGroup.members.map((member) => (
          <div key={member.id} className="flex items-center space-x-2">
            <RadioGroupItem value={member.name} id={`member-${member.id}`} />
            <Label htmlFor={`member-${member.id}`} className="font-normal cursor-pointer">
              {member.name}
            </Label>
          </div>
        ))}
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="member-custom" />
          <Label htmlFor="member-custom" className="font-normal cursor-pointer">
            Otro:
          </Label>
        </div>
      </RadioGroup>
      {isCustomMember && (
        <Input
          value={customMemberName}
          onChange={(e) => setCustomMemberName(e.target.value)}
          placeholder="Tu nombre"
          className="mt-2"
        />
      )}
    </div>
        </div>
        <DialogFooter>
<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
      Cancelar
    </Button>
    <Button
      onClick={handleCopy}
      disabled={
        isLoading ||
        !newGroupName.trim() ||
        (!selectedMember && (!isCustomMember || !customMemberName.trim()))
      }
    >
      {isLoading ? "Copiando..." : "Copiar grupo"}
    </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}