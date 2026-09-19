"use client"

import { formatMoney } from "@/lib/format"
import type { Balance } from "@/core/entities/Balance"

interface MyPositionProps {
  balances: Balance[]
  userMemberName: string | null
}

// The user's net position lives here and only here: once, above the tabs, so it
// is visible whichever tab is open and never duplicated inside one of them.
export function MyPosition({ balances, userMemberName }: MyPositionProps) {
  if (!userMemberName) return null

  const mine = balances.find((balance) => balance.memberName === userMemberName)
  if (!mine) return null

  const credit = mine.netBalance > 0.01
  const debit = mine.netBalance < -0.01

  return (
    <div>
      <p className="text-sm font-medium text-ink-2">
        {credit ? "Te deben" : debit ? "Debes" : "Estás al día"}
      </p>
      <p
        className={`text-4xl font-bold tracking-tight tabular-nums ${
          credit ? "text-credit" : debit ? "text-debit" : "text-ink-2"
        }`}
      >
        {formatMoney(Math.abs(mine.netBalance))}
      </p>
    </div>
  )
}
