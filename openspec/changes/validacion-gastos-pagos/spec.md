# Specification: Validación de gastos y pagos

## Change Name
`validacion-gastos-pagos`

## Overview
Cada miembro de un grupo confirma dentro de la app que los gastos y pagos que le afectan son correctos, antes de que el grupo empiece a saldar. Hoy ese visto bueno se recoge por WhatsApp y se lía: alguien manda el Bizum antes de que los demás hayan revisado y hay que deshacerlo. La app pasa a mostrar el estado de validación de cada miembro y a avisar cuando se va a mover el plan de pagos con Bizums ya hechos.

El concepto se llama **validación**. El lenguaje completo está en `CONTEXT.md`; este documento no lo repite.

## Requirements

### R1: Alcance
- La validación existe **únicamente en grupos públicos** (`isPrivate === false`).
- Un grupo sorpresa no muestra ninguna interfaz de validación y el caso de uso rechaza cualquier intento.

### R2: Acto de validar
- Un miembro valida cuando confirma que los gastos y pagos que le afectan son correctos y que acepta el reparto resultante.
- Validar guarda la huella del estado de gastos del grupo en ese momento (ver R12).

### R3: Quién puede validar
- Cada miembro valida **únicamente lo suyo**. Nadie puede validar en nombre de otro.
- Un miembro que no participa en ningún gasto (ni como pagador ni como participante) no puede validar y ve un mensaje que se lo explica.

### R4: Retirar la validación
- Un miembro puede retirar su propia validación en cualquier momento, incluso si ya había validado antes.

### R5: Quién cuenta para la validación completa
- Cuenta todo miembro que participa en al menos un gasto, como pagador o como participante.
- Un miembro que no participa en ningún gasto queda excluido y no bloquea la validación completa.

### R6: Estado de validación completa
- El grupo está completo cuando hay al menos un gasto y todos los miembros elegibles tienen una validación vigente.
- Un grupo sin gastos no está completo ni muestra el contador.
- El contador visible es "Validación X/Y" y aparece solo cuando el grupo tiene al menos un gasto.
- La interfaz distingue tres situaciones por miembro: pendiente, validó pero ha cambiado algo desde entonces, y validado.

### R7: Invalidación por cambio de gasto
- Cambiar el **importe, el pagador, los participantes, el modo de reparto o el reparto** de cualquier gasto invalida **todas** las validaciones del grupo, no solo las de los implicados.
- Lo mismo al crear o borrar un gasto.

### R8: Cambios que no invalidan
- Cambiar la descripción, la fecha o la imagen de un gasto **no** invalida ninguna validación.
- Registrar un pago **no** invalida ninguna validación.
- Renombrar o archivar el grupo no invalida ninguna validación.

### R9: Aviso de pagos descolgados
- Mientras haya pagos registrados y la validación no esté completa, el grupo muestra un aviso visible explicando que un cambio de gastos puede dejar esos pagos descolgados.
- El aviso desaparece cuando la validación se completa.

### R10: Confirmación al guardar con pagos existentes
- Si ya hay pagos registrados, guardar un gasto exige una **confirmación explícita y visible antes de guardar**, con opción de cancelar.
- La app no deshace pagos ni modifica Bizums: la resolución es social.

### R11: Sin notas ni rechazos
- No existe campo de comentario, ni estado de rechazo, ni notificación push. No validar es la única señal de disconformidad.

### R12: Vigencia derivada, sin lógica en la base de datos
- La vigencia de una validación **no se almacena**: se deriva comparando la huella guardada al validar con la huella actual de los gastos del grupo.
- La huella se construye solo con los campos de R7, de forma canónica: el orden de las claves del reparto, el orden de los participantes y el orden de la lista de gastos no deben cambiarla.
- No se admiten triggers, funciones ni lógica de invalidación en Postgres.

