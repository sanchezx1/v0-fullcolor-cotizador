-- ============================================
-- CONFIGURACIÓN DE STORAGE PARA ADMIN PANEL
-- Descripción: Crea buckets y políticas RLS para Storage
-- Fecha: 2025-10-21
-- ============================================

-- IMPORTANTE: Los buckets se crean desde el Dashboard UI de Supabase
-- Este script solo configura las POLÍTICAS de acceso

-- ============================================
-- VERIFICAR BUCKETS EXISTENTES
-- ============================================
SELECT 
  name as bucket_name,
  public as is_public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name IN ('productos', 'cotizaciones');

-- Si los buckets NO existen, créalos desde:
-- Supabase Dashboard → Storage → New Bucket

-- ============================================
-- POLÍTICAS PARA BUCKET: productos
-- ============================================

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Public read access for productos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload productos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update productos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete productos images" ON storage.objects;

-- 1. Lectura pública (cualquiera puede ver imágenes)
CREATE POLICY "Public read access for productos images"
ON storage.objects FOR SELECT
USING (bucket_id = 'productos');

-- 2. Upload solo para usuarios autenticados
CREATE POLICY "Authenticated users can upload productos images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'productos');

-- 3. Actualizar imágenes (autenticados)
CREATE POLICY "Authenticated users can update productos images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'productos')
WITH CHECK (bucket_id = 'productos');

-- 4. Eliminar imágenes (autenticados)
CREATE POLICY "Authenticated users can delete productos images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'productos');

-- ============================================
-- POLÍTICAS PARA BUCKET: cotizaciones
-- ============================================

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Public read access for cotizaciones PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload cotizaciones PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update cotizaciones PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete cotizaciones PDFs" ON storage.objects;

-- 1. Lectura pública (cualquiera puede descargar PDFs)
CREATE POLICY "Public read access for cotizaciones PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'cotizaciones');

-- 2. Upload solo para usuarios autenticados
CREATE POLICY "Authenticated users can upload cotizaciones PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cotizaciones');

-- 3. Actualizar PDFs (autenticados)
CREATE POLICY "Authenticated users can update cotizaciones PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cotizaciones')
WITH CHECK (bucket_id = 'cotizaciones');

-- 4. Eliminar PDFs (autenticados)
CREATE POLICY "Authenticated users can delete cotizaciones PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cotizaciones');

-- ============================================
-- VERIFICACIÓN DE POLÍTICAS
-- ============================================

-- Listar todas las políticas de storage
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- MENSAJES DE CONFIRMACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ STORAGE CONFIGURADO EXITOSAMENTE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Buckets configurados:';
  RAISE NOTICE '   1. productos (para imágenes de productos)';
  RAISE NOTICE '   2. cotizaciones (para PDFs de cotizaciones)';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Políticas aplicadas:';
  RAISE NOTICE '   ✓ Lectura pública (anon)';
  RAISE NOTICE '   ✓ Escritura autenticada (authenticated)';
  RAISE NOTICE '   ✓ Actualización autenticada';
  RAISE NOTICE '   ✓ Eliminación autenticada';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 SIGUIENTE PASO:';
  RAISE NOTICE 'Verifica que los buckets existan en:';
  RAISE NOTICE 'Supabase Dashboard → Storage';
  RAISE NOTICE '';
  RAISE NOTICE 'Si NO existen, créalos manualmente:';
  RAISE NOTICE '1. Click "New bucket"';
  RAISE NOTICE '2. Name: productos (Public: YES)';
  RAISE NOTICE '3. Name: cotizaciones (Public: YES)';
  RAISE NOTICE '========================================';
END $$;
