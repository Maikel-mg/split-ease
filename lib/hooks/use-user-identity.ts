"use client"

import { useState, useEffect } from "react"

// Store which member the user is in each group
// Format: { [groupId]: memberName }
const STORAGE_KEY = "group_user_identities"
const GROUP_IDS_KEY = "my-group-ids"

export function useUserIdentity(groupId: string | null) {
  const [userMemberName, setUserMemberName] = useState<string | null>(() => {
    // Try to initialize from localStorage immediately to avoid initial null flash
    if (typeof window !== "undefined" && groupId) {
       return getUserIdentities()[groupId] || null
    }
    return null
  })
  
  // Update if groupId changes later
  useEffect(() => {
    if (!groupId) {
        setUserMemberName(null)
        return
    }
    const identities = getUserIdentities()
    setUserMemberName(identities[groupId] || null)
  }, [groupId])

  const setIdentity = (groupId: string, memberName: string) => {
    const identities = getUserIdentities()
    identities[groupId] = memberName
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identities))
    setUserMemberName(memberName)

    addGroupId(groupId)
  }

  const clearIdentity = (groupId: string) => {
    const identities = getUserIdentities()
    delete identities[groupId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identities))
    setUserMemberName(null)

    removeGroupId(groupId)
  }

  return {
    userMemberName,
    setIdentity,
    clearIdentity,
  }
}

function getUserIdentities(): Record<string, string> {
  if (typeof window === "undefined") return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function getUserMemberName(groupId: string): string | null {
  const identities = getUserIdentities()
  return identities[groupId] || null
}

export function addGroupId(groupId: string) {
  if (typeof window === "undefined") return

  try {
    const stored = localStorage.getItem(GROUP_IDS_KEY)
    const groupIds: string[] = stored ? JSON.parse(stored) : []

    // Only add if not already in the list
    if (!groupIds.includes(groupId)) {
      groupIds.push(groupId)
      localStorage.setItem(GROUP_IDS_KEY, JSON.stringify(groupIds))
      console.log("[v0] Added group ID to list:", groupId, "Total groups:", groupIds.length)
    }
  } catch (error) {
    console.error("[v0] Error adding group ID:", error)
  }
}

export function removeGroupId(groupId: string) {
  if (typeof window === "undefined") return

  try {
    const stored = localStorage.getItem(GROUP_IDS_KEY)
    const groupIds: string[] = stored ? JSON.parse(stored) : []
    const filtered = groupIds.filter((id) => id !== groupId)
    localStorage.setItem(GROUP_IDS_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("[v0] Error removing group ID:", error)
  }
}

export function getMyGroupIds(): string[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(GROUP_IDS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}
