-- ============================================
-- MIGRACIÓN: Admin Panel Schema Updates (FIXED)
-- Descripción: Agrega campos necesarios para panel admin
-- Versión: 1.0.2 (corregido según esquema real)
-- Fecha: 2025-01-21
-- ============================================

-- PASO 1: Limpiar duplicados de email en leads
-- ============================================

-- Primero, identificar y eliminar duplicados manteniendo el más reciente
WITH duplicados AS (
  SELECT id, email,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM leads
  WHERE email IS NOT NULL
)
DELETE FROM leads
WHERE id IN (
  SELECT id FROM duplicados WHERE rn > 1
);

-- PASO 2: Actualizar tabla productos
-- ============================================

-- Agregar columna SKU si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productos' AND column_name = 'sku'
  ) THEN
    ALTER TABLE productos ADD COLUMN sku VARCHAR(50);
  END IF;
END $$;

-- Generar SKUs únicos para productos existentes sin SKU
UPDATE productos 
SET sku = 'PROD-' || LPAD(id::TEXT, 4, '0')
WHERE sku IS NULL;

-- Hacer SKU único y no nulo
ALTER TABLE productos 
  ALTER COLUMN sku SET NOT NULL;

-- Crear índice único para SKU si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_productos_sku'
  ) THEN
    CREATE UNIQUE INDEX idx_productos_sku ON productos(sku);
  END IF;
END $$;

-- PASO 3: Actualizar tabla leads
-- ============================================

-- Las columnas ruc_cedula y ciudad ya existen según el esquema
-- Solo agregamos direccion si no existe

DO $$ 
BEGIN
  -- Dirección
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'direccion'
  ) THEN
    ALTER TABLE leads ADD COLUMN direccion TEXT;
  END IF;
END $$;

-- Crear índice único para email si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_email_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_leads_email_unique ON leads(email);
  END IF;
END $$;

-- PASO 4: Actualizar tabla cotizaciones
-- ============================================

-- Agregar columnas de totales (subtotal e iva) si no existen
DO $$ 
BEGIN
  -- Subtotal
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cotizaciones' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE cotizaciones ADD COLUMN subtotal NUMERIC(12,4) DEFAULT 0;
  END IF;

  -- IVA
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cotizaciones' AND column_name = 'iva'
  ) THEN
    ALTER TABLE cotizaciones ADD COLUMN iva NUMERIC(12,4) DEFAULT 0;
  END IF;
END $$;

-- Calcular subtotal e IVA para cotizaciones existentes
UPDATE cotizaciones c
SET 
  subtotal = COALESCE((
    SELECT SUM(cantidad * precio_unitario_aplicado)
    FROM items_cotizacion
    WHERE cotizacion_id = c.id
  ), 0),
  iva = COALESCE((
    SELECT SUM(cantidad * precio_unitario_aplicado) * 0.15
    FROM items_cotizacion
    WHERE cotizacion_id = c.id
  ), 0)
WHERE subtotal = 0 OR iva = 0;

-- PASO 5: Actualizar tabla eventos
-- ============================================

-- Actualizar constraint de tipo (no tipo_evento)
DO $$
BEGIN
  -- Eliminar constraint anterior si existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'eventos_tipo_check'
  ) THEN
    ALTER TABLE eventos DROP CONSTRAINT eventos_tipo_check;
  END IF;

  -- Agregar nuevo constraint con tipos ampliados
  ALTER TABLE eventos ADD CONSTRAINT eventos_tipo_check 
    CHECK (tipo IN (
      'pdf_generado',
      'email_enviado',
      'whatsapp_share',
      'cotizacion_creada',
      'cotizacion_actualizada',
      'cotizacion_editada',
      'estado_cambiado',
      'producto_creado',
      'producto_editado',
      'producto_eliminado',
      'lead_creado',
      'lead_editado'
    ));
END $$;

-- PASO 6: Crear vista de estadísticas del dashboard
-- ============================================

-- Drop vista si existe
DROP VIEW IF EXISTS estadisticas_dashboard;

