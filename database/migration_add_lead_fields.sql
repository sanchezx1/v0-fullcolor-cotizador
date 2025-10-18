-- Migración: Agregar campos RUC/Cédula y Ciudad a la tabla leads
-- Ejecutar en Supabase SQL Editor

-- Agregar nuevas columnas a la tabla leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS ruc_cedula VARCHAR(20),
ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100);

-- Agregar comentarios para documentar los nuevos campos
COMMENT ON COLUMN leads.ruc_cedula IS 'RUC o número de cédula del cliente';
COMMENT ON COLUMN leads.ciudad IS 'Ciudad de residencia del cliente';

-- Crear índice para búsquedas por RUC/Cédula (opcional)
CREATE INDEX IF NOT EXISTS idx_leads_ruc_cedula ON leads(ruc_cedula);

-- Actualizar políticas RLS si es necesario (las existentes deberían seguir funcionando)
-- Las políticas actuales permiten INSERT público, así que no necesitamos cambios
