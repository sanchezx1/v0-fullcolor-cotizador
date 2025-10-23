-- Verificación completa del estado de seguridad
-- Ejecutar este script en Supabase Dashboard → SQL Editor

\echo ''
\echo '🔐 REPORTE DE SEGURIDAD DE LA BASE DE DATOS'
\echo '=========================================='
\echo ''

-- 1. Estado de RLS en todas las tablas
\echo '📋 1. ESTADO DE RLS (Row Level Security)'
\echo ''
SELECT 
  tablename as "Tabla",
  CASE WHEN rowsecurity THEN '🔒 HABILITADO' ELSE '🔓 DESHABILITADO' END as "Estado RLS"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'productos', 'precios_escalonados', 'leads', 'cotizaciones', 'items_cotizacion', 'eventos')
ORDER BY tablename;

\echo ''
\echo '=========================================='
\echo ''

-- 2. Usuarios y perfiles
\echo '👥 2. USUARIOS Y PERFILES'
\echo ''
SELECT 
  'Total usuarios en auth.users' as "Tipo",
  COUNT(*)::text as "Cantidad"
FROM auth.users
UNION ALL
SELECT 
  'Total perfiles creados' as "Tipo",
  COUNT(*)::text as "Cantidad"
FROM public.profiles;

\echo ''
SELECT 
  u.email as "Email Usuario",
  p.role as "Rol",
  CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌ FALTA PERFIL' END as "Perfil Creado"
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at;

\echo ''
\echo '=========================================='
\echo ''

-- 3. Políticas RLS activas
\echo '🛡️  3. POLÍTICAS RLS ACTIVAS'
\echo ''
SELECT 
  tablename as "Tabla",
  policyname as "Política",
  cmd as "Operación",
  CASE 
    WHEN roles = '{public}' THEN 'público'
    WHEN roles = '{authenticated}' THEN 'autenticado'
    ELSE roles::text
  END as "Roles"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

\echo ''
\echo '=========================================='
\echo ''

-- 4. Storage policies
\echo '📦 4. POLÍTICAS DE STORAGE'
\echo ''
SELECT 
  bucket_id as "Bucket",
  name as "Política",
  LEFT(definition, 100) as "Definición"
FROM storage.policies
WHERE bucket_id IN ('productos', 'cotizaciones')
ORDER BY bucket_id, name;

\echo ''
\echo '=========================================='
\echo ''

-- 5. Verificar trigger de auto-creación de perfiles
\echo '⚙️  5. TRIGGERS DE AUTENTICACIÓN'
\echo ''
SELECT 
  trigger_name as "Trigger",
  event_manipulation as "Evento",
  event_object_table as "Tabla",
  action_statement as "Acción"
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
AND trigger_name LIKE '%profile%';

\echo ''
\echo '=========================================='
\echo ''

-- 6. Función handle_new_user
\echo '🔧 6. FUNCIÓN DE CREACIÓN DE PERFILES'
\echo ''
SELECT 
  routine_name as "Función",
  routine_type as "Tipo",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'handle_new_user'
    ) THEN '✅ EXISTE'
    ELSE '❌ NO EXISTE'
  END as "Estado"
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'handle_new_user';

\echo ''
\echo '=========================================='
\echo ''

-- 7. Resumen final
\echo '📊 RESUMEN Y RECOMENDACIONES'
\echo ''

DO $$
DECLARE
  rls_disabled_count INTEGER;
  users_without_profile INTEGER;
  total_users INTEGER;
  admin_count INTEGER;
BEGIN
  -- Contar tablas con RLS deshabilitado
  SELECT COUNT(*) INTO rls_disabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'productos', 'precios_escalonados', 'leads', 'cotizaciones', 'items_cotizacion', 'eventos')
  AND rowsecurity = false;
  
  -- Contar usuarios sin perfil
  SELECT COUNT(*) INTO users_without_profile
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
  
  -- Total de usuarios y admins
  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE role = 'admin';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 ESTADO ACTUAL';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '👥 Usuarios totales: %', total_users;
  RAISE NOTICE '🔐 Administradores: %', admin_count;
  RAISE NOTICE '⚠️  Usuarios sin perfil: %', users_without_profile;
  RAISE NOTICE '🔓 Tablas con RLS deshabilitado: %', rls_disabled_count;
  RAISE NOTICE '';
  
  IF rls_disabled_count > 0 THEN
    RAISE NOTICE '🚨 ACCIÓN REQUERIDA - SEGURIDAD COMPROMETIDA';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  PROBLEMA: RLS está DESHABILITADO en % tabla(s)', rls_disabled_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔧 SOLUCIÓN:';
    RAISE NOTICE '   1. Ir a SQL Editor en Supabase Dashboard';
    RAISE NOTICE '   2. Abrir: database/migrations/005_setup_authentication_and_rls.sql';
    RAISE NOTICE '   3. Ejecutar el script completo';
    RAISE NOTICE '   4. Verificar que todas las tablas tengan RLS HABILITADO';
    RAISE NOTICE '';
  ELSIF users_without_profile > 0 THEN
    RAISE NOTICE '⚠️  ADVERTENCIA: Hay usuarios sin perfil';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 SOLUCIÓN:';
    RAISE NOTICE '   1. Ejecutar: database/migrations/005_setup_authentication_and_rls.sql';
    RAISE NOTICE '   2. Esto creará el trigger para auto-generar perfiles';
    RAISE NOTICE '   3. Los perfiles se crearán automáticamente al hacer login';
    RAISE NOTICE '';
  ELSIF admin_count = 0 THEN
    RAISE NOTICE '⚠️  ADVERTENCIA: No hay administradores configurados';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 SOLUCIÓN:';
    RAISE NOTICE '   1. Actualizar perfil existente a admin:';
    RAISE NOTICE '      UPDATE public.profiles SET role = ''admin'' WHERE email = ''tu@email.com'';';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ SEGURIDAD CONFIGURADA CORRECTAMENTE';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Todo está listo para producción:';
    RAISE NOTICE '   ✓ RLS habilitado en todas las tablas';
    RAISE NOTICE '   ✓ Usuarios tienen perfiles asignados';
    RAISE NOTICE '   ✓ Hay al menos 1 administrador';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Puedes acceder al panel admin:';
    RAISE NOTICE '   → https://tu-dominio.com/admin';
    RAISE NOTICE '';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;
