"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getGroupService, getExpenseService, getBalanceService, getPaymentService } from "@/lib/services"
import { GetGroupDetailsUseCase } from "@/core/use-cases/GetGroupDetailsUseCase"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"
import type { Balance, Debt } from "@/core/entities/Balance"
import type { Payment } from "@/core/entities/Payment"

export function useGroupDetails(groupId: string, userMemberName: string | null) {
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const groupService = getGroupService()
      const expenseService = getExpenseService()
      const balanceService = getBalanceService()
      const paymentService = getPaymentService()
      
      const getGroupDetailsUseCase = new GetGroupDetailsUseCase(
        groupService,
        expenseService,
        balanceService,
        paymentService
      )

      const details = await getGroupDetailsUseCase.execute(groupId, userMemberName || undefined)
      
      if (!details) {
        router.push("/grupos")
        return
      }

      setGroup(details.group)
      setExpenses(details.visibleExpenses)
      setPayments(details.visiblePayments)
      setBalances(details.balances)
      setDebts(details.debts)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [groupId, userMemberName, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    group,
    expenses,
    payments,
    balances,
    debts,
    loading,
    refresh: loadData,
    setGroup,
    setExpenses,
    setPayments,
    setBalances,
    setDebts
  }
}
