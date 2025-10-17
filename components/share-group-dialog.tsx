"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check, Share2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ShareGroupDialogProps {
  groupName: string
  groupCode: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareGroupDialog({ groupName, groupCode, open, onOpenChange }: ShareGroupDialogProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join/${groupCode}` : ""

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
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir grupo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">{groupName}</h3>
            <p className="text-sm text-muted-foreground">
              Comparte este grupo con otros para que puedan unirse y ver los gastos
            </p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Código del grupo</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-lg text-center">{groupCode}</div>
                  <Button variant="outline" size="icon" onClick={handleCopyCode} className="shrink-0 bg-transparent">
                    {copiedCode ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Los usuarios pueden usar este código para unirse al grupo
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Enlace de invitación</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 justify-start bg-muted hover:bg-muted/80"
                    onClick={handleCopyUrl}
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm">Enlace copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        <span className="text-sm">Copiar enlace de invitación</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Comparte este enlace para que otros puedan unirse directamente
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
