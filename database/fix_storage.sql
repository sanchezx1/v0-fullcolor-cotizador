-- ============================================================
-- ARREGLAR STORAGE DE COTIZACIONES
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. ELIMINAR POLÍTICAS CONFLICTIVAS (si existen)
DROP POLICY IF EXISTS "Permitir inserción pública de PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública de PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización por service_role" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación por service_role" ON storage.objects;

-- 2. ELIMINAR REGISTRO DEL BUCKET (si existe)
DELETE FROM storage.buckets WHERE id = 'cotizaciones';

-- 3. REGISTRAR EL BUCKET CORRECTAMENTE
-- Nota: Esto NO elimina los archivos existentes, solo registra el bucket en la BD
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cotizaciones',
  'cotizaciones', 
  true,                                    -- Público para que cualquiera pueda descargar
  10485760,                                -- 10MB máximo por archivo
  ARRAY['application/pdf']::text[]         -- Solo PDFs
);

-- 4. CREAR POLÍTICAS RLS CORRECTAS

-- Permitir que cualquiera pueda SUBIR PDFs (necesario para Edge Functions)
CREATE POLICY "Permitir inserción pública de PDFs" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'cotizaciones' 
  AND (storage.foldername(name))[1] = 'cotizaciones'
);

-- Permitir que cualquiera pueda LEER/DESCARGAR PDFs
CREATE POLICY "Permitir lectura pública de PDFs" 
ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'cotizaciones'
);

-- Permitir que service_role pueda ACTUALIZAR PDFs
CREATE POLICY "Permitir actualización por service_role" 
ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'cotizaciones' 
  AND auth.role() = 'service_role'
);

-- Permitir que service_role pueda ELIMINAR PDFs
CREATE POLICY "Permitir eliminación por service_role" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'cotizaciones' 
  AND auth.role() = 'service_role'
);

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

-- Ver el bucket registrado
SELECT 
  id,
  name,
  public,
  file_size_limit / 1048576 as "Límite MB",
  allowed_mime_types as "Tipos permitidos",
  created_at as "Creado el"
FROM storage.buckets 
WHERE id = 'cotizaciones';

-- Ver las políticas creadas
SELECT 
  policyname as "Política",
  cmd as "Comando"
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname ILIKE '%pdf%'
ORDER BY policyname;

-- Ver archivos en el bucket (primeros 10)
SELECT 
  name as "Archivo",
  created_at as "Creado el",
  metadata->>'size' as "Tamaño bytes"
FROM storage.objects 
WHERE bucket_id = 'cotizaciones'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- RESULTADO ESPERADO:
-- 1. El bucket debe aparecer como registrado (público, 10MB, solo PDFs)
-- 2. Deben aparecer 4 políticas con los nombres mencionados
-- 3. Deben aparecer tus 34 PDFs existentes (no se borran)
-- ============================================================

