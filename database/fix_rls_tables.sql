-- ============================================
-- ARREGLAR POLÍTICAS RLS PARA TABLAS
-- Descripción: Permite acceso público a tablas para desarrollo
-- Fecha: 2025-10-21
-- ============================================

-- ============================================
-- TABLA: productos
-- ============================================

-- Deshabilitar RLS temporalmente para desarrollo
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;

-- O si prefieres mantener RLS habilitado con políticas públicas:
-- ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "productos_public_select" ON productos;
-- DROP POLICY IF EXISTS "productos_public_insert" ON productos;
-- DROP POLICY IF EXISTS "productos_public_update" ON productos;
-- DROP POLICY IF EXISTS "productos_public_delete" ON productos;

-- CREATE POLICY "productos_public_select" ON productos FOR SELECT USING (true);
-- CREATE POLICY "productos_public_insert" ON productos FOR INSERT WITH CHECK (true);
-- CREATE POLICY "productos_public_update" ON productos FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "productos_public_delete" ON productos FOR DELETE USING (true);

-- ============================================
-- TABLA: precios_escalonados
-- ============================================

ALTER TABLE precios_escalonados DISABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLA: leads
-- ============================================

ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLA: cotizaciones
-- ============================================

ALTER TABLE cotizaciones DISABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLA: items_cotizacion
-- ============================================

ALTER TABLE items_cotizacion DISABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLA: eventos
-- ============================================

ALTER TABLE eventos DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('productos', 'precios_escalonados', 'leads', 'cotizaciones', 'items_cotizacion', 'eventos')
ORDER BY tablename;

-- ============================================
-- MENSAJES
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ RLS DESHABILITADO PARA DESARROLLO';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Tablas afectadas:';
  RAISE NOTICE '   1. productos';
  RAISE NOTICE '   2. precios_escalonados';
  RAISE NOTICE '   3. leads';
  RAISE NOTICE '   4. cotizaciones';
  RAISE NOTICE '   5. items_cotizacion';
  RAISE NOTICE '   6. eventos';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE:';
  RAISE NOTICE '   - Este setup es para DESARROLLO';
  RAISE NOTICE '   - Para PRODUCCIÓN activa RLS con políticas adecuadas';
  RAISE NOTICE '   - Cualquiera puede leer/escribir estas tablas';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 SIGUIENTE PASO:';
  RAISE NOTICE 'Prueba actualizar un producto desde /admin/productos';
  RAISE NOTICE '========================================';
END $$;
