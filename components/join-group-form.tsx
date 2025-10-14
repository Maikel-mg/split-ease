"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getGroupService } from "@/lib/services"
import type { Group } from "@/core/entities/Group"

interface JoinGroupFormProps {
  onGroupJoined: (group: Group) => void
}

export function JoinGroupForm({ onGroupJoined }: JoinGroupFormProps) {
  const [code, setCode] = useState("")
  const [memberName, setMemberName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const groupService = getGroupService()
      const group = await groupService.joinGroup(code, memberName)
      onGroupJoined(group)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al unirse al grupo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Unirse a un grupo</CardTitle>
        <CardDescription>Ingresa el código del grupo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium">
              Código del grupo
            </Label>
            <Input
              id="code"
              placeholder="Ingresa el código alfanumérico"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              required
              className="h-11"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
            {isLoading ? "Uniéndose..." : "Unirse"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
