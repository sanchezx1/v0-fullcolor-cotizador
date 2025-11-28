-- Migration: Consolidate Multiple Permissive RLS Policies
-- Date: 2025-11-27
-- Purpose: Improve RLS performance by consolidating multiple permissive policies into single policies
-- Related: PERF-002 from PLAN_MEJORAS.md

-- ============================================================
-- TABLE: cotizaciones
-- ============================================================

-- Drop redundant policies and create consolidated ones
DROP POLICY IF EXISTS "Admins manage cotizaciones" ON public.cotizaciones;
DROP POLICY IF EXISTS "Users insert cotizaciones" ON public.cotizaciones;
DROP POLICY IF EXISTS "Users read own cotizaciones" ON public.cotizaciones;

-- Consolidated INSERT policy for authenticated users
CREATE POLICY "Authenticated can insert cotizaciones" ON public.cotizaciones
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Admin can insert anything
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
    OR
    -- User can insert their own cotizaciones
    (
      ((user_id = (select auth.uid())) OR (user_id IS NULL))
      AND
      (lead_id IN (
        SELECT leads.id FROM leads
        WHERE ((leads.user_id = (select auth.uid())) OR (leads.user_id IS NULL))
      ))
    )
  );

-- Consolidated SELECT policy for authenticated users
CREATE POLICY "Authenticated can read cotizaciones" ON public.cotizaciones
  FOR SELECT
  TO authenticated
  USING (
    -- Admin can read all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
    OR
    -- User can read their own
    (
      (user_id = (select auth.uid()))
      OR
      (lead_id IN (
        SELECT leads.id FROM leads
        WHERE leads.user_id = (select auth.uid())
      ))
    )
  );

-- Consolidated UPDATE policy for authenticated users (admins only)
CREATE POLICY "Admins can update cotizaciones" ON public.cotizaciones
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Consolidated DELETE policy for authenticated users (admins only)
CREATE POLICY "Admins can delete cotizaciones" ON public.cotizaciones
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- TABLE: items_cotizacion
-- ============================================================

-- Drop redundant policies and create consolidated ones
DROP POLICY IF EXISTS "Admins manage items_cotizacion" ON public.items_cotizacion;
DROP POLICY IF EXISTS "Users insert items_cotizacion" ON public.items_cotizacion;
DROP POLICY IF EXISTS "Users read own items_cotizacion" ON public.items_cotizacion;

-- Consolidated INSERT policy for authenticated users
CREATE POLICY "Authenticated can insert items_cotizacion" ON public.items_cotizacion
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Admin can insert anything
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
    OR
    -- User can insert items for their own cotizaciones
    (cotizacion_id IN (
      SELECT cotizaciones.id FROM cotizaciones
      WHERE (
        (cotizaciones.user_id = (select auth.uid()))
        OR
        (cotizaciones.lead_id IN (
          SELECT leads.id FROM leads
          WHERE ((leads.user_id = (select auth.uid())) OR (leads.user_id IS NULL))
        ))
      )
    ))
  );

-- Consolidated SELECT policy for authenticated users
CREATE POLICY "Authenticated can read items_cotizacion" ON public.items_cotizacion
  FOR SELECT
  TO authenticated
  USING (
    -- Admin can read all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
    OR
    -- User can read items from their own cotizaciones
    (cotizacion_id IN (
      SELECT cotizaciones.id FROM cotizaciones
      WHERE (
        (cotizaciones.user_id = (select auth.uid()))
        OR
        (cotizaciones.lead_id IN (
          SELECT leads.id FROM leads
          WHERE leads.user_id = (select auth.uid())
        ))
      )
    ))
  );

-- Consolidated UPDATE policy for authenticated users (admins only)
CREATE POLICY "Admins can update items_cotizacion" ON public.items_cotizacion
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Consolidated DELETE policy for authenticated users (admins only)
CREATE POLICY "Admins can delete items_cotizacion" ON public.items_cotizacion
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- TABLE: leads
-- ============================================================

-- Drop redundant policies and create consolidated ones
DROP POLICY IF EXISTS "Admins manage leads" ON public.leads;
DROP POLICY IF EXISTS "Users insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users read own leads" ON public.leads;
DROP POLICY IF EXISTS "Users update own leads" ON public.leads;

