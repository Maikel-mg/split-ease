# 💰 Aplicación de Gestión de Gastos Compartidos

## 📖 Descripción del Proyecto

Esta aplicación web te permite gestionar gastos compartidos con amigos, familiares o compañeros de piso de manera sencilla y transparente. Es perfecta para viajes en grupo, cenas compartidas, gastos del hogar o cualquier situación donde varias personas comparten gastos.

### ¿Qué puedes hacer con esta aplicación?

**Gestión de Grupos:**
- **Crear grupos** para diferentes situaciones (viajes, cenas, gastos del piso, etc.)
- **Unirte a grupos existentes** usando un código de invitación
- **Ver todos tus grupos** en una pantalla principal con información resumida
- **Gestionar miembros** del grupo y ver quién participa en cada gasto

**Registro de Gastos:**
- **Añadir gastos** indicando quién pagó, cuánto y quiénes participan
- **Dividir gastos** de forma equitativa o personalizada entre los participantes
- **Ver historial completo** de todos los gastos del grupo con fechas y descripciones
- **Filtrar y buscar** gastos específicos

**Cálculo de Deudas:**
- **Visualizar balances** de cada miembro del grupo (quién debe y a quién)
- **Calcular deudas simplificadas** para minimizar el número de transacciones necesarias
- **Ver deudas pendientes** de forma clara con colores (rojo si debes, verde si te deben)
- **Registrar pagos** para saldar deudas entre miembros

**Gestión de Perfil:**
- **Crear tu perfil** con un nombre visible que aparecerá en lugar de tu email
- **Iniciar sesión** con email y contraseña o con tu cuenta de Google
- **Actualizar tu información** personal en cualquier momento

### Ejemplo de uso:

Imagina que vas de viaje con 4 amigos. Uno paga el hotel (€400), otro paga la gasolina (€80), y tú pagas las comidas (€120). La aplicación calcula automáticamente cuánto debe cada persona y te muestra la forma más simple de saldar las cuentas. Por ejemplo, en lugar de hacer 6 transferencias diferentes, te dirá que solo necesitas hacer 2 o 3 pagos para que todos queden a mano.

---

## 🛠️ Descripción Tecnológica

### Stack Tecnológico

**Frontend:**
- **Next.js 14** - Framework React con App Router para renderizado híbrido (SSR/CSR)
- **React 19** - Biblioteca de interfaz de usuario con hooks modernos
- **TypeScript 5** - Tipado estático para mayor seguridad y mantenibilidad
- **Tailwind CSS 4** - Framework CSS utility-first para diseño responsive
- **shadcn/ui** - Componentes UI accesibles basados en Radix UI
- **Lucide React** - Iconos SVG optimizados

**Backend & Base de Datos:**
- **Supabase** - Backend as a Service (BaaS) con PostgreSQL
- **Supabase Auth** - Sistema de autenticación con email/password y OAuth (Google)
- **Supabase SSR** - Gestión de sesiones en Next.js con cookies
- **Row Level Security (RLS)** - Políticas de seguridad a nivel de base de datos

**Arquitectura:**
- **Clean Architecture** - Separación en capas (Entities, Ports, Adapters, Services)
- **Repository Pattern** - Abstracción de acceso a datos
- **Domain-Driven Design** - Lógica de negocio en servicios de dominio
- **Server Actions** - Operaciones del servidor con Next.js 14

**Herramientas de Desarrollo:**
- **pnpm** - Gestor de paquetes rápido y eficiente
- **ESLint** - Linter para mantener código consistente
- **PostCSS** - Procesador CSS para Tailwind

### Estructura del Proyecto

