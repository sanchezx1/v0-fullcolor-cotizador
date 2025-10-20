-- Script para verificar y aplicar políticas RLS en Supabase
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si RLS está habilitado en las tablas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'cotizaciones', 'items_cotizacion', 'eventos', 'productos', 'precios_escalonados');

-- 2. Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('leads', 'cotizaciones', 'items_cotizacion', 'eventos', 'productos', 'precios_escalonados')
ORDER BY tablename, policyname;

-- 3. Si las políticas no existen, ejecutar este bloque:
DO $$
BEGIN
    -- Habilitar RLS si no está habilitado
    ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE precios_escalonados ENABLE ROW LEVEL SECURITY;
    ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
    ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
    ALTER TABLE items_cotizacion ENABLE ROW LEVEL SECURITY;
    ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
    
    -- Crear políticas para LEADS si no existen
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Leads - inserción pública') THEN
        CREATE POLICY "Leads - inserción pública" ON leads
            FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Leads admin - lectura y escritura') THEN
        CREATE POLICY "Leads admin - lectura y escritura" ON leads
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
    
    -- Crear políticas para COTIZACIONES si no existen
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cotizaciones' AND policyname = 'Cotizaciones - inserción pública') THEN
        CREATE POLICY "Cotizaciones - inserción pública" ON cotizaciones
            FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cotizaciones' AND policyname = 'Cotizaciones admin - lectura y escritura') THEN
        CREATE POLICY "Cotizaciones admin - lectura y escritura" ON cotizaciones
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
    
    -- Crear políticas para ITEMS COTIZACIÓN si no existen
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'items_cotizacion' AND policyname = 'Items cotización - inserción pública') THEN
        CREATE POLICY "Items cotización - inserción pública" ON items_cotizacion
            FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'items_cotizacion' AND policyname = 'Items cotización admin - lectura y escritura') THEN
        CREATE POLICY "Items cotización admin - lectura y escritura" ON items_cotizacion
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
    
    -- Crear políticas para EVENTOS si no existen
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'eventos' AND policyname = 'Eventos - inserción pública') THEN
        CREATE POLICY "Eventos - inserción pública" ON eventos
            FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'eventos' AND policyname = 'Eventos admin - lectura y escritura') THEN
        CREATE POLICY "Eventos admin - lectura y escritura" ON eventos
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
    
    -- Crear políticas para PRODUCTOS si no existen
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'productos' AND policyname = 'Productos públicos - lectura') THEN
        CREATE POLICY "Productos públicos - lectura" ON productos
            FOR SELECT USING (activo = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'productos' AND policyname = 'Productos admin - escritura') THEN
        CREATE POLICY "Productos admin - escritura" ON productos
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
    
    -- Crear políticas para PRECIOS ESCALONADOS si no existen
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'precios_escalonados' AND policyname = 'Precios escalonados públicos - lectura') THEN
        CREATE POLICY "Precios escalonados públicos - lectura" ON precios_escalonados
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'precios_escalonados' AND policyname = 'Precios escalonados admin - escritura') THEN
        CREATE POLICY "Precios escalonados admin - escritura" ON precios_escalonados
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
    
    RAISE NOTICE 'Políticas RLS aplicadas correctamente';
END $$;

-- 4. Verificar que las políticas se aplicaron
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('leads', 'cotizaciones', 'items_cotizacion', 'eventos')
ORDER BY tablename, policyname;