-- Consolidated INSERT policy for authenticated users
CREATE POLICY "Authenticated can insert leads" ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Admin can insert anything
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
    OR
    -- User can insert their own leads
    ((user_id IS NULL) OR (user_id = (select auth.uid())))
  );

-- Consolidated SELECT policy for authenticated users
CREATE POLICY "Authenticated can read leads" ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    -- Admin can read all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
    OR
    -- User can read their own
    (user_id = (select auth.uid()))
  );

-- Consolidated UPDATE policy for authenticated users
CREATE POLICY "Authenticated can update leads" ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    -- Admin can update all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
    OR
    -- User can update their own
    (user_id = (select auth.uid()))
  )
  WITH CHECK (
    -- Admin can update all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
    OR
    -- User can update their own
    (user_id = (select auth.uid()))
  );

-- Consolidated DELETE policy for authenticated users (admins only)
CREATE POLICY "Admins can delete leads" ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- TABLE: lead_actividades
-- ============================================================

-- Drop redundant policies and create consolidated ones
DROP POLICY IF EXISTS "Admins can insert lead activities" ON public.lead_actividades;
DROP POLICY IF EXISTS "System can insert lead activities" ON public.lead_actividades;

-- Consolidated INSERT policy for authenticated users
-- Note: This allows both admins and system to insert (system = true check)
CREATE POLICY "Authenticated can insert lead_actividades" ON public.lead_actividades
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Admin can insert
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
    OR
    -- System can insert (always true for authenticated)
    true
  );

-- Simplify to just true since the OR condition makes it always true
DROP POLICY IF EXISTS "Authenticated can insert lead_actividades" ON public.lead_actividades;
CREATE POLICY "Authenticated can insert lead_actividades" ON public.lead_actividades
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- TABLE: profiles
-- ============================================================

-- Drop redundant policies and create consolidated ones
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Consolidated SELECT policy for authenticated users
CREATE POLICY "Authenticated can read profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Admin can read all
    is_admin()
    OR
    -- User can read their own
    ((select auth.uid()) = id)
  );

-- Consolidated UPDATE policy for authenticated users
CREATE POLICY "Authenticated can update profiles" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Admin can update all
    is_admin()
    OR
    -- User can update their own
    ((select auth.uid()) = id)
  )
  WITH CHECK (
    -- Admin can update all
    is_admin()
    OR
    -- User can update their own
    ((select auth.uid()) = id)
  );

-- ============================================================
-- Verification
-- ============================================================

-- Add comments to document the consolidation
COMMENT ON POLICY "Authenticated can insert cotizaciones" ON public.cotizaciones IS
  'Consolidated policy: Combines admin and user insert permissions';
COMMENT ON POLICY "Authenticated can read cotizaciones" ON public.cotizaciones IS
  'Consolidated policy: Combines admin and user read permissions';

COMMENT ON POLICY "Authenticated can insert items_cotizacion" ON public.items_cotizacion IS
  'Consolidated policy: Combines admin and user insert permissions';
COMMENT ON POLICY "Authenticated can read items_cotizacion" ON public.items_cotizacion IS
  'Consolidated policy: Combines admin and user read permissions';

COMMENT ON POLICY "Authenticated can insert leads" ON public.leads IS
  'Consolidated policy: Combines admin and user insert permissions';
COMMENT ON POLICY "Authenticated can read leads" ON public.leads IS
  'Consolidated policy: Combines admin and user read permissions';
COMMENT ON POLICY "Authenticated can update leads" ON public.leads IS
  'Consolidated policy: Combines admin and user update permissions';

COMMENT ON POLICY "Authenticated can insert lead_actividades" ON public.lead_actividades IS
  'Consolidated policy: Allows all authenticated users to insert';

COMMENT ON POLICY "Authenticated can read profiles" ON public.profiles IS
  'Consolidated policy: Combines admin and user read permissions';
COMMENT ON POLICY "Authenticated can update profiles" ON public.profiles IS
  'Consolidated policy: Combines admin and user update permissions';
