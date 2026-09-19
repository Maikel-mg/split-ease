"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface ShareGroupDialogProps {
  groupName: string
  groupCode: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareGroupDialog({ groupName, groupCode, open, onOpenChange }: ShareGroupDialogProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const joinUrl =
    typeof window !== "undefined" ? `${window.location.origin}/join/${groupCode}` : ""

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(groupCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(joinUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar a {groupName}</DialogTitle>
          <DialogDescription>Pasa el código o el enlace a quien quieras añadir.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Código del grupo</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md bg-muted py-3 text-center font-mono text-xl tracking-[0.3em]">
                {groupCode}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                aria-label="Copiar el código"
                className="h-11 w-11 shrink-0"
              >
                {copiedCode ? <Check className="h-4 w-4 text-credit" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-ink-2">Se escribe a mano desde «Unirme con un código».</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Enlace de invitación</p>
            <Button variant="outline" className="h-11 w-full justify-start" onClick={handleCopyUrl}>
              {copiedUrl ? (
                <Check className="h-4 w-4 text-credit" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiedUrl ? "Enlace copiado" : "Copiar enlace"}
            </Button>
            <p className="text-xs text-ink-2">Abre el grupo directamente, sin escribir el código.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
