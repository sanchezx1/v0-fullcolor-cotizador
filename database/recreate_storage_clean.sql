-- ============================================================
-- RECREAR STORAGE LIMPIO DESDE CERO
-- Este script ELIMINA TODO (incluye los 34 PDFs) y recrea limpio
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS RELACIONADAS CON COTIZACIONES
DROP POLICY IF EXISTS "Permitir inserción pública de PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública de PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización por service_role" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación por service_role" ON storage.objects;

-- También eliminar cualquier política vieja que pueda existir
DROP POLICY IF EXISTS "Allow public insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- 2. ELIMINAR TODOS LOS ARCHIVOS DEL BUCKET
-- Esto borra los 34 PDFs existentes
DELETE FROM storage.objects WHERE bucket_id = 'cotizaciones';

-- 3. ELIMINAR EL BUCKET COMPLETAMENTE
DELETE FROM storage.buckets WHERE id = 'cotizaciones';

-- 4. CREAR EL BUCKET NUEVO Y LIMPIO
INSERT INTO storage.buckets (
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  avif_autodetection
)
VALUES (
  'cotizaciones',           -- ID del bucket
  'cotizaciones',           -- Nombre del bucket
  true,                     -- Público (PDFs descargables sin autenticación)
  10485760,                 -- 10MB máximo por archivo
  ARRAY['application/pdf']::text[],  -- Solo PDFs permitidos
  false                     -- No detectar AVIF automáticamente
);

-- 5. CREAR POLÍTICAS RLS SIMPLES Y CLARAS

-- 5.1: Permitir a CUALQUIERA subir PDFs
-- Esto es necesario para que las Edge Functions puedan subir PDFs
CREATE POLICY "Cotizaciones: Permitir inserción pública" 
ON storage.objects
FOR INSERT 
TO public
WITH CHECK (
  bucket_id = 'cotizaciones'
);

-- 5.2: Permitir a CUALQUIERA leer/descargar PDFs
-- Esto permite que los clientes descarguen sus cotizaciones
CREATE POLICY "Cotizaciones: Permitir lectura pública" 
ON storage.objects
FOR SELECT 
TO public
USING (
  bucket_id = 'cotizaciones'
);

-- 5.3: Permitir actualización solo a service_role
-- Para posibles actualizaciones desde backend
CREATE POLICY "Cotizaciones: Actualización por service_role" 
ON storage.objects
FOR UPDATE 
TO service_role
USING (
  bucket_id = 'cotizaciones'
);

-- 5.4: Permitir eliminación solo a service_role
-- Para limpieza manual desde backend si es necesario
CREATE POLICY "Cotizaciones: Eliminación por service_role" 
ON storage.objects
FOR DELETE 
TO service_role
USING (
  bucket_id = 'cotizaciones'
);

-- ============================================================
-- VERIFICACIÓN AUTOMÁTICA
-- ============================================================

-- Ver el bucket recién creado
SELECT 
  '✅ BUCKET CREADO' as status,
  id,
  name,
  public as "¿Público?",
  file_size_limit / 1048576 as "Límite MB",
  allowed_mime_types as "Tipos permitidos",
  created_at as "Creado ahora"
FROM storage.buckets 
WHERE id = 'cotizaciones';

-- Ver las políticas creadas (deben ser 4)
SELECT 
  '✅ POLÍTICAS CREADAS' as status,
  policyname as "Nombre de Política",
  cmd as "Tipo",
  roles as "Roles permitidos"
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname ILIKE '%cotizaciones%'
ORDER BY policyname;

-- Verificar que no hay archivos (bucket limpio)
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ BUCKET LIMPIO (sin archivos)'
    ELSE '⚠️ Hay ' || COUNT(*) || ' archivo(s)'
  END as status
FROM storage.objects 
WHERE bucket_id = 'cotizaciones';

-- ============================================================
-- RESULTADO ESPERADO:
-- 
-- 1. Bucket 'cotizaciones' creado como PÚBLICO con límite 10MB
-- 2. Solo acepta archivos PDF
-- 3. 4 políticas creadas (inserción, lectura, actualización, eliminación)
-- 4. Bucket vacío (0 archivos)
-- 5. Listo para empezar a generar PDFs desde cero
-- ============================================================

-- Mensaje final
SELECT 
  '✅ STORAGE RECREADO EXITOSAMENTE' as "🎉 Estado Final",
  'El bucket está listo para generar PDFs' as "Mensaje";

