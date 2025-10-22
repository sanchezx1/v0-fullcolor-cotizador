-- ============================================
-- MIGRACIÓN FINAL: Campos faltantes para Admin Panel
-- Basado en inspección REAL de la base de datos
-- Fecha: 2025-10-21
-- ============================================

-- NOTA: La mayoría de campos ya existen gracias a la migración anterior
-- Solo agregamos lo que realmente falta

-- PASO 1: Agregar campo "numero" a cotizaciones
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'cotizaciones' 
    AND column_name = 'numero'
  ) THEN
    -- Agregar columna
    ALTER TABLE cotizaciones ADD COLUMN numero VARCHAR(50);
    RAISE NOTICE '✓ Columna "numero" agregada a cotizaciones';
    
    -- Generar números para cotizaciones existentes
    UPDATE cotizaciones
    SET numero = 'FC-' || 
                 EXTRACT(YEAR FROM created_at) || '-' || 
                 LPAD(id::TEXT, 3, '0')
    WHERE numero IS NULL;
    
    RAISE NOTICE '✓ Números generados para % cotizaciones existentes', (SELECT COUNT(*) FROM cotizaciones WHERE numero IS NOT NULL);
    
    -- Hacer NOT NULL después de generar
    ALTER TABLE cotizaciones ALTER COLUMN numero SET NOT NULL;
    
    -- Crear índice único
    CREATE UNIQUE INDEX idx_cotizaciones_numero ON cotizaciones(numero);
    RAISE NOTICE '✓ Índice único creado en cotizaciones.numero';
  ELSE
    RAISE NOTICE 'ℹ️  Columna "numero" ya existe en cotizaciones';
  END IF;
END $$;

-- PASO 2: Agregar campo "descripcion" a eventos
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'eventos' 
    AND column_name = 'descripcion'
  ) THEN
    ALTER TABLE eventos ADD COLUMN descripcion TEXT;
    RAISE NOTICE '✓ Columna "descripcion" agregada a eventos';
    
    -- Generar descripciones para eventos existentes
    UPDATE eventos
    SET descripcion = CASE tipo
      WHEN 'cotizacion_creada' THEN 'Cotización creada desde ' || (metadata->>'canal')::TEXT
      WHEN 'pdf_generado' THEN 'PDF generado exitosamente'
      WHEN 'email_enviado' THEN 'Email enviado al cliente'
      WHEN 'whatsapp_share' THEN 'Compartido por WhatsApp'
      WHEN 'cotizacion_actualizada' THEN 'Cotización actualizada'
      ELSE 'Evento: ' || tipo
    END
    WHERE descripcion IS NULL;
    
    RAISE NOTICE '✓ Descripciones generadas para eventos existentes';
  ELSE
    RAISE NOTICE 'ℹ️  Columna "descripcion" ya existe en eventos';
  END IF;
END $$;

-- PASO 3: Actualizar constraint de tipo en eventos (agregar más tipos)
-- ============================================
DO $$
BEGIN
  -- Eliminar constraint anterior
  ALTER TABLE eventos DROP CONSTRAINT IF EXISTS eventos_tipo_check;
  
  -- Crear constraint nuevo con todos los tipos
  ALTER TABLE eventos ADD CONSTRAINT eventos_tipo_check 
    CHECK (tipo IN (
      -- Tipos existentes
      'pdf_generado',
      'email_enviado',
      'whatsapp_share',
      'cotizacion_creada',
      'cotizacion_actualizada',
      -- Nuevos tipos para admin
      'cotizacion_editada',
      'estado_cambiado',
      'producto_creado',
      'producto_editado',
      'producto_eliminado',
      'lead_creado',
      'lead_editado',
      'lead_eliminado'
    ));
  
  RAISE NOTICE '✓ Constraint de eventos.tipo actualizado con nuevos tipos';
END $$;

-- PASO 4: Actualizar constraint de estado en cotizaciones (agregar "borrador")
-- ============================================
DO $$
BEGIN
  -- Eliminar constraint anterior
  ALTER TABLE cotizaciones DROP CONSTRAINT IF EXISTS cotizaciones_estado_check;
  
  -- Crear constraint nuevo
  ALTER TABLE cotizaciones ADD CONSTRAINT cotizaciones_estado_check 
    CHECK (estado IN ('borrador', 'pendiente', 'enviada', 'aprobada', 'rechazada'));
  
  RAISE NOTICE '✓ Constraint de cotizaciones.estado actualizado (agregado "borrador")';
END $$;

-- PASO 5: Verificación final
-- ============================================
DO $$
DECLARE
  productos_count INT;
  leads_count INT;
  cotizaciones_count INT;
  cotizaciones_sin_numero INT;
BEGIN
  -- Contar registros
  SELECT COUNT(*) INTO productos_count FROM productos;
  SELECT COUNT(*) INTO leads_count FROM leads;
  SELECT COUNT(*) INTO cotizaciones_count FROM cotizaciones;
  SELECT COUNT(*) INTO cotizaciones_sin_numero FROM cotizaciones WHERE numero IS NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Estado actual de la base de datos:';
  RAISE NOTICE '   - Productos: %', productos_count;
  RAISE NOTICE '   - Leads: %', leads_count;
  RAISE NOTICE '   - Cotizaciones: %', cotizaciones_count;
  RAISE NOTICE '';
  
  IF cotizaciones_sin_numero > 0 THEN
    RAISE WARNING '⚠️  Hay % cotizaciones sin número', cotizaciones_sin_numero;
  ELSE
    RAISE NOTICE '✓ Todas las cotizaciones tienen número asignado';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Cambios aplicados:';
  RAISE NOTICE '   ✓ cotizaciones.numero agregado y generado';
  RAISE NOTICE '   ✓ eventos.descripcion agregado';
  RAISE NOTICE '   ✓ eventos.tipo constraint actualizado';
  RAISE NOTICE '   ✓ cotizaciones.estado constraint actualizado';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 El panel admin está listo para usar';
  RAISE NOTICE 'Navega a /admin para comenzar';
  RAISE NOTICE '========================================';
END $$;
