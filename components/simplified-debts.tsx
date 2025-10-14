"use client"

import { Card, CardContent } from "@/components/ui/card"
import { User, ArrowRight } from "lucide-react"
import type { Debt } from "@/core/entities/Balance"

interface SimplifiedDebtsProps {
  debts: Debt[]
}

export function SimplifiedDebts({ debts }: SimplifiedDebtsProps) {
  if (debts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No hay deudas pendientes</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold px-1 mb-4">Deudas Simplificadas</h2>
        <p className="text-sm text-muted-foreground px-1 mb-4">
          Esta es la forma más eficiente de saldar las deudas del grupo
        </p>

        <div className="space-y-3">
          {debts.map((debt, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="font-semibold">{debt.from}</span>
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mx-1" />
                  <span className="font-bold text-primary text-lg">{debt.amount.toFixed(2)}€</span>
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mx-1" />
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="font-semibold">{debt.to}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