### R13: Interfaz
- La pestaña **Mi estado** muestra el saldo propio, lo que hay que pagar y a quién, lo que le deben a uno, el desglose de los gastos propios y el botón de validar (que pasa a "Retirar la validación" una vez validado).
- La pestaña **Validación** contiene el listado de quién ha validado y quién no, con los pendientes primero.
- Los grupos públicos tienen cinco pestañas, en este orden: **Mi estado, Saldos, Gastos, Validación, Saldar**.
- Los grupos sorpresa mantienen tres: Saldos, Gastos, Saldar.
- Los nombres de los miembros aparecen **solo** dentro de la pestaña Validación. La cabecera muestra el contador, nunca nombres, para que un grupo de quince no rompa el layout.
- El listado debe seguir siendo legible con quince miembros.

### R14: Vocabulario de la interfaz
- La interfaz usa "validación", "validar", "validado" y "pendiente de validar".
- No se usan "firma", "visto bueno", "OK", "confirmación" ni "aprobación" para este concepto.

## User Flows

### Flujo principal
1. Un miembro entra al grupo y aterriza en **Mi estado**.
2. Revisa su saldo, sus deudas y el desglose de sus gastos.
3. Pulsa "He revisado mis gastos y pagos".
4. Su validación aparece en la pestaña **Validación** y el contador de la cabecera sube.
5. Cuando validan todos, el contador indica que está completo y el grupo puede saldar.

### Flujo: alguien cambia un gasto después de validar
1. El grupo tenía validaciones vigentes.
2. Alguien edita el importe de un gasto.
3. El contador cae a cero: todas las validaciones del grupo quedan obsoletas.
4. Quien había validado ve que ha cambiado algo y puede volver a validar.

### Flujo: un gasto cambia con Bizums ya hechos
1. Hay pagos registrados y la validación está incompleta: el grupo muestra el aviso.
2. Alguien intenta guardar un gasto y se le pide confirmación explícita.
3. Si confirma, el plan de pagos cambia y los afectados tendrán que rechazar sus Bizums y volver a empezar. La app solo lo hace visible.

## Acceptance Criteria

| ID | Criteria | Test |
|----|----------|------|
| AC1 | Un grupo sorpresa no muestra ninguna pestaña de validación y el caso de uso la rechaza | Test unitario (`ValidatePlanUseCase.test.ts`) |
| AC2 | Se puede validar y retirar la propia validación | Manual |
| AC3 | Un miembro sin participación no puede validar y ve el motivo | Test unitario + manual |
| AC4 | Un miembro sin participación no bloquea la validación completa | Test unitario (`ValidationService.test.ts`) |
| AC5 | El contador solo aparece con al menos un gasto | Manual |
| AC6 | Se distingue pendiente / desactualizado / validado | Test unitario + manual |
| AC7 | Cambiar importe, pagador, participantes, modo o reparto invalida a todo el grupo | Test unitario |
| AC8 | Cambiar descripción, fecha o imagen no invalida | Test unitario |
| AC9 | Registrar un pago no invalida | Test unitario |
| AC10 | El aviso aparece con pagos y validación incompleta, y desaparece al completarse | Manual |
| AC11 | Guardar con pagos existentes exige confirmación explícita | Manual |
| AC12 | La huella es estable ante reordenaciones de reparto, participantes y lista de gastos | Test unitario |
| AC13 | Cinco pestañas en públicos en el orden acordado; tres en sorpresa | Manual |
| AC14 | Los nombres solo aparecen en la pestaña Validación | Manual |
| AC15 | Con quince miembros el listado sigue siendo legible | Manual |

## Out of Scope
- Grupos sorpresa: la validación no existe ahí.
- Notificaciones push (iOS solo las admite con la PWA instalada en la pantalla de inicio, y no hay service worker).
- Notas de error o estado de rechazo con comentario.
- Identificar los pagos concretos que quedaron descolgados y quién los hizo (issue #10, aparcado).
- Mover al servidor el requisito de saldos a cero para archivar (issue #9, trabajo aparte).
- Verificar la identidad de quien valida: el acceso es por enlace y el miembro se identifica eligiendo su nombre. Ver `docs/adr/0001-validacion-sin-identidad-verificada.md`.
