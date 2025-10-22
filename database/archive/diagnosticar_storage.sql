-- ============================================================
-- DIAGNÓSTICO DEL STORAGE
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Este script NO modifica nada, solo muestra información
-- ============================================================

-- 1. Ver todos los buckets que existen
SELECT 
  '📦 BUCKETS EXISTENTES' as "Sección",
  id,
  name,
  public as "¿Público?",
  file_size_limit / 1048576 as "Límite MB",
  allowed_mime_types as "Tipos permitidos",
  created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- 2. Ver todas las políticas en storage.objects
SELECT 
  '🔐 POLÍTICAS EXISTENTES' as "Sección",
  policyname as "Nombre",
  cmd as "Comando",
  roles as "Roles",
  qual as "Condición WHERE",
  with_check as "Condición WITH CHECK"
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- 3. Ver archivos en bucket 'cotizaciones' (si existe)
SELECT 
  '📄 ARCHIVOS EN COTIZACIONES' as "Sección",
  COUNT(*) as "Total archivos",
  SUM(CAST(metadata->>'size' AS bigint)) / 1024 as "Tamaño total KB"
FROM storage.objects 
WHERE bucket_id = 'cotizaciones';

-- 4. Ver últimos 10 archivos (si existen)
SELECT 
  '📋 ÚLTIMOS 10 ARCHIVOS' as "Sección",
  name as "Nombre archivo",
  created_at as "Creado",
  metadata->>'size' as "Tamaño bytes"
FROM storage.objects 
WHERE bucket_id = 'cotizaciones'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Ver si hay errores en el log de políticas
SELECT 
  '⚠️ VERIFICACIÓN DE PERMISOS' as "Sección",
  tablename as "Tabla",
  COUNT(*) as "Cantidad de políticas"
FROM pg_policies 
WHERE schemaname = 'storage'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================
-- INTERPRETACIÓN:
-- 
-- Si ves 0 buckets → El bucket NO se creó
-- Si ves 0 políticas → Las políticas NO se crearon
-- Si ves 0 archivos → Los archivos SÍ se borraron (correcto)
-- ============================================================

