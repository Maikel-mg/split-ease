# Specification: Copy Group Feature

## Change Name
`copy-group`

## Overview
Permite a los usuarios crear una copia de un grupo existente, incluyendo todos sus miembros, desde el menú de opciones del grupo.

## Requirements

### R1: Opción en el Menú
- El menú dropdown del grupo (ícono de tres puntos) debe incluir una opción "Copiar grupo"
- La opción debe estar ubicada después de "Editar grupo" y antes de "Archivar/Desarchivar"

### R2: Dialog de Copia
- Al hacer clic en "Copiar grupo", se abre un diálogo
- El diálogo debe contener:
  - Título: "Copiar grupo"
  - Campo de texto para el nuevo nombre del grupo (prellenado con "{nombre original} (copia)")
  - Información showing "Se copian X miembros del grupo original"
  - Botón "Cancelar"
  - Botón "Copiar grupo"

### R3: Validación del Nombre
- El nombre del nuevo grupo no puede estar vacío
- El nombre debe tener entre 1 y 100 caracteres

### R4: Creación del Grupo
- Al confirmar, se crea un nuevo grupo con:
  - El nombre ingresado por el usuario
  - Un código único generado automáticamente
  - Todos los miembros del grupo original (copiados por nombre)
- El grupo original permanece sin cambios

### R5: Feedback al Usuario
- Al crear exitosamente, mostrar toast: "Grupo copiado correctamente"
- Redireccionar a la página del nuevo grupo o mostrarlo en la lista

### R6: Manejo de Errores
- Si falla la creación, mostrar toast de error con mensaje claro

## User Flows

### Flow Principal
1. Usuario está en la página de un grupo o en la lista de grupos
2. Usuario hace clic en el menú de tres puntos del grupo
3. Selecciona "Copiar grupo"
4. Se abre el diálogo con el nombre propuesto
5. Usuario modifica el nombre si desea
6. Usuario hace clic en "Copiar grupo"
7. Se crea el nuevo grupo con los mismos miembros
8. Usuario recibe feedback de éxito

## Acceptance Criteria

| ID | Criteria | Test |
|----|----------|------|
| AC1 | La opción "Copiar grupo" aparece en el menú dropdown | Visual verification |
| AC2 | El diálogo se abre al hacer clic | Visual verification |
| AC3 | El campo de nombre está prellenado con "{nombre} (copia)" | Visual verification |
| AC4 | No se puedeSubmit con nombre vacío | Form validation |
| AC5 | El nuevo grupo se crea con los mismos miembros | Create group and verify members |
| AC6 | El grupo original permanece sin cambios | Verify original group |
| AC7 | Toast de éxito aparece tras copiar | Visual verification |
| AC8 | Manejo de errores funciona correctamente | Test with error simulation |

## Out of Scope
- Copiar gastos del grupo original
- Copiar pagos del grupo original
- Copiar configuración de privacidad (el nuevo grupo usa默认值 false)