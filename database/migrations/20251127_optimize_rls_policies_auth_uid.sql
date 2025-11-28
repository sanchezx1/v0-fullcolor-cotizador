-- Migration: Optimize RLS Policies with (select auth.uid())
-- Date: 2025-11-27
-- Purpose: Improve RLS performance by preventing re-evaluation of auth.uid() for each row
-- Related: PERF-001 from PLAN_MEJORAS.md

-- ============================================================
-- TABLE: leads
-- ============================================================

-- Drop and recreate "Users insert leads" policy
DROP POLICY IF EXISTS "Users insert leads" ON public.leads;
CREATE POLICY "Users insert leads" ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id IS NULL) OR (user_id = (select auth.uid()))
  );

-- Drop and recreate "Users read own leads" policy
DROP POLICY IF EXISTS "Users read own leads" ON public.leads;
CREATE POLICY "Users read own leads" ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
  );

-- Drop and recreate "Users update own leads" policy
DROP POLICY IF EXISTS "Users update own leads" ON public.leads;
CREATE POLICY "Users update own leads" ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (select auth.uid())
  )
  WITH CHECK (
    user_id = (select auth.uid())
  );

-- ============================================================
-- TABLE: cotizaciones
-- ============================================================

-- Drop and recreate "Users insert cotizaciones" policy
DROP POLICY IF EXISTS "Users insert cotizaciones" ON public.cotizaciones;
CREATE POLICY "Users insert cotizaciones" ON public.cotizaciones
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      (user_id = (select auth.uid())) OR (user_id IS NULL)
    )
    AND
    (
      lead_id IN (
        SELECT leads.id
        FROM leads
        WHERE (
          (leads.user_id = (select auth.uid())) OR (leads.user_id IS NULL)
        )
      )
    )
  );

-- Drop and recreate "Users read own cotizaciones" policy
DROP POLICY IF EXISTS "Users read own cotizaciones" ON public.cotizaciones;
CREATE POLICY "Users read own cotizaciones" ON public.cotizaciones
  FOR SELECT
  TO authenticated
  USING (
    (user_id = (select auth.uid()))
    OR
    (
      lead_id IN (
        SELECT leads.id
        FROM leads
        WHERE leads.user_id = (select auth.uid())
      )
    )
  );

-- ============================================================
-- TABLE: items_cotizacion
-- ============================================================

-- Drop and recreate "Users insert items_cotizacion" policy
DROP POLICY IF EXISTS "Users insert items_cotizacion" ON public.items_cotizacion;
CREATE POLICY "Users insert items_cotizacion" ON public.items_cotizacion
  FOR INSERT
  TO authenticated
  WITH CHECK (
    cotizacion_id IN (
      SELECT cotizaciones.id
      FROM cotizaciones
      WHERE (
        (cotizaciones.user_id = (select auth.uid()))
        OR
        (
          cotizaciones.lead_id IN (
            SELECT leads.id
            FROM leads
            WHERE (
              (leads.user_id = (select auth.uid())) OR (leads.user_id IS NULL)
            )
          )
        )
      )
    )
  );

-- Drop and recreate "Users read own items_cotizacion" policy
DROP POLICY IF EXISTS "Users read own items_cotizacion" ON public.items_cotizacion;
CREATE POLICY "Users read own items_cotizacion" ON public.items_cotizacion
  FOR SELECT
  TO authenticated
  USING (
    cotizacion_id IN (
      SELECT cotizaciones.id
      FROM cotizaciones
      WHERE (
        (cotizaciones.user_id = (select auth.uid()))
        OR
        (
          cotizaciones.lead_id IN (
            SELECT leads.id
            FROM leads
            WHERE leads.user_id = (select auth.uid())
          )
        )
      )
    )
  );

-- ============================================================
-- TABLE: email_logs
-- ============================================================

-- Drop and recreate "Admins manage email_logs" policy
DROP POLICY IF EXISTS "Admins manage email_logs" ON public.email_logs;
CREATE POLICY "Admins manage email_logs" ON public.email_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE (
        (p.id = (select auth.uid())) AND (p.role = 'admin'::text)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE (
        (p.id = (select auth.uid())) AND (p.role = 'admin'::text)
      )
    )
  );

-- ============================================================
-- Verification
-- ============================================================

-- Add comments to document the optimization
COMMENT ON POLICY "Users insert leads" ON public.leads IS
  'Optimized: Uses (select auth.uid()) to prevent per-row re-evaluation';
COMMENT ON POLICY "Users read own leads" ON public.leads IS
  'Optimized: Uses (select auth.uid()) to prevent per-row re-evaluation';
COMMENT ON POLICY "Users update own leads" ON public.leads IS
  'Optimized: Uses (select auth.uid()) to prevent per-row re-evaluation';

COMMENT ON POLICY "Users insert cotizaciones" ON public.cotizaciones IS
  'Optimized: Uses (select auth.uid()) to prevent per-row re-evaluation';
COMMENT ON POLICY "Users read own cotizaciones" ON public.cotizaciones IS
  'Optimized: Uses (select auth.uid()) to prevent per-row re-evaluation';

COMMENT ON POLICY "Users insert items_cotizacion" ON public.items_cotizacion IS
  'Optimized: Uses (select auth.uid()) to prevent per-row re-evaluation';
COMMENT ON POLICY "Users read own items_cotizacion" ON public.items_cotizacion IS
  'Optimized: Uses (select auth.uid()) to prevent per-row re-evaluation';

COMMENT ON POLICY "Admins manage email_logs" ON public.email_logs IS
  'Optimized: Uses (select auth.uid()) to prevent per-row re-evaluation';