\`\`\`
├── app/                    # Rutas y páginas de Next.js (App Router)
│   ├── actions/           # Server Actions para operaciones del servidor
│   ├── auth/              # Páginas de autenticación (login, registro)
│   ├── group/[id]/        # Página dinámica de detalle de grupo
│   ├── grupos/            # Página de lista de grupos
│   └── profile/           # Página de perfil de usuario
├── components/            # Componentes React reutilizables
│   └── ui/               # Componentes UI de shadcn
├── core/                  # Capa de dominio (Clean Architecture)
│   ├── entities/         # Entidades del dominio (Group, Expense, etc.)
│   └── ports/            # Interfaces de repositorios
├── data/                  # Capa de datos (Adapters)
│   └── repositories/     # Implementaciones de repositorios
├── domain/                # Servicios de dominio
│   └── services/         # Lógica de negocio
├── lib/                   # Utilidades y configuraciones
│   └── supabase/         # Clientes de Supabase (client, server, middleware)
├── scripts/               # Scripts SQL para base de datos
└── middleware.ts          # Middleware de Next.js para autenticación
\`\`\`

---

## 🚀 Guía de Instalación y Desarrollo

Esta guía te ayudará a instalar y ejecutar el proyecto en tu computadora, incluso si no tienes experiencia técnica previa.

### Paso 1: Requisitos Previos

Antes de comenzar, necesitas instalar los siguientes programas en tu computadora:

#### 1.1 Instalar Node.js

Node.js es el entorno que permite ejecutar JavaScript en tu computadora.

1. Ve a [https://nodejs.org](https://nodejs.org)
2. Descarga la versión **LTS** (Long Term Support) - es la más estable
3. Ejecuta el instalador y sigue las instrucciones
4. Para verificar que se instaló correctamente, abre una terminal/consola y escribe:
   \`\`\`bash
   node --version
   \`\`\`
   Deberías ver algo como `v20.x.x`

#### 1.2 Instalar pnpm

pnpm es el gestor de paquetes que usaremos para instalar las dependencias del proyecto.

1. Abre una terminal/consola
2. Ejecuta el siguiente comando:
   \`\`\`bash
   npm install -g pnpm
   \`\`\`
3. Verifica la instalación:
   \`\`\`bash
   pnpm --version
   \`\`\`
   Deberías ver algo como `9.x.x`

#### 1.3 Instalar Git (opcional pero recomendado)

Git te permite descargar el proyecto y gestionar versiones del código.

1. Ve a [https://git-scm.com](https://git-scm.com)
2. Descarga e instala Git para tu sistema operativo
3. Verifica la instalación:
   \`\`\`bash
   git --version
   \`\`\`

### Paso 2: Descargar el Proyecto

Tienes dos opciones para obtener el código del proyecto:

#### Opción A: Usando Git (recomendado)

1. Abre una terminal/consola
2. Navega a la carpeta donde quieres guardar el proyecto:
   \`\`\`bash
   cd Documentos
   \`\`\`
3. Clona el repositorio (reemplaza la URL con la de tu proyecto):
   \`\`\`bash
   git clone [URL_DEL_REPOSITORIO]
   \`\`\`
4. Entra a la carpeta del proyecto:
   \`\`\`bash
   cd [nombre-del-proyecto]
   \`\`\`

#### Opción B: Descarga directa

1. Descarga el archivo ZIP del proyecto desde GitHub o donde esté alojado
2. Descomprime el archivo en una carpeta de tu elección
3. Abre una terminal/consola y navega a esa carpeta:
   \`\`\`bash
   cd ruta/a/tu/carpeta/del/proyecto
   \`\`\`

### Paso 3: Instalar Dependencias

Las dependencias son todas las bibliotecas y herramientas que el proyecto necesita para funcionar.

1. Asegúrate de estar en la carpeta del proyecto
2. Ejecuta el siguiente comando:
   \`\`\`bash
   pnpm install
   \`\`\`
3. Espera a que termine (puede tardar unos minutos)
4. Verás que se crea una carpeta llamada `node_modules` con todas las dependencias

### Paso 4: Configurar la Base de Datos (Supabase)

El proyecto usa Supabase como base de datos. Necesitas crear una cuenta y configurar tu proyecto.

#### 4.1 Crear cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project" y crea una cuenta (puedes usar GitHub)
3. Crea un nuevo proyecto:
   - Dale un nombre (ej: "gastos-compartidos")
   - Elige una contraseña para la base de datos (guárdala en un lugar seguro)
   - Selecciona una región cercana a ti

#### 4.2 Obtener las credenciales

1. En tu proyecto de Supabase, ve a **Settings** (Configuración) → **API**
2. Encontrarás dos valores importantes:
   - **Project URL**: algo como `https://xxxxx.supabase.co`
   - **anon/public key**: una clave larga que empieza con `eyJ...`

#### 4.3 Configurar variables de entorno

1. En la carpeta del proyecto, crea un archivo llamado `.env.local`
2. Abre el archivo con un editor de texto (Notepad, VS Code, etc.)
3. Copia y pega lo siguiente, reemplazando con tus valores:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Development Redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

**Nota:** El `SUPABASE_SERVICE_ROLE_KEY` lo encuentras en la misma página de API, pero en la sección "service_role key" (¡mantén esta clave en secreto!).

#### 4.4 Ejecutar scripts de base de datos

