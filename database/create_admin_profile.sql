-- ⚡ SOLUCIÓN RÁPIDA: Crear perfil para usuario existente
-- Ejecutar este script en Supabase Dashboard → SQL Editor
-- Tiempo estimado: 30 segundos

-- 1. Crear perfil para el usuario existente (si no existe)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Administrador') as full_name,
  'admin' as role
FROM auth.users
WHERE email = 'carlosmatiasflor@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

-- 2. Verificar que se creó correctamente
SELECT 
  p.email,
  p.full_name,
  p.role,
  p.created_at,
  '✅ PERFIL CREADO' as status
FROM public.profiles p
WHERE p.email = 'carlosmatiasflor@gmail.com';

-- 3. Verificar relación con auth.users
SELECT 
  u.email as "Email Usuario",
  u.created_at as "Usuario Creado",
  p.role as "Rol Asignado",
  CASE 
    WHEN p.id IS NOT NULL THEN '✅ PERFIL VINCULADO'
    ELSE '❌ PERFIL FALTANTE'
  END as "Estado"
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'carlosmatiasflor@gmail.com';

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ PERFIL CREADO EXITOSAMENTE';
  RAISE NOTICE '';
  RAISE NOTICE '👤 Usuario: carlosmatiasflor@gmail.com';
  RAISE NOTICE '🔐 Rol: admin';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 SIGUIENTE PASO:';
  RAISE NOTICE '   → Iniciar sesión en: /auth/login';
  RAISE NOTICE '   → Acceder al panel: /admin';
  RAISE NOTICE '';
END $$;
