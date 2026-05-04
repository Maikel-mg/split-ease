# Technical Design: Copy Group Feature

## Change Name
`copy-group`

## Architecture Overview

### Opción Elegida
Usar la Server Action existente `createGroupWithMembers` directamente, simplificando la implementación.

### Components to Modify/Create

#### 1. Server Action: `copyGroup`
**File**: `app/actions/group-actions.ts`

```typescript
export async function copyGroup(sourceGroupId: string, newGroupName: string, userId: string) {
  // 1. Obtener el grupo source
  // 2. Extraer los nombres de los miembros
  // 3. Llamar a createGroupWithMembers con los mismos miembros
  // 4. Retornar el ID del nuevo grupo
}
```

#### 2. Component: `CopyGroupDialog`
**File**: `components/copy-group-dialog.tsx`

Basado en `edit-group-title-dialog.tsx`:
- Campo de texto para nombre del nuevo grupo
- Información de miembros a copiar
- Estados: idle, loading, error

#### 3. Component Modification: `GroupMenu`
**File**: `components/group-menu.tsx`

Agregar:
- Import de `Copy` de lucide-react
- Import de `CopyGroupDialog`
- Estado `copyGroupDialogOpen`
- Handler `handleCopyGroupClick`
- Nueva opción en el dropdown menu

## Data Flow

```
User clicks "Copy Group" 
  → GroupMenu opens CopyGroupDialog
  → User enters new name and confirms
  → CopyGroupDialog calls copyGroup server action
  → copyGroup fetches source group, extracts members
  → copyGroup calls createGroupWithMembers(name, memberNames, false)
  → New group created in DB
  → Toast success, navigate to new group
```

## API/Interface Contracts

### copyGroup Server Action
```typescript
copyGroup(sourceGroupId: string, newGroupName: string, userId: string): Promise<{ success: boolean, newGroupId?: string, error?: string }>
```

### CopyGroupDialog Props
```typescript
interface CopyGroupDialogProps {
  sourceGroup: Group      // Grupo original a copiar
  open: boolean
  onOpenChange: (open: boolean) => void
  onGroupCopied: (newGroupId: string) => void  // Callback cuando se copia exitosamente
}
```

## Edge Cases
- **Grupo sin miembros**: Mostrar mensaje "El grupo no tiene miembros para copiar"
- **Nombre duplicado**: Permitir nombres duplicados (no hay restricción)
- **Nombre muy largo**: Truncar en UI, validar max 100 chars
- **Error de red**: Mostrar toast de error apropiado

## Dependencies
- `createGroupWithMembers` - ya existe
- `getGroupService` / `GroupRepository.getGroup` - para obtener miembros
- shadcn/ui Dialog - ya se usa en el proyecto
- lucide-react icons - ya se usa

## Testing Considerations
- Verificar que los miembros se copian correctamente
- Verificar que el grupo original no se modifica
- Verificar manejo de errores