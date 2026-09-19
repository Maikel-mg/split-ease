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
import { MemberDot } from "@/components/member-dot"
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
        title: "El nombre no puede estar vacío",
        description: "Escribe un nombre para el grupo nuevo.",
        variant: "destructive",
      })
      return
    }

    if (newGroupName.trim().length > 100) {
      toast({
        title: "El nombre es demasiado largo",
        description: "No puede superar los 100 caracteres.",
        variant: "destructive",
      })
      return
    }

    const memberName = isCustomMember ? customMemberName.trim() : selectedMember
    if (!memberName) {
      toast({
        title: "Falta quién eres",
        description: "Selecciona qué miembro eres en el grupo nuevo.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await copyGroup(sourceGroup.id, newGroupName.trim())

      if (result.success && result.newGroupId) {
        setIdentity(result.newGroupId, memberName)

        toast({
          title: "Grupo copiado",
          description: `Se ha creado «${newGroupName.trim()}» con ${sourceGroup.members.length} miembros.`,
        })
        onGroupCopied(result.newGroupId)
        onOpenChange(false)
        router.push(`/group/${result.newGroupId}`)
      }
    } catch (error: any) {
      console.error("Error copying group:", error)
      toast({
        title: "No se pudo copiar el grupo",
        description: error.message || "Inténtalo de nuevo en unos segundos.",
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
            Crea un grupo nuevo con los mismos miembros de «{sourceGroup.name}».
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="groupName">Nombre del grupo nuevo</Label>
            <Input
              id="groupName"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Nombre del grupo"
              maxLength={100}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>¿Qué miembro eres en el grupo nuevo?</Label>
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
              className="divide-y divide-rule"
            >
              {sourceGroup.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 py-3">
                  <RadioGroupItem value={member.name} id={`member-${member.id}`} />
                  <MemberDot name={member.name} />
                  <Label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer font-normal">
                    {member.name}
                  </Label>
                </div>
              ))}
              <div className="flex items-center gap-3 py-3">
                <RadioGroupItem value="custom" id="member-custom" />
                <Label htmlFor="member-custom" className="flex-1 cursor-pointer font-normal">
                  Otro nombre
                </Label>
              </div>
            </RadioGroup>
            {isCustomMember && (
              <Input
                value={customMemberName}
                onChange={(e) => setCustomMemberName(e.target.value)}
                placeholder="Tu nombre"
                className="mt-2 h-11"
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
