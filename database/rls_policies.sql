-- Row Level Security (RLS) Policies for FullColor Cotizador
-- Ejecutar después del schema.sql

-- Habilitar RLS en todas las tablas
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE precios_escalonados ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_cotizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Políticas para PRODUCTOS
-- Permitir lectura pública de productos activos
CREATE POLICY "Productos públicos - lectura" ON productos
    FOR SELECT USING (activo = true);

-- Permitir lectura de todos los productos para usuarios autenticados (admin)
CREATE POLICY "Productos admin - lectura completa" ON productos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserción/actualización solo para service_role (admin)
CREATE POLICY "Productos admin - escritura" ON productos
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para PRECIOS ESCALONADOS
-- Permitir lectura pública de precios escalonados
CREATE POLICY "Precios escalonados públicos - lectura" ON precios_escalonados
    FOR SELECT USING (true);

-- Permitir inserción/actualización solo para service_role (admin)
CREATE POLICY "Precios escalonados admin - escritura" ON precios_escalonados
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para LEADS
-- Permitir inserción de nuevos leads (usuarios no autenticados pueden crear leads)
CREATE POLICY "Leads - inserción pública" ON leads
    FOR INSERT WITH CHECK (true);

-- Permitir lectura/actualización solo para service_role (admin)
CREATE POLICY "Leads admin - lectura y escritura" ON leads
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para COTIZACIONES
-- Permitir inserción de nuevas cotizaciones (usuarios no autenticados pueden crear cotizaciones)
CREATE POLICY "Cotizaciones - inserción pública" ON cotizaciones
    FOR INSERT WITH CHECK (true);

-- Permitir lectura/actualización solo para service_role (admin)
CREATE POLICY "Cotizaciones admin - lectura y escritura" ON cotizaciones
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para ITEMS COTIZACIÓN
-- Permitir inserción de ítems de cotización
CREATE POLICY "Items cotización - inserción pública" ON items_cotizacion
    FOR INSERT WITH CHECK (true);

-- Permitir lectura/actualización solo para service_role (admin)
CREATE POLICY "Items cotización admin - lectura y escritura" ON items_cotizacion
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para EVENTOS
-- Permitir inserción de eventos
CREATE POLICY "Eventos - inserción pública" ON eventos
    FOR INSERT WITH CHECK (true);

-- Permitir lectura/actualización solo para service_role (admin)
CREATE POLICY "Eventos admin - lectura y escritura" ON eventos
    FOR ALL USING (auth.role() = 'service_role');

-- Crear función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- En este caso, solo permitimos acceso completo al service_role
    -- En un entorno real, podrías verificar roles específicos o claims del JWT
    RETURN auth.role() = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
