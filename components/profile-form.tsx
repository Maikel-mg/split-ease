"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
      setError(result.error || "No se pudo actualizar el perfil")
    }

    setIsLoading(false)
  }

  return (
    <div className="w-full max-w-sm">
      <Link
        href="/grupos"
        className="mb-8 inline-flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis grupos
      </Link>

      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-ink-2">Este nombre es el que verán los demás en tus grupos.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={userEmail} disabled className="h-11 bg-muted" />
          <p className="text-xs text-ink-2">El email no se puede cambiar.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayName">Nombre visible</Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Tu nombre"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            className="h-11"
          />
        </div>

        {error && <p className="text-sm text-debit">{error}</p>}
        {success && <p className="text-sm text-credit">Perfil actualizado.</p>}

        <Button type="submit" className="h-12 w-full text-base font-bold" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </div>
  )
}
