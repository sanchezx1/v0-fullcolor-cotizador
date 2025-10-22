-- ============================================
-- ARREGLAR POLÍTICAS DE STORAGE PARA ACCESO PÚBLICO
-- Descripción: Permite subir/editar/eliminar imágenes SIN autenticación
-- Fecha: 2025-10-21
-- ============================================

-- ============================================
-- LIMPIAR POLÍTICAS EXISTENTES
-- ============================================

-- Eliminar TODAS las políticas antiguas de productos
DROP POLICY IF EXISTS "Public read access for productos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload productos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update productos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete productos images" ON storage.objects;

-- Eliminar TODAS las políticas antiguas de cotizaciones
DROP POLICY IF EXISTS "Public read access for cotizaciones PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload cotizaciones PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update cotizaciones PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete cotizaciones PDFs" ON storage.objects;

-- ============================================
-- NUEVAS POLÍTICAS PÚBLICAS PARA BUCKET: productos
-- ============================================

-- Eliminar políticas específicas si existen
DROP POLICY IF EXISTS "productos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "productos_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "productos_public_update" ON storage.objects;
DROP POLICY IF EXISTS "productos_public_delete" ON storage.objects;

-- 1. LECTURA PÚBLICA (cualquiera puede ver)
CREATE POLICY "productos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'productos');

-- 2. INSERT PÚBLICO (cualquiera puede subir)
CREATE POLICY "productos_public_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'productos');

-- 3. UPDATE PÚBLICO (cualquiera puede actualizar)
CREATE POLICY "productos_public_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'productos')
WITH CHECK (bucket_id = 'productos');

-- 4. DELETE PÚBLICO (cualquiera puede eliminar)
CREATE POLICY "productos_public_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'productos');

-- ============================================
-- NUEVAS POLÍTICAS PÚBLICAS PARA BUCKET: cotizaciones
-- ============================================

-- Eliminar políticas específicas si existen
DROP POLICY IF EXISTS "cotizaciones_public_read" ON storage.objects;
DROP POLICY IF EXISTS "cotizaciones_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "cotizaciones_public_update" ON storage.objects;
DROP POLICY IF EXISTS "cotizaciones_public_delete" ON storage.objects;

-- 1. LECTURA PÚBLICA
CREATE POLICY "cotizaciones_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'cotizaciones');

-- 2. INSERT PÚBLICO
CREATE POLICY "cotizaciones_public_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cotizaciones');

-- 3. UPDATE PÚBLICO
CREATE POLICY "cotizaciones_public_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cotizaciones')
WITH CHECK (bucket_id = 'cotizaciones');

-- 4. DELETE PÚBLICO
CREATE POLICY "cotizaciones_public_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'cotizaciones');

-- ============================================
-- VERIFICACIÓN DE POLÍTICAS
-- ============================================

-- Listar todas las políticas de storage creadas
SELECT 
  policyname,
  cmd as operation,
  roles,
  CASE 
    WHEN roles = '{public}' THEN '✅ PÚBLICO'
    WHEN roles = '{authenticated}' THEN '🔒 AUTENTICADO'
    ELSE '❓ ' || array_to_string(roles, ', ')
  END as access_level
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%productos%' OR policyname LIKE '%cotizaciones%'
ORDER BY policyname;

-- ============================================
-- MENSAJES DE CONFIRMACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ STORAGE CONFIGURADO CON ACCESO PÚBLICO';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Buckets configurados:';
  RAISE NOTICE '   1. productos (acceso público total)';
  RAISE NOTICE '   2. cotizaciones (acceso público total)';
  RAISE NOTICE '';
  RAISE NOTICE '🔓 Políticas aplicadas (SIN autenticación):';
  RAISE NOTICE '   ✓ Lectura pública (anon + authenticated)';
  RAISE NOTICE '   ✓ Escritura pública (anon + authenticated)';
  RAISE NOTICE '   ✓ Actualización pública';
  RAISE NOTICE '   ✓ Eliminación pública';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE:';
  RAISE NOTICE '   - Este setup es para DESARROLLO';
  RAISE NOTICE '   - Para PRODUCCIÓN considera agregar autenticación';
  RAISE NOTICE '   - Las imágenes pueden ser subidas/borradas por cualquiera';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 SIGUIENTE PASO:';
  RAISE NOTICE 'Prueba subir una imagen desde /admin/productos';
  RAISE NOTICE '========================================';
END $$;
