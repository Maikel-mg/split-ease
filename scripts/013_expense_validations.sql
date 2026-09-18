-- 013_expense_validations.sql
--
-- Validación de gastos y pagos: cada miembro confirma que los gastos y pagos
-- que le afectan son correctos antes de que el grupo empiece a saldar.
--
-- La vigencia de una validación NO se almacena, se deriva: se compara la huella
-- guardada aquí con la huella actual de los gastos del grupo. Por eso no hay
-- triggers ni funciones. Si cambia el importe, el pagador, los participantes o
-- el reparto de cualquier gasto, la huella deja de coincidir y todas las
-- validaciones del grupo quedan obsoletas solas. Cambiar la descripción, la
-- fecha o la imagen no las altera.

-- ---------------------------------------------------------------------------
-- 1. Backfill de esquema.
--    `is_private` y `archived` los usan todos los repositorios pero ningún
--    script los creó: se añadieron a mano en el dashboard. Una base
--    reconstruida desde scripts/001..012 está rota sin estas dos columnas.
-- ---------------------------------------------------------------------------
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS archived   BOOLEAN NOT NULL DEFAULT FALSE;

-- ---------------------------------------------------------------------------
-- 2. Validaciones.
--    El UNIQUE (group_id, member_id) impide duplicados y su índice sirve para
--    buscar las validaciones de un grupo. El ON DELETE CASCADE hace que quitar
--    a un miembro se lleve las suyas.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expense_validations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id             UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  member_id            UUID NOT NULL REFERENCES public.group_members(id) ON DELETE CASCADE,
  expenses_fingerprint TEXT NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT expense_validations_unique UNIQUE (group_id, member_id)
);

-- Mismo criterio que el resto de tablas de dominio (ver 009_disable_all_rls.sql).
ALTER TABLE public.expense_validations DISABLE ROW LEVEL SECURITY;

-- El cliente escribe desde el navegador con la clave anónima, así que necesita
-- privilegios sobre la tabla. Supabase los concede por defecto en `public` y las
-- tablas existentes se crearon igual, así que esto es un cinturón: si falta,
-- los INSERT fallan con un error opaco. UPDATE es necesario para el upsert.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_validations TO anon, authenticated;

COMMENT ON TABLE public.expense_validations IS
  'Visto bueno de un miembro sobre los gastos y pagos del grupo. Una fila está vigente solo si expenses_fingerprint coincide con la huella actual de los gastos del grupo.';

COMMENT ON COLUMN public.expense_validations.expenses_fingerprint IS
  'Cadena canónica del estado de gastos del grupo en el momento de validar. Solo incluye id, importe, pagador, participantes y reparto.';
