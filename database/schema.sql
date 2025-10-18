-- FullColor Cotizador Database Schema
-- Ejecutar este script en el SQL Editor de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    unidad VARCHAR(50) NOT NULL DEFAULT 'unidad',
    minimo_pedido INTEGER NOT NULL DEFAULT 1,
    activo BOOLEAN NOT NULL DEFAULT true,
    imagen_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de precios escalonados
CREATE TABLE IF NOT EXISTS precios_escalonados (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad_min INTEGER NOT NULL,
    precio_unitario NUMERIC(12,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(producto_id, cantidad_min)
);

-- Tabla de leads (contactos)
CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    empresa VARCHAR(255),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviada', 'aprobada', 'rechazada')),
    total NUMERIC(12,4) NOT NULL DEFAULT 0,
    validez_dias INTEGER NOT NULL DEFAULT 30,
    pdf_url VARCHAR(500),
    canal VARCHAR(20) NOT NULL DEFAULT 'web' CHECK (canal IN ('web', 'whatsapp', 'email')),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ítems de cotización
CREATE TABLE IF NOT EXISTS items_cotizacion (
    id BIGSERIAL PRIMARY KEY,
    cotizacion_id BIGINT NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
    producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL,
    precio_unitario_aplicado NUMERIC(12,4) NOT NULL,
    subtotal NUMERIC(12,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id BIGSERIAL PRIMARY KEY,
    cotizacion_id BIGINT NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('pdf_generado', 'email_enviado', 'whatsapp_share', 'cotizacion_creada', 'cotizacion_actualizada')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_precios_escalonados_producto_id ON precios_escalonados(producto_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_lead_id ON cotizaciones(lead_id);
CREATE INDEX IF NOT EXISTS idx_items_cotizacion_cotizacion_id ON items_cotizacion(cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_eventos_cotizacion_id ON eventos(cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cotizaciones_updated_at BEFORE UPDATE ON cotizaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
