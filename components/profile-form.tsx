"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserProfile } from "@/app/actions/profile-actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProfileFormProps {
  userId: string
  userEmail: string
  currentDisplayName: string
}

export default function ProfileForm({ userId, userEmail, currentDisplayName }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateUserProfile(userId, displayName)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push("/grupos")
      }, 1500)
    } else {
      setError(result.error || "Error al actualizar el perfil")
    }

    setIsLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-4">
        <Link href="/grupos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver a Mis Grupos
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={userEmail} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="displayName">Nombre visible</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Tu nombre"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  Este nombre se mostrará en lugar de tu email en la aplicación
                </p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">Perfil actualizado correctamente</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
