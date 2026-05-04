# Proposal: Copy Group Feature

## Change Name
`copy-group`

## Intent
Agregar la funcionalidad de copiar un grupo existente, incluyendo sus miembros, desde el menú de opciones del grupo.

## Scope
- **Frontend**: Nuevo componente de diálogo `CopyGroupDialog`, opción en `GroupMenu`
- **Backend**: Nueva Server Action `copyGroup` en `group-actions.ts`
- **Usuario puede**: Crear una copia de un grupo con los mismos miembros pero diferente nombre

## Out of Scope
- Copiar gastos del grupo original (solo se copian los miembros)
- Copiar pagos del grupo original
- Copiar balances

## Approach
**Opción 1 (Recomendada)**: Implementación simple usando Server Action existente
- Agregar opción "Copiar grupo" en el menú dropdown de `GroupMenu`
- Crear diálogo para ingresar nombre del nuevo grupo
- Usar `createGroupWithMembers` existente para crear el nuevo grupo con los miembros del original

**Pros**: 
- Bajo esfuerzo, reuse de código existente
- Patrón ya establecido en el proyecto

**Contras**:
- Ninguno significativo

**Esfuerzo**: Low

## Dependencies
- `createGroupWithMembers` ya existe en `app/actions/group-actions.ts`
- Patrón de diálogos ya establecido (shadcn/ui)
- Grupo actual debe tener miembros para copiar

## Risks
- Obtener el `userId` del contexto actual para la creación del nuevo grupo
- El código del nuevo grupo debe ser único (ya manejado por `createGroupWithMembers`)