# Tasks: Copy Group Feature

## Change Name
`copy-group`

## Task List

### Phase 1: Backend

- [x] **T1**: Add `copyGroup` server action in `app/actions/group-actions.ts`
  - Accept: `sourceGroupId`, `newGroupName`
  - Fetch source group from DB
  - Extract member names from source group
  - Call `createGroupWithMembers` with member names
  - Return new group ID on success
  - Handle and propagate errors

### Phase 2: Frontend - Dialog Component

- [x] **T2**: Create `components/copy-group-dialog.tsx`
  - Based on `edit-group-title-dialog.tsx`
  - Props: `sourceGroup`, `open`, `onOpenChange`, `onGroupCopied`
  - State: newGroupName (prefilled with "{name} (copia)")
  - Show member count info: "Se copian X miembros"
  - Validation: name required, max 100 chars
  - Call `copyGroup` server action on confirm
  - Show loading state while copying
  - Handle errors with toast

### Phase 3: Frontend - Menu Integration

- [x] **T3**: Modify `components/group-menu.tsx`
  - Import `Copy` icon from lucide-react
  - Import `CopyGroupDialog` component
  - Add state: `copyGroupDialogOpen`
  - Add handler: `handleCopyGroupClick`
  - Add dropdown menu item: "Copiar grupo" with Copy icon
  - Place after "Editar grupo", before "Archivar"
  - Add CopyGroupDialog component at bottom

### Phase 4: Testing & Polish

- [x] **T4**: Test the complete flow
  - Click "Copiar grupo" in dropdown ✅
  - Verify dialog opens with prefilled name ✅
  - Verify member count is shown ✅
  - Select member identity ✅
  - Submit and verify new group is created ✅
  - Verify new group has same members ✅
  - Verify group appears in "Mis Grupos" ✅
  - Verify original group is unchanged ✅

## Dependencies
- T1 must be completed before T2 (T2 calls the server action)
- T2 must be completed before T3 (T3 imports T2)

## Notes
- Use existing patterns from `edit-group-title-dialog.tsx`
- Reuse `useToast` hook for feedback
- The userId should come from the parent component or context