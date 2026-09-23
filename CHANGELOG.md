# Changelog

Todos los cambios notables en este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/),
y este proyecto adherisce a [Semantic Versioning](https://semver.org/lang/es/).

## [v2026_09_23] - 2026-09-23

### Added

- **Celebración del grupo saldado** — Cuando todas las cuentas del grupo quedan a cero, la pestaña "Saldar" muestra una tarjeta de "¡Misión cumplida!" con confeti y un botón para enviar el resultado al grupo por WhatsApp, con mensaje e imagen. Se celebra una vez por hito; si el grupo vuelve a tener deudas, se gana de nuevo.
- **Tarjeta de liquidación** — Imagen cuadrada que resume el cierre del grupo, generada en el propio dispositivo y enviada por la hoja nativa de compartir, sin depender de un servidor.

### Fixed

- **Notificaciones invisibles** — El componente que dibuja los avisos no se renderizaba en ninguna parte, así que ningún aviso llegaba a verse. Ahora está montado a nivel global.
- **Errores de tipos** — Corregidos los fallos de comprobación de tipos en la página de inicio, el formulario de unirse a un grupo y el botón, sin recurrir a `any` ni a supresiones.
- **Errores de TypeScript silenciados en el build** — El build ya no ignora los errores de tipos, así que un fallo real rompe la compilación en lugar de pasar desapercibido.

### Removed

- **Repositorios locales de prueba** — Eliminados los tres repositorios `LocalStorage*`, que ya no cumplían sus puertos y no se usaban.
- **Acción sin uso** — Eliminada `getUserGroups`, una acción de servidor sin llamadas y ya rota.
- **Registros de depuración** — Eliminados los registros de consola con marca `[v0]` repartidos por la aplicación.

## [v2026_09_19] - 2026-09-19

### Changed

- **Nuevo sistema visual en toda la app** — Rediseño completo de la identidad: paleta propia, tipografía Gabarito y un lenguaje de color con significado (verde y rojo para la dirección del saldo, un color por persona para identificarla, ámbar solo para avisos).
- **Página de grupo** — Las cinco pestañas (Mi estado, Saldos, Gastos, Validación y Saldar) siguen el mismo lenguaje: listas sin tarjetas, cada miembro con su color y los importes en formato español con signo. El saldo propio se muestra al entrar, en "Mi estado".
- **Resto de pantallas** — Bienvenida, acceso, alta, perfil, unirse a un grupo por enlace y todos los diálogos adoptan el mismo estilo.
- **Modo oscuro** — Repasado por completo: superficies, colores de persona y tintes de saldo tienen variante propia para fondo oscuro.
- **Aviso de pagos registrados** — Reducido a una línea para no ocupar la pantalla principal; la explicación larga se mantiene en el tour de validación.

### Fixed

- **Controles de formulario invisibles** — Los bordes de checkboxes, campos y selectores no se distinguían del fondo; ahora tienen contraste suficiente.
- **Botones secundarios** — La variante de botón con borde se confundía con texto suelto; ahora tiene relleno y borde visibles.

### Removed

- **Componente de deudas simplificadas sin usar** — Se elimina código muerto que quedaba del diseño anterior.

## [v2026_09_18_2] - 2026-09-18

### Added

- **Ayuda contextual en la validación** — Icono de información en la sección de validación que explica qué es validar. Funciona con hover en escritorio y con toque en móvil (donde no existe el hover).
- **Tour de la validación** — Tour enfocado en la validación de gastos y pagos, lanzable desde el aviso de pagos registrados y desde el paso "Validación" del tour del grupo.

## [v2026_09_18_1] - 2026-09-18

### Added

- **Tour de bienvenida** — Guía de 3 pasos en la pantalla inicial que explica cómo crear un grupo o unirse a uno existente con un código. Se muestra una sola vez por dispositivo y puede repetirse desde "Ver cómo funciona".
- **Tour del grupo** — Guía de coach-marks que explica el menú, el nombre del grupo, cómo añadir un gasto y para qué sirve cada pestaña. Se adapta al tipo de grupo (6 pasos en grupos privados y 8 en públicos con validación) y puede repetirse desde el menú del grupo.

## [v2026-06-24]

### Added

- **Compartir deudas por WhatsApp/Bizum** — Nueva opción "Compartir deudas" en el menú del grupo que formatea las deudas simplificadas como texto plano (`Deudor → Acreedor: XX.XX€`) y las comparte vía Web Share API (móvil) con fallback a portapapeles (escritorio). Incluye 7 tests unitarios. ([#5](https://github.com/Maikel-mg/split-ease/issues/5), [#6](https://github.com/Maikel-mg/split-ease/issues/6), [#7](https://github.com/Maikel-mg/split-ease/issues/7))

## [v2026_05_05] - 2026-05-05

### Added

- Copiar grupo — permite duplicar un grupo existente con todos sus miembros
- Botón de búsqueda en la página de grupo para filtrar gastos, saldos y deudas
- Gestión de miembros — agregar y eliminar miembros del grupo
- Edición del nombre del grupo
- Historial de pagos con opción de eliminar pagos registrados
- Imagen de perfil por defecto con iniciales del usuario
- Tema claro/oscuro con toggle en la página de perfil

### Changed

- Mejora en el cálculo de deudas simplificadas
- Interfaz de usuario actualizada con componentes shadcn/ui

### Fixed

- Corrección en el cálculo de balances para grupos privados
- Corrección en la visualización de deudas para miembros específicos

## [v2026_05_04] - 2026-05-04

### Added

- Sistema de autenticación con Supabase Auth
- Login con email/password y Google OAuth
- Perfil de usuario con nombre personalizado
- Modelo de grupos privados con código de invitación
- Registro de gastos con división equitativa, por acciones o por montos personalizados
- Cálculo automático de deudas simplificadas
- Registro de pagos para saldar deudas
