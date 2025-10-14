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
import { Plus } from "lucide-react"
import { getExpenseService } from "@/lib/services"
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
  const [participants, setParticipants] = useState<string[]>([])
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (editExpense) {
      setAmount(editExpense.amount.toString())
      setDescription(editExpense.description)
      setPaidBy(editExpense.paidBy)
      setParticipants(editExpense.participants)
      setDate(new Date(editExpense.date).toISOString().split("T")[0])
      setOpen(true)
    }
  }, [editExpense])

  const toggleParticipant = (memberId: string) => {
    setParticipants((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  const selectAll = () => {
    setParticipants(group.members.map((m) => m.id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const expenseService = getExpenseService()

      if (editExpense) {
      console.log('UPDATE ', editExpense)
        const expense = await expenseService.updateExpense(
          editExpense.id,
          Number.parseFloat(amount),
          paidBy,
          description,
          participants,
          new Date(date),
        )
        onExpenseUpdated?.(expense)
      } else {
      console.log('CREATE ', editExpense)

        const expense = await expenseService.createExpense(
          group.id,
          Number.parseFloat(amount),
          paidBy,
          description,
          participants,
          new Date(date),
        )
        onExpenseAdded(expense)
      }

      setOpen(false)

      setAmount("")
      setDescription("")
      setPaidBy("")
      setParticipants([])
      setDate(new Date().toISOString().split("T")[0])
    } catch (err) {
      console.log('ERRROR ', err)

      setError(err instanceof Error ? err.message : "Error al crear el gasto")
    } finally {
      setIsLoading(false)
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
                $
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
              <Button type="button" variant="link" size="sm" onClick={selectAll} className="h-auto p-0 text-primary">
                Todos
              </Button>
            </div>
            <div className="space-y-2 border rounded-lg p-3">
              {group.members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`participant-${member.id}`}
                    checked={participants.includes(member.id)}
                    onCheckedChange={() => toggleParticipant(member.id)}
                  />
                  <label
                    htmlFor={`participant-${member.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {member.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
            {isLoading ? "Guardando..." : editExpense ? "Actualizar" : "Guardar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
