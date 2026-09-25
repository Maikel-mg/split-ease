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
import { Copy, Check, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { shareGroupInvite } from "@/lib/share-group"

interface ShareGroupDialogProps {
  groupName: string
  groupCode: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareGroupDialog({ groupName, groupCode, open, onOpenChange }: ShareGroupDialogProps) {
  const { toast } = useToast()
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [sharing, setSharing] = useState(false)

  const joinUrl =
    typeof window !== "undefined" ? `${window.location.origin}/join/${groupCode}` : ""

  const handleShareInvite = async () => {
    setSharing(true)
    try {
      const outcome = await shareGroupInvite({ groupName, joinUrl })

      if (outcome === "copied") {
        toast({
          title: "Invitación copiada",
          description: "Pégalo donde quieras invitar al grupo.",
        })
      } else if (outcome === "unavailable") {
        toast({
          title: "No se pudo compartir",
          description: "Tu navegador no ofrece compartir. Usa el enlace de abajo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sharing group invite:", error)
      toast({
        title: "No se pudo compartir",
        description: "Inténtalo de nuevo en unos segundos.",
        variant: "destructive",
      })
    } finally {
      setSharing(false)
    }
  }

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
            <Button className="h-11 w-full" onClick={handleShareInvite} disabled={sharing}>
              <Share2 className="h-4 w-4" />
              {sharing ? "Compartiendo..." : "Compartir invitación"}
            </Button>
            <p className="text-xs text-ink-2">
              Abre el menú para elegir WhatsApp, Telegram o cualquier otra app.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-rule" />
            <span className="text-xs text-ink-2">o comparte el código</span>
            <span className="h-px flex-1 bg-rule" />
          </div>

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
