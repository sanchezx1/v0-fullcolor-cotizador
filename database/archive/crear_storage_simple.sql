-- ============================================================
-- CREAR STORAGE - VERSIÓN SIMPLE Y ROBUSTA
-- Ejecutar COMPLETO en Supabase Dashboard → SQL Editor
-- ============================================================

-- PASO 1: Limpiar todo lo anterior
DO $$ 
BEGIN
  -- Eliminar políticas viejas (ignorar errores si no existen)
  EXECUTE 'DROP POLICY IF EXISTS "Permitir inserción pública de PDFs" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Permitir lectura pública de PDFs" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Permitir actualización por service_role" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Permitir eliminación por service_role" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Cotizaciones: Permitir inserción pública" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Cotizaciones: Permitir lectura pública" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Cotizaciones: Actualización por service_role" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Cotizaciones: Eliminación por service_role" ON storage.objects';
  
  -- Eliminar archivos y bucket
  DELETE FROM storage.objects WHERE bucket_id = 'cotizaciones';
  DELETE FROM storage.buckets WHERE id = 'cotizaciones';
  
  RAISE NOTICE '✅ Limpieza completada';
END $$;

-- PASO 2: Crear el bucket
DO $$ 
BEGIN
  INSERT INTO storage.buckets (
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types
  )
  VALUES (
    'cotizaciones',
    'cotizaciones',
    true,
    10485760,
    ARRAY['application/pdf']
  );
  
  RAISE NOTICE '✅ Bucket creado';
EXCEPTION 
  WHEN unique_violation THEN
    RAISE NOTICE '⚠️ El bucket ya existe, continuando...';
END $$;

-- PASO 3: Crear políticas (una por una para ver cuál falla)
DO $$ 
BEGIN
  -- Política 1: Inserción
  EXECUTE '
    CREATE POLICY "Permitir inserción pública de PDFs" 
    ON storage.objects
    FOR INSERT 
    TO public
    WITH CHECK (bucket_id = ''cotizaciones'')
  ';
  RAISE NOTICE '✅ Política de inserción creada';
EXCEPTION 
  WHEN duplicate_object THEN
    RAISE NOTICE '⚠️ Política de inserción ya existe';
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error en política de inserción: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  -- Política 2: Lectura
  EXECUTE '
    CREATE POLICY "Permitir lectura pública de PDFs" 
    ON storage.objects
    FOR SELECT 
    TO public
    USING (bucket_id = ''cotizaciones'')
  ';
  RAISE NOTICE '✅ Política de lectura creada';
EXCEPTION 
  WHEN duplicate_object THEN
    RAISE NOTICE '⚠️ Política de lectura ya existe';
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error en política de lectura: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  -- Política 3: Actualización
  EXECUTE '
    CREATE POLICY "Permitir actualización por service_role" 
    ON storage.objects
    FOR UPDATE 
    TO service_role
    USING (bucket_id = ''cotizaciones'')
  ';
  RAISE NOTICE '✅ Política de actualización creada';
EXCEPTION 
  WHEN duplicate_object THEN
    RAISE NOTICE '⚠️ Política de actualización ya existe';
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error en política de actualización: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  -- Política 4: Eliminación
  EXECUTE '
    CREATE POLICY "Permitir eliminación por service_role" 
    ON storage.objects
    FOR DELETE 
    TO service_role
    USING (bucket_id = ''cotizaciones'')
  ';
  RAISE NOTICE '✅ Política de eliminación creada';
EXCEPTION 
  WHEN duplicate_object THEN
    RAISE NOTICE '⚠️ Política de eliminación ya existe';
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error en política de eliminación: %', SQLERRM;
END $$;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================

-- Ver el bucket creado
SELECT 
  '✅ BUCKET VERIFICADO' as status,
  id,
  name,
  public as "¿Público?",
  file_size_limit / 1048576 as "Límite MB",
  array_length(allowed_mime_types, 1) as "Cant. tipos MIME"
FROM storage.buckets 
WHERE id = 'cotizaciones';

-- Contar políticas creadas
SELECT 
  '✅ POLÍTICAS VERIFICADAS' as status,
  COUNT(*) as "Total políticas creadas"
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname ILIKE '%pdf%';

-- Ver lista de políticas
SELECT 
  policyname as "Política",
  cmd as "Tipo"
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname ILIKE '%pdf%'
ORDER BY policyname;

-- ============================================================
-- RESULTADO ESPERADO:
-- Debes ver mensajes ✅ para cada paso
-- El bucket debe aparecer con public=true
-- Deben aparecer 4 políticas
-- ============================================================

