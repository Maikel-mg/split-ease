"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  getGroupService,
  getExpenseService,
  getBalanceService,
  getPaymentService,
  getValidationService,
  getValidationRepository,
} from "@/lib/services"
import { GetGroupDetailsUseCase } from "@/core/use-cases/GetGroupDetailsUseCase"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"
import type { Balance, Debt } from "@/core/entities/Balance"
import type { Payment } from "@/core/entities/Payment"
import type { GroupValidationState } from "@/core/entities/Validation"

export function useGroupDetails(groupId: string, userMemberName: string | null) {
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [validationState, setValidationState] = useState<GroupValidationState | null>(null)
  const [myValidation, setMyValidation] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const groupService = getGroupService()
      const expenseService = getExpenseService()
      const balanceService = getBalanceService()
      const paymentService = getPaymentService()
      const validationService = getValidationService()
      const validationRepository = getValidationRepository()

      const getGroupDetailsUseCase = new GetGroupDetailsUseCase(
        groupService,
        expenseService,
        balanceService,
        paymentService,
        validationService,
        validationRepository,
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
      setValidationState(details.validationState)
      setMyValidation(details.myValidation)
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
    validationState,
    myValidation,
    loading,
    refresh: loadData,
    setGroup,
    setExpenses,
    setPayments,
    setBalances,
    setDebts
  }
}
