"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import type { Group } from "@/core/entities/Group"
import { getGroupService } from "@/lib/services"
import { useUserIdentity } from "@/lib/hooks/use-user-identity"

interface CreateGroupFormProps {
  onGroupCreated: (group: Group) => void
}

export function CreateGroupForm({ onGroupCreated }: CreateGroupFormProps) {
  const [groupName, setGroupName] = useState("")
  const [creatorName, setCreatorName] = useState("")
  const [members, setMembers] = useState<string[]>([""])
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { setIdentity } = useUserIdentity(null)

  const addMember = () => {
    setMembers([...members, ""])
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const updateMember = (index: number, value: string) => {
    const newMembers = [...members]
    newMembers[index] = value
    setMembers(newMembers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!creatorName.trim()) {
        throw new Error("Debes ingresar tu nombre")
      }

      const validMembers = members.filter((m) => m.trim() !== "")

      const allMembers = [creatorName.trim(), ...validMembers]

      console.log("[v0] Creating group with:", { groupName, allMembers })

      const groupService = getGroupService()
      const group = await groupService.createGroup(groupName, allMembers, isPrivate)

      setIdentity(group.id, creatorName.trim())

      console.log("[v0] Group created successfully:", group.id)
      onGroupCreated(group)
    } catch (err) {
      console.error("[v0] Error in create group form:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al crear el grupo"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Nuevo grupo</h1>
        <p className="text-sm text-ink-2">
          Ponle nombre y añade a la gente. Podrás invitar a más después.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="groupName">Nombre del grupo</Label>
          <Input
            id="groupName"
            placeholder="Viaje a la playa"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="creatorName">Tu nombre en el grupo</Label>
          <Input
            id="creatorName"
            placeholder="Juan"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            required
            className="h-11"
          />
          <p className="text-xs text-ink-2">Así te verán los demás miembros.</p>
        </div>

        <div className="space-y-3">
          <Label>Otros miembros</Label>

          <div className="space-y-2">
            {members.map((member, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Nombre del miembro"
                  value={member}
                  onChange={(e) => updateMember(index, e.target.value)}
                  className="h-11"
                />
                {members.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Quitar este miembro"
                    onClick={() => removeMember(index)}
                    className="h-11 w-11 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addMember}
              className="h-11 w-full"
            >
              Añadir miembro
            </Button>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <Checkbox
              id="isPrivate"
              className="mt-0.5"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="isPrivate" className="cursor-pointer">
                Grupo privado
              </Label>
              <p className="text-xs text-ink-2">
                Cada miembro solo verá los gastos en los que participa.
              </p>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-debit">{error}</p>}

        <Button type="submit" className="h-12 w-full text-base font-bold" disabled={isLoading}>
          {isLoading ? "Creando..." : "Crear grupo"}
        </Button>
      </form>
    </div>
  )
}