-- Crear vista
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
  
  -- Ingresos estimados (cotizaciones aprobadas o enviadas)
  COALESCE((
    SELECT SUM(total) 
    FROM cotizaciones 
    WHERE estado IN ('aprobada', 'enviada')
  ), 0) as ingresos_estimados,
  
  -- Cotizaciones por estado
  (SELECT COUNT(*) FROM cotizaciones WHERE estado = 'pendiente') as cotizaciones_pendiente,
  (SELECT COUNT(*) FROM cotizaciones WHERE estado = 'enviada') as cotizaciones_enviadas,
  (SELECT COUNT(*) FROM cotizaciones WHERE estado = 'aprobada') as cotizaciones_aprobadas,
  (SELECT COUNT(*) FROM cotizaciones WHERE estado = 'rechazada') as cotizaciones_rechazadas,
  
  -- Productos activos
  (SELECT COUNT(*) FROM productos WHERE activo = true) as productos_activos,
  
  -- Total de leads
  (SELECT COUNT(*) FROM leads) as total_leads;

-- PASO 7: Crear vista de productos más cotizados
-- ============================================

-- Drop vista si existe
DROP VIEW IF EXISTS productos_top_cotizados;

-- Crear vista
CREATE OR REPLACE VIEW productos_top_cotizados AS
SELECT 
  p.id,
  p.nombre,
  p.sku,
  p.categoria,
  p.imagen_url,
  COUNT(ic.id) as veces_cotizado,
  SUM(ic.cantidad) as unidades_totales,
  SUM(ic.cantidad * ic.precio_unitario_aplicado) as ingresos_generados
FROM productos p
INNER JOIN items_cotizacion ic ON p.id = ic.producto_id
GROUP BY p.id, p.nombre, p.sku, p.categoria, p.imagen_url
ORDER BY veces_cotizado DESC, unidades_totales DESC
LIMIT 10;

-- PASO 8: Crear función para generar número de cotización
-- ============================================

-- Drop función si existe
DROP FUNCTION IF EXISTS generar_numero_cotizacion();

-- Crear función
CREATE OR REPLACE FUNCTION generar_numero_cotizacion()
RETURNS TEXT AS $$
DECLARE
  anio_actual INT;
  contador INT;
  numero_cotizacion TEXT;
BEGIN
  -- Obtener año actual
  anio_actual := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Contar cotizaciones del año actual
  SELECT COUNT(*) + 1 INTO contador
  FROM cotizaciones
  WHERE EXTRACT(YEAR FROM created_at) = anio_actual;
  
  -- Generar número con formato FC-2025-001
  numero_cotizacion := 'FC-' || anio_actual || '-' || LPAD(contador::TEXT, 3, '0');
  
  RETURN numero_cotizacion;
END;
$$ LANGUAGE plpgsql;

-- PASO 9: Verificación de integridad
-- ============================================

-- Verificar que todos los productos tengan SKU
DO $$
DECLARE
  productos_sin_sku INT;
BEGIN
  SELECT COUNT(*) INTO productos_sin_sku
  FROM productos
  WHERE sku IS NULL OR sku = '';
  
  IF productos_sin_sku > 0 THEN
    RAISE NOTICE 'Advertencia: % productos sin SKU', productos_sin_sku;
  ELSE
    RAISE NOTICE 'Todos los productos tienen SKU';
  END IF;
END $$;

-- Verificar que no haya emails duplicados
DO $$
DECLARE
  emails_duplicados INT;
BEGIN
  SELECT COUNT(*) INTO emails_duplicados
  FROM (
    SELECT email, COUNT(*) as cnt
    FROM leads
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  ) duplicados;
  
  IF emails_duplicados > 0 THEN
    RAISE EXCEPTION 'Error: Aún hay % emails duplicados en leads', emails_duplicados;
  ELSE
    RAISE NOTICE 'No hay emails duplicados en leads';
  END IF;
END $$;

-- PASO 10: Mensajes de confirmación
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migración completada exitosamente';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Cambios aplicados:';
  RAISE NOTICE '- Tabla productos: SKU agregado';
  RAISE NOTICE '- Tabla leads: direccion agregado (ruc_cedula y ciudad ya existían)';
  RAISE NOTICE '- Tabla cotizaciones: subtotal, iva agregados';
  RAISE NOTICE '- Tabla eventos: tipos ampliados (usando columna "tipo")';
  RAISE NOTICE '- Vista estadisticas_dashboard creada';
  RAISE NOTICE '- Vista productos_top_cotizados creada';
  RAISE NOTICE '- Función generar_numero_cotizacion() creada';
  RAISE NOTICE '============================================';
END $$;