"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { getGroupService } from "@/lib/services"
import type { Group } from "@/core/entities/Group"

interface CreateGroupFormProps {
  onGroupCreated: (group: Group) => void
}

export function CreateGroupForm({ onGroupCreated }: CreateGroupFormProps) {
  const [groupName, setGroupName] = useState("")
  const [members, setMembers] = useState<string[]>([""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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
      const groupService = getGroupService()
      const validMembers = members.filter((m) => m.trim() !== "")

      if (validMembers.length === 0) {
        throw new Error("Debe agregar al menos un miembro")
      }

      const group = await groupService.createGroup(groupName, validMembers)
      onGroupCreated(group)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el grupo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Nuevo grupo</CardTitle>
        <CardDescription>Crea un grupo para compartir gastos</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="groupName" className="text-sm font-medium">
              Nombre del grupo
            </Label>
            <Input
              id="groupName"
              placeholder="Nombre del grupo"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Miembros</Label>

            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Nombre o correo electrónico"
                    value={member}
                    onChange={(e) => updateMember(index, e.target.value)}
                    className="h-11"
                  />
                  {members.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMember(index)}
                      className="flex-shrink-0"
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
                className="w-full h-11 text-primary border-primary/20 hover:bg-primary/5 bg-transparent"
              >
                Añadir
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear grupo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
