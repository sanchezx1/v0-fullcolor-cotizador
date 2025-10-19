-- ============================================================
-- REGISTRAR BUCKET QUE YA EXISTE EN EL DASHBOARD
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- Este comando registra el bucket en PostgreSQL
-- El bucket ya existe físicamente, solo falta registrarlo en la BD

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
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

-- Deberías ver una fila con la configuración del bucket
SELECT 
  '✅ BUCKET REGISTRADO' as "Estado",
  id as "ID",
  name as "Nombre",
  public as "¿Público?",
  file_size_limit / 1048576 as "Límite MB",
  allowed_mime_types as "Tipos MIME",
  created_at as "Fecha creación"
FROM storage.buckets 
WHERE id = 'cotizaciones';

-- Si ves una fila aquí, ¡funcionó!
-- El resultado debe mostrar:
-- - ¿Público? = true
-- - Límite MB = 10
-- - Tipos MIME = {application/pdf}

