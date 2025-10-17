"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, ImageIcon, X, Minus } from "lucide-react"
import { getExpenseService } from "@/lib/services"
import { uploadExpenseImage, deleteExpenseImage } from "@/lib/upload-image"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"

interface AddExpenseFormProps {
  group: Group
  onExpenseAdded: (expense: Expense) => void
  editExpense?: Expense
  onExpenseUpdated?: (expense: Expense) => void
}

export function AddExpenseForm({ group, onExpenseAdded, editExpense, onExpenseUpdated }: AddExpenseFormProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [paidBy, setPaidBy] = useState("")
  const [participants, setParticipants] = useState<string[]>(group.members.map((m) => m.id))
  const [splitMode, setSplitMode] = useState<"equally" | "shares" | "amounts">("equally")
  const [splitData, setSplitData] = useState<Record<string, number>>({})
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    if (open && !editExpense) {
      setParticipants(group.members.map((m) => m.id))
      const initialSplitData: Record<string, number> = {}
      group.members.forEach((m) => {
        initialSplitData[m.id] = splitMode === "shares" ? 1 : 0
      })
      setSplitData(initialSplitData)
    }
  }, [open, editExpense, group.members, splitMode])

  useEffect(() => {
    if (editExpense) {
      setAmount(editExpense.amount.toString())
      setDescription(editExpense.description)
      setPaidBy(editExpense.paidBy)
      setParticipants(editExpense.participants)
      setDate(new Date(editExpense.date).toISOString().split("T")[0])
      setImagePreview(editExpense.imageUrl || null)
      setSplitMode(editExpense.splitMode)
      setSplitData(editExpense.splitData || {})
      setOpen(true)
    }
  }, [editExpense])

  const calculateShare = (memberId: string): number => {
    const totalAmount = Number.parseFloat(amount) || 0

    if (splitMode === "equally") {
      const participantCount = participants.length
      return participantCount > 0 ? totalAmount / participantCount : 0
    } else if (splitMode === "shares") {
      const totalShares = participants.reduce((sum, id) => sum + (splitData[id] || 1), 0)
      const memberShares = splitData[memberId] || 1
      return totalShares > 0 ? (totalAmount * memberShares) / totalShares : 0
    } else if (splitMode === "amounts") {
      return splitData[memberId] || 0
    }

    return 0
  }

  const updateSplitData = (memberId: string, value: number) => {
    setSplitData((prev) => ({ ...prev, [memberId]: Math.max(0, value) }))
  }

  const adjustShares = (memberId: string, delta: number) => {
    const currentShares = splitData[memberId] || 1
    updateSplitData(memberId, currentShares + delta)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no puede superar 5MB")
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const toggleParticipant = (memberId: string) => {
    setParticipants((prev) => {
      const newParticipants = prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
      if (!prev.includes(memberId)) {
        setSplitData((prevData) => ({
          ...prevData,
          [memberId]: splitMode === "shares" ? 1 : 0,
        }))
      }
      return newParticipants
    })
  }

  const selectAll = () => {
    setParticipants(group.members.map((m) => m.id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      let imageUrl = editExpense?.imageUrl || null
      if (imageFile) {
        setIsUploadingImage(true)
        imageUrl = await uploadExpenseImage(imageFile)
        setIsUploadingImage(false)
      } else if (!imagePreview && editExpense?.imageUrl) {
        await deleteExpenseImage(editExpense.imageUrl)
        imageUrl = null
      }

      const expenseService = getExpenseService()

      if (editExpense) {
        const expense = await expenseService.updateExpense(
          editExpense.id,
          Number.parseFloat(amount),
          paidBy,
          description,
          participants,
          new Date(date),
          imageUrl || undefined,
          splitMode,
          splitData,
        )
        onExpenseUpdated?.(expense)
      } else {
        const expense = await expenseService.createExpense(
          group.id,
          Number.parseFloat(amount),
          paidBy,
          description,
          participants,
          new Date(date),
          imageUrl || undefined,
          splitMode,
          splitData,
        )
        onExpenseAdded(expense)
      }

      setOpen(false)

      setAmount("")
      setDescription("")
      setPaidBy("")
      setParticipants(group.members.map((m) => m.id))
      setDate(new Date().toISOString().split("T")[0])
      setImageFile(null)
      setImagePreview(null)
      setSplitMode("equally")
      setSplitData({})
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el gasto")
    } finally {
      setIsLoading(false)
      setIsUploadingImage(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!editExpense && (
        <DialogTrigger asChild>
          <Button className="w-full h-12 text-base font-medium" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Agregar Gasto
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editExpense ? "Editar gasto" : "Nuevo gasto"}</DialogTitle>
          <DialogDescription>
            {editExpense ? "Modifica los detalles del gasto" : "Registra un gasto compartido del grupo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Monto
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-light text-muted-foreground">
                €
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-16 text-3xl font-light pl-12 text-right"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidBy" className="text-sm font-medium">
              Pagado por
            </Label>
            <Select value={paidBy} onValueChange={setPaidBy} required>
              <SelectTrigger id="paidBy" className="h-11">
                <SelectValue placeholder="Seleccionar miembro" />
              </SelectTrigger>
              <SelectContent>
                {group.members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="description"
              placeholder="Ej: Comida"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Foto (opcional)
            </Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <Label htmlFor="image" className="cursor-pointer flex flex-col items-center gap-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Toca para adjuntar una foto</span>
                </Label>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Fecha
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Dividir entre</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="link" size="sm" onClick={selectAll} className="h-auto p-0 text-primary">
                  Todos
                </Button>
                <Select value={splitMode} onValueChange={(value: any) => setSplitMode(value)}>
                  <SelectTrigger className="h-8 w-[140px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equally">Igualmente</SelectItem>
                    <SelectItem value="shares">Por partes</SelectItem>
                    <SelectItem value="amounts">Por importes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 border rounded-lg p-3">
              {group.members.map((member) => {
                const isSelected = participants.includes(member.id)
                const share = isSelected ? calculateShare(member.id) : 0
                return (
                  <div key={member.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 flex-1">
                      <Checkbox
                        id={`participant-${member.id}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleParticipant(member.id)}
                      />
                      <label
                        htmlFor={`participant-${member.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {member.name}
                      </label>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        {splitMode === "equally" && (
                          <span className="text-sm font-medium text-muted-foreground">{share.toFixed(2)} €</span>
                        )}
                        {splitMode === "shares" && (
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 bg-transparent"
                              onClick={() => adjustShares(member.id, -1)}
                              disabled={splitData[member.id] <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-12 text-center">{splitData[member.id] || 1}x</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 bg-transparent"
                              onClick={() => adjustShares(member.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium text-muted-foreground ml-1">{share.toFixed(2)} €</span>
                          </div>
                        )}
                        {splitMode === "amounts" && (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={splitData[member.id] || 0}
                            onChange={(e) => updateSplitData(member.id, Number.parseFloat(e.target.value) || 0)}
                            className="h-8 w-24 text-right text-sm"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading || isUploadingImage}>
            {isUploadingImage
              ? "Subiendo imagen..."
              : isLoading
                ? "Guardando..."
                : editExpense
                  ? "Actualizar"
                  : "Guardar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
