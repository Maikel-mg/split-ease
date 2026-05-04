"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Share2, UserPlus, Users, Pencil, Archive, Undo, Copy, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ShareGroupDialog } from "@/components/share-group-dialog"
import { AddMemberDialog } from "@/components/add-member-dialog"
import { ManageMembersDialog } from "@/components/manage-members-dialog"
import { EditGroupTitleDialog } from "@/components/edit-group-title-dialog"
import { CopyGroupDialog } from "@/components/copy-group-dialog"
import { archiveGroup, unarchiveGroup, deleteGroup } from "@/app/actions/group-actions"
import type { Group } from "@/core/entities/Group"
import type { Balance } from "@/core/entities/Balance"

interface GroupMenuProps {
  group: Group
  balances: Balance[]
  onGroupUpdated: () => void
  onMemberAdded: () => void
  onMemberRemoved: () => void
}

export function GroupMenu({ 
  group, 
  balances, 
  onGroupUpdated, 
  onMemberAdded, 
  onMemberRemoved 
}: GroupMenuProps) {
  const router = useRouter()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [manageMembersDialogOpen, setManageMembersDialogOpen] = useState(false)
  const [editGroupTitleDialogOpen, setEditGroupTitleDialogOpen] = useState(false)
  const [copyGroupDialogOpen, setCopyGroupDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const canArchive = balances.every((b) => Math.abs(b.netBalance) < 0.01)

  const handleShareClick = () => {
    setShareDialogOpen(true)
    setDropdownOpen(false)
  }

  const handleAddMemberClick = () => {
    setAddMemberDialogOpen(true)
    setDropdownOpen(false)
  }

  const handleManageMembersClick = () => {
    setManageMembersDialogOpen(true)
    setDropdownOpen(false)
  }

  const handleEditGroupTitleClick = () => {
    setEditGroupTitleDialogOpen(true)
    setDropdownOpen(false)
  }

  const handleCopyGroupClick = () => {
    setCopyGroupDialogOpen(true)
    setDropdownOpen(false)
  }

  const handleGroupCopied = (newGroupId: string) => {
    onGroupUpdated()
    setCopyGroupDialogOpen(false)
  }

  const handleGroupTitleUpdated = () => {
    onGroupUpdated()
    setEditGroupTitleDialogOpen(false)
  }

  const handleArchiveClick = async () => {
    if (group) {
      try {
        await archiveGroup(group.id)
        router.push("/grupos")
      } catch (error) {
        console.error("Error archiving group:", error)
      }
    }
  }

const handleUnarchiveClick = async () => {
  if (group) {
    try {
      await unarchiveGroup(group.id)
      onGroupUpdated()
    } catch (error) {
      console.error("Error unarchiving group:", error)
    }
  }
}

const handleDeleteClick = async () => {
  if (group) {
    try {
      await deleteGroup(group.id)
      router.push("/grupos")
    } catch (error) {
      console.error("Error deleting group:", error)
    }
  }
}

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleShareClick}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddMemberClick}>
            <UserPlus className="h-4 w-4 mr-2" />
            Añadir persona
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleManageMembersClick}>
            <Users className="h-4 w-4 mr-2" />
            Gestionar miembros
          </DropdownMenuItem>
<DropdownMenuItem onClick={handleEditGroupTitleClick}>
      <Pencil className="h-4 w-4 mr-2" />
      Editar grupo
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleCopyGroupClick}>
      <Copy className="h-4 w-4 mr-2" />
      Copiar grupo
    </DropdownMenuItem>
{group.archived ? (
  <>
    <DropdownMenuItem onClick={handleUnarchiveClick}>
      <Undo className="h-4 w-4 mr-2" />
      Desarchivar
    </DropdownMenuItem>
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setDeleteDialogOpen(true); setDropdownOpen(false); }}>
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar grupo
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de que quieres eliminar el grupo?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará el grupo "{group.name}" y todos sus datos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteClick} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
) : (
  <DropdownMenuItem onClick={handleArchiveClick} disabled={!canArchive}>
    <Archive className="h-4 w-4 mr-2" />
    Archivar
  </DropdownMenuItem>
)}
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareGroupDialog
        groupName={group.name}
        groupCode={group.code}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
      
      <AddMemberDialog
        group={group}
        onMemberAdded={onMemberAdded}
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
      />
      
      <ManageMembersDialog
        open={manageMembersDialogOpen}
        onOpenChange={setManageMembersDialogOpen}
        group={group}
        balances={balances}
        onMemberRemoved={onMemberRemoved}
      />
      
<EditGroupTitleDialog
      group={group}
      open={editGroupTitleDialogOpen}
      onOpenChange={setEditGroupTitleDialogOpen}
      onGroupUpdated={handleGroupTitleUpdated}
    />

    <CopyGroupDialog
      sourceGroup={group}
      open={copyGroupDialogOpen}
      onOpenChange={setCopyGroupDialogOpen}
      onGroupCopied={handleGroupCopied}
    />
  </>
)
}
