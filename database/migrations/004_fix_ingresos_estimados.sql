-- ============================================
-- MIGRACIÓN: Fix Ingresos Estimados
-- Problema: Suma cotizaciones 'aprobada' + 'enviada'
-- Solución: Solo sumar cotizaciones 'aprobada'
-- Fecha: 2025-10-22
-- ============================================

-- Recrear la vista con el cálculo correcto
DROP VIEW IF EXISTS estadisticas_dashboard;

CREATE OR REPLACE VIEW estadisticas_dashboard AS
SELECT 
  -- Total de cotizaciones
  (SELECT COUNT(*) FROM cotizaciones) as total_cotizaciones,
  
  -- Cotizaciones del mes actual
  (SELECT COUNT(*) 
   FROM cotizaciones 
   WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
   AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
  ) as cotizaciones_mes,
  
  -- ✅ FIX: Ingresos estimados SOLO de cotizaciones APROBADAS
  COALESCE((
    SELECT SUM(total) 
    FROM cotizaciones 
    WHERE estado = 'aprobada'
  ), 0) as ingresos_estimados,
  
  -- Cotizaciones por estado
  (SELECT COUNT(*) FROM cotizaciones WHERE estado = 'pendiente') as cotizaciones_pendiente,
  (SELECT COUNT(*) FROM cotizaciones WHERE estado = 'enviada') as cotizaciones_enviadas,
  (SELECT COUNT(*) FROM cotizaciones WHERE estado = 'aprobada') as cotizaciones_aprobadas,
  (SELECT COUNT(*) FROM cotizaciones WHERE estado = 'rechazada') as cotizaciones_rechazadas,
  (SELECT COUNT(*) FROM cotizaciones WHERE estado = 'borrador') as cotizaciones_borrador,
  
  -- Productos activos
  (SELECT COUNT(*) FROM productos WHERE activo = true) as productos_activos,
  
  -- Total de leads
  (SELECT COUNT(*) FROM leads) as total_leads;

-- Verificar el resultado
DO $$
DECLARE
  total_aprobadas NUMERIC;
  ingresos NUMERIC;
BEGIN
  SELECT 
    COUNT(*),
    COALESCE(SUM(total), 0)
  INTO total_aprobadas, ingresos
  FROM cotizaciones 
  WHERE estado = 'aprobada';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ VISTA estadisticas_dashboard CORREGIDA';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Ahora "Ingresos Estimados" solo suma:';
  RAISE NOTICE '   - Cotizaciones APROBADAS: %', total_aprobadas;
  RAISE NOTICE '   - Total ingresos: $%', ingresos;
  RAISE NOTICE '';
  RAISE NOTICE 'ℹ️  NO se incluyen cotizaciones "enviadas"';
  RAISE NOTICE '   (solo se cuentan cuando el cliente aprueba)';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
