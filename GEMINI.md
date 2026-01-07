# Split Ease - Gemini Context

## Project Overview
Split Ease is a web application for managing shared expenses (similar to Splitwise), built with Next.js 16, React 18, and Supabase. It allows users to create groups, add expenses, split costs in various ways (equally, by shares, by amount), and settle debts.

## Identity & Authentication Model
**Este proyecto NO utiliza autenticación centralizada (Supabase Auth) para la identidad del usuario.**

-   **Usuarios Anónimos:** Los usuarios se identifican por nombre al unirse a un grupo.
-   **LocalStorage como Fuente de Verdad:** 
    -   `my-group-ids`: Array de IDs de los grupos a los que pertenece el usuario.
    -   `group-user-name-{groupId}`: El nombre que el usuario eligió para ese grupo específico.
-   **Relación Multi-ID:** Un mismo usuario físico tiene un `member_id` diferente en cada grupo. No existe un vínculo global entre ellos en la base de datos.
-   **Seguridad:** Basada en el conocimiento del ID/Código del grupo.

## Architecture
The project follows **Clean Architecture** principles to separate concerns:

-   **`core/` (Core Layer):** Contains the business logic, rules, and application orchestration.
    -   `entities/`: TypeScript interfaces defining domain objects (e.g., `Expense`, `Group`). Pure data structures with basic validation.
    -   `ports/`: Interfaces defining the contract for data access (Repository pattern).
    -   `use-cases/` (**NEW**): Application Services/Use Cases. Orchestrate data flow and logic to fulfill a specific user intent (e.g., `GetGroupDashboard`, `CreateGroupWithMembers`). They coordinate between Repositories and Domain Services.
-   **`domain/` (Domain Layer):**
    -   `services/`: Pure Domain Services containing business rules and invariants (e.g., `BalanceService` for calculating debts, `GroupService` for group validation logic). They should NOT orchestrate complex data fetching.
-   **`data/` (Data Layer):** Implements the interface adapters.
    -   `repositories/`: Concrete implementations of ports using Supabase (e.g., `SupabaseExpenseRepository`). Handles mapping between DB snake_case and Domain camelCase.
-   **`app/` & `components/` (Presentation Layer):** Next.js App Router and React components.
    -   `actions/`: Server Actions act as **Controllers**. They instantiate Use Cases, execute them, and return DTOs to the UI. They should NOT contain business logic or direct DB calls.

## Tech Stack
-   **Frontend:** Next.js 16, React 18, TypeScript 5
-   **Styling:** Tailwind CSS 4, shadcn/ui (based on Radix UI), Lucide React icons
-   **Backend:** Supabase (Auth, PostgreSQL, Realtime, Storage)
-   **State/Data Fetching:** Server Actions, Supabase SSR
-   **Package Manager:** pnpm

## Development Conventions

### Code Style
-   **Naming:** PascalCase for components/classes, camelCase for functions/variables. Use explicit names like `GetUserGroupsUseCase`.
-   **Imports:** Use path aliases `@/` (configured in `tsconfig.json`).
-   **Components:** Functional components with typed props. Co-located in `components/` or specific `app/` subdirectories if page-specific.

### Architectural Rules
1.  **Use Cases vs Domain Services:**
    -   Use **Domain Services** for logic that belongs to the domain concepts themselves (e.g., "Calculate Split").
    -   Use **Use Cases** for application workflows (e.g., "Fetch Group + Expenses + Calculate Split + Return Summary").
2.  **No Direct DB Access in Actions:** Server Actions (`app/actions/`) must delegate to Use Cases or Services. They should not query Supabase directly using `supabase.from(...)`.
3.  **Repositories:** Always access data via Repositories defined in `core/ports` and implemented in `data/repositories`.

### Building & Running
-   `pnpm dev`: Start development server (http://localhost:3000).
-   `pnpm build`: Build for production.
-   `pnpm start`: Start production server.
-   `pnpm lint`: Run linting.

### Configuration
-   **Environment Variables:** `.env.local` is required (Supabase URL & Keys).
-   **Tailwind:** Configured via `postcss.config.mjs` and CSS variables in `app/globals.css`.

## Key Files & Directories
-   `app/actions/`: Server Actions (Controllers).
-   `core/use-cases/`: Application logic orchestration.
-   `lib/supabase/`: Supabase client configuration (Client, Server, Middleware).
-   `middleware.ts`: Auth protection middleware.
-   `scripts/`: SQL scripts for setting up the database schema and RLS policies.