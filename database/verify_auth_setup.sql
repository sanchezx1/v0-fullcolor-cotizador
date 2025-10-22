-- ============================================
-- VERIFICAR SETUP DE AUTENTICACIÓN
-- ============================================

-- 1. Verificar que existe la tabla profiles
SELECT 
  'profiles table' as check_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN '✅ EXISTS' ELSE '❌ NOT FOUND' END as status;

-- 2. Verificar usuarios en auth.users
SELECT 
  'auth.users' as check_name,
  COUNT(*) as user_count,
  STRING_AGG(email, ', ') as emails
FROM auth.users;

-- 3. Verificar perfiles creados
SELECT 
  'profiles' as check_name,
  COUNT(*) as profile_count,
  STRING_AGG(email || ' (' || role || ')', ', ') as profiles
FROM public.profiles;

-- 4. Verificar RLS habilitado en todas las tablas
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'productos', 'precios_escalonados', 'leads', 'cotizaciones', 'items_cotizacion', 'eventos')
ORDER BY tablename;

-- 5. Verificar políticas RLS creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Verificar Storage policies
SELECT 
  bucket_id,
  name as policy_name,
  definition
FROM storage.policies
WHERE bucket_id IN ('productos', 'cotizaciones')
ORDER BY bucket_id, name;

-- ============================================
-- RESUMEN
-- ============================================

DO $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
  admin_count INTEGER;
BEGIN
  -- Contar usuarios
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE role = 'admin';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 RESUMEN DE AUTENTICACIÓN';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '👥 Usuarios registrados: %', user_count;
  RAISE NOTICE '📝 Perfiles creados: %', profile_count;
  RAISE NOTICE '🔐 Admins activos: %', admin_count;
  RAISE NOTICE '';
  
  IF user_count = 0 THEN
    RAISE NOTICE '⚠️  NO HAY USUARIOS CREADOS';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 ACCIÓN REQUERIDA:';
    RAISE NOTICE '   1. Ve a Authentication → Users';
    RAISE NOTICE '   2. Click en "Add user"';
    RAISE NOTICE '   3. Email: admin@fullcolor.com';
    RAISE NOTICE '   4. Password: (tu contraseña)';
    RAISE NOTICE '   5. Auto Confirm User: ✅ ON';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ Sistema de autenticación configurado correctamente';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Puedes hacer login con:';
    SELECT RAISE NOTICE '   - %', email FROM auth.users LIMIT 1;
    RAISE NOTICE '';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
