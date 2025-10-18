-- Script para configurar Supabase Storage para PDFs de cotizaciones
-- Ejecutar en Supabase SQL Editor

-- 1. Crear bucket para cotizaciones
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cotizaciones',
  'cotizaciones', 
  true,
  10485760, -- 10MB límite
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. Crear política para permitir inserción pública de PDFs
CREATE POLICY "Permitir inserción pública de PDFs" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'cotizaciones' 
  AND auth.role() = 'anon'
);

-- 3. Crear política para permitir lectura pública de PDFs
CREATE POLICY "Permitir lectura pública de PDFs" ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'cotizaciones'
);

-- 4. Crear política para permitir actualización por service_role
CREATE POLICY "Permitir actualización por service_role" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'cotizaciones' 
  AND auth.role() = 'service_role'
);

-- 5. Crear política para permitir eliminación por service_role
CREATE POLICY "Permitir eliminación por service_role" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'cotizaciones' 
  AND auth.role() = 'service_role'
);

-- 6. Verificar que el bucket se creó correctamente
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'cotizaciones';

-- 7. Verificar políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%PDF%'
ORDER BY policyname;