El proyecto incluye scripts SQL para crear las tablas necesarias.

1. Ve a tu proyecto de Supabase
2. Abre el **SQL Editor** (Editor SQL)
3. Ejecuta los scripts en orden (están en la carpeta `scripts/`):
   - `001_create_tables.sql`
   - `002_enable_rls.sql`
   - `003_create_group_members_table.sql`
   - `007_disable_group_members_rls.sql`
   - `008_create_profiles_table.sql`

Para ejecutar cada script:
1. Abre el archivo en tu editor de texto
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en "Run" (Ejecutar)

#### 4.5 Configurar autenticación con Google (opcional)

Si quieres permitir login con Google:

1. En Supabase, ve a **Authentication** → **Providers**
2. Busca "Google" y actívalo
3. Necesitarás crear credenciales en [Google Cloud Console](https://console.cloud.google.com):
   - Crea un nuevo proyecto
   - Habilita la API de Google+
   - Crea credenciales OAuth 2.0
   - Copia el Client ID y Client Secret a Supabase

### Paso 5: Ejecutar el Proyecto

¡Ya casi está todo listo! Ahora vamos a iniciar el servidor de desarrollo.

1. En la terminal, asegúrate de estar en la carpeta del proyecto
2. Ejecuta el comando:
   \`\`\`bash
   pnpm dev
   \`\`\`
3. Verás un mensaje como:
   \`\`\`
   ▲ Next.js 14.2.25
   - Local:        http://localhost:3000
   - Ready in 2.3s
   \`\`\`
4. Abre tu navegador web y ve a: **http://localhost:3000**
5. ¡Deberías ver la aplicación funcionando!

### Paso 6: Crear tu Primera Cuenta

1. En la aplicación, haz clic en "Registrarse"
2. Ingresa tu nombre, email y contraseña
3. Revisa tu email para confirmar la cuenta (si está configurado)
4. Inicia sesión y comienza a usar la aplicación

### Comandos Útiles

Una vez que tengas todo configurado, estos son los comandos más útiles:

\`\`\`bash
# Iniciar el servidor de desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Iniciar el servidor de producción (después de build)
pnpm start

# Verificar errores de código
pnpm lint
\`\`\`

### Solución de Problemas Comunes

#### Error: "Cannot find module"
- **Solución:** Ejecuta `pnpm install` de nuevo

#### Error: "Port 3000 is already in use"
- **Solución:** Cierra otras aplicaciones que usen el puerto 3000, o cambia el puerto:
  \`\`\`bash
  pnpm dev -p 3001
  \`\`\`

#### Error: "Auth session missing"
- **Solución:** Verifica que las variables de entorno en `.env.local` sean correctas

#### La página no carga o muestra errores
- **Solución:** 
  1. Verifica que Supabase esté funcionando
  2. Asegúrate de haber ejecutado todos los scripts SQL
  3. Revisa la consola del navegador (F12) para ver errores específicos

### Estructura de Desarrollo

Si quieres contribuir al proyecto, aquí hay algunos consejos:

**Archivos importantes:**
- `app/` - Aquí están las páginas y rutas
- `components/` - Componentes reutilizables de React
- `lib/supabase/` - Configuración de Supabase
- `scripts/` - Scripts SQL para la base de datos

**Flujo de trabajo recomendado:**
1. Crea una rama nueva para tu funcionalidad: `git checkout -b mi-nueva-funcionalidad`
2. Haz tus cambios y pruébalos localmente
3. Haz commit de tus cambios: `git commit -m "Descripción de los cambios"`
4. Sube tus cambios: `git push origin mi-nueva-funcionalidad`
5. Crea un Pull Request para revisión

### Recursos Adicionales

- **Documentación de Next.js:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **Documentación de Supabase:** [https://supabase.com/docs](https://supabase.com/docs)
- **Documentación de Tailwind CSS:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Documentación de shadcn/ui:** [https://ui.shadcn.com](https://ui.shadcn.com)

### Soporte

Si tienes problemas o preguntas:
1. Revisa la sección de "Solución de Problemas" arriba
2. Busca en los Issues del repositorio si alguien ya reportó el problema
3. Crea un nuevo Issue describiendo tu problema en detalle

---

## 📝 Licencia

[Especifica aquí la licencia de tu proyecto]

## 👥 Contribuidores

[Lista de contribuidores o cómo contribuir al proyecto]

---

**¡Gracias por usar esta aplicación! Si te resulta útil, considera darle una estrella ⭐ al repositorio.**
