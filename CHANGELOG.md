# Changelog

Todos los cambios notables en este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/),
y este proyecto adherisce a [Semantic Versioning](https://semver.org/lang/es/).

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
