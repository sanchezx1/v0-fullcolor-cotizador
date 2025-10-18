# Configuración de Supabase - FullColor Cotizador

## Pasos para completar la configuración

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y haz login
2. Haz clic en "New Project"
3. Selecciona tu organización
4. Configura el proyecto:
   - **Name**: `fullcolor-cotizador`
   - **Database Password**: Genera una contraseña segura y guárdala
   - **Region**: `US East (N. Virginia)` o la región más cercana a Ecuador
5. Haz clic en "Create new project"

### 2. Obtener credenciales

Una vez que el proyecto esté listo:

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (la clave pública)
   - **service_role** key (la clave privada - manténla segura)

### 3. Configurar variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto con:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Server/Edge Function Keys (for PDF generation and email)
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
SUPABASE_JWT_SECRET=tu_jwt_secret_aqui

# Email Configuration (for sending quotes)
SMTP_HOST=tu_smtp_host
SMTP_PORT=587
SMTP_USER=tu_smtp_user
SMTP_PASS=tu_smtp_password
EMAIL_FROM=noreply@fullcolor.com

# WhatsApp Configuration
WHATSAPP_NUMBER=593999999999
WHATSAPP_MESSAGE_TEMPLATE=Hola, necesito información sobre la cotización #{QUOTE_ID}

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_COMPANY_NAME=FullColor
NEXT_PUBLIC_COMPANY_EMAIL=info@fullcolor.com
NEXT_PUBLIC_COMPANY_PHONE=+593 99 123 4567
```

**Reemplaza todos los valores `tu_*_aqui` con los valores reales de tu proyecto.**

### 4. Ejecutar scripts SQL

Ve a **SQL Editor** en tu dashboard de Supabase y ejecuta los scripts en este orden:

#### 4.1 Schema (database/schema.sql)
```sql
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
```

#### 4.2 RLS Policies (database/rls_policies.sql)
```sql
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
```

#### 4.3 Seed Data (database/seed.sql)
```sql
-- Datos de ejemplo para FullColor Cotizador
-- Ejecutar después del schema.sql

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, categoria, unidad, minimo_pedido, imagen_url) VALUES
('Tarjetas de Presentación Premium', 'Impresión de alta calidad en papel couché 300g', 'Papelería Corporativa', 'unidad', 100, '/premium-business-cards-stack.jpg'),
('Carpetas Corporativas', 'Carpetas personalizadas con tu logo', 'Papelería Corporativa', 'unidad', 50, '/corporate-folders-presentation.jpg'),
('Banners Roll-Up', 'Banners portátiles para eventos', 'Material Publicitario', 'unidad', 1, '/roll-up-banner-display.jpg'),
('Tazas Personalizadas', 'Tazas cerámicas con impresión full color', 'Merchandising', 'unidad', 24, '/custom-branded-mugs.jpg'),
('Bolígrafos Corporativos', 'Bolígrafos metálicos con grabado láser', 'Merchandising', 'unidad', 50, '/corporate-branded-pens.jpg'),
('Volantes Publicitarios', 'Volantes en papel couché brillante', 'Material Publicitario', 'unidad', 100, '/promotional-flyers-stack.jpg'),
('Hojas Membretadas', 'Papel membretado de alta calidad', 'Papelería Corporativa', 'unidad', 100, '/letterhead-stationery-set.jpg'),
('Libretas Corporativas', 'Libretas con tapa dura personalizadas', 'Merchandising', 'unidad', 50, '/corporate-notebooks-branded.jpg'),
('Afiches Publicitarios', 'Afiches en papel fotográfico', 'Material Publicitario', 'unidad', 10, '/advertising-posters-display.jpg'),
('Sobres Corporativos', 'Sobres personalizados varios tamaños', 'Papelería Corporativa', 'unidad', 100, '/corporate-envelopes-branded.jpg'),
('USB Personalizados', 'Memorias USB con logo grabado', 'Merchandising', 'unidad', 25, '/custom-usb-drives-branded.jpg'),
('Stickers Troquelados', 'Stickers en cualquier forma', 'Material Publicitario', 'unidad', 100, '/die-cut-stickers-custom.jpg');

-- Insertar escalas de precios para Tarjetas de Presentación Premium (ID: 1)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(1, 100, 0.25),
(1, 500, 0.18),
(1, 1000, 0.12),
(1, 2500, 0.08);

-- Insertar escalas de precios para Carpetas Corporativas (ID: 2)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(2, 50, 3.00),
(2, 100, 2.50),
(2, 250, 2.00),
(2, 500, 1.50);

-- Insertar escalas de precios para Banners Roll-Up (ID: 3)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(3, 1, 45.00),
(3, 5, 40.00),
(3, 10, 35.00),
(3, 20, 30.00);

-- Insertar escalas de precios para Tazas Personalizadas (ID: 4)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(4, 24, 7.50),
(4, 48, 6.50),
(4, 96, 5.50),
(4, 144, 4.50);

-- Insertar escalas de precios para Bolígrafos Corporativos (ID: 5)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(5, 50, 1.60),
(5, 100, 1.30),
(5, 250, 1.00),
(5, 500, 0.80);

-- Insertar escalas de precios para Volantes Publicitarios (ID: 6)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(6, 100, 0.35),
(6, 500, 0.25),
(6, 1000, 0.18),
(6, 2500, 0.12);

-- Insertar escalas de precios para Hojas Membretadas (ID: 7)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(7, 100, 0.40),
(7, 500, 0.30),
(7, 1000, 0.22),
(7, 2500, 0.15);

-- Insertar escalas de precios para Libretas Corporativas (ID: 8)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(8, 50, 4.40),
(8, 100, 3.80),
(8, 250, 3.20),
(8, 500, 2.60);

-- Insertar escalas de precios para Afiches Publicitarios (ID: 9)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(9, 10, 5.50),
(9, 50, 4.50),
(9, 100, 3.80),
(9, 250, 3.20);

-- Insertar escalas de precios para Sobres Corporativos (ID: 10)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(10, 100, 0.30),
(10, 500, 0.22),
(10, 1000, 0.18),
(10, 2500, 0.12);

-- Insertar escalas de precios para USB Personalizados (ID: 11)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(11, 25, 14.00),
(11, 50, 12.00),
(11, 100, 10.00),
(11, 250, 8.50);

-- Insertar escalas de precios para Stickers Troquelados (ID: 12)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(12, 100, 0.25),
(12, 500, 0.18),
(12, 1000, 0.15),
(12, 2500, 0.12);
```

### 5. Verificar la conexión

Una vez configurado todo, ejecuta el script de prueba:

```bash
npm run test:supabase
```

Este script verificará:
- ✅ Conexión con Supabase
- ✅ Lectura de productos
- ✅ Lectura de precios escalonados
- ✅ Estructura de datos correcta

### 6. Próximos pasos

Una vez que el script de prueba pase exitosamente, podrás:

1. **Probar la aplicación**: `npm run dev`
2. **Verificar que los productos se cargan** en el catálogo
3. **Probar el cotizador** con los datos de ejemplo
4. **Continuar con la fase 3**: Integración de servicios

## Troubleshooting

### Error: "Variables de entorno no configuradas"
- Verifica que el archivo `.env.local` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo después de cambiar las variables

### Error: "Connection failed"
- Verifica que la URL y las claves de Supabase son correctas
- Asegúrate de que el proyecto esté activo en Supabase

### Error: "Table doesn't exist"
- Verifica que ejecutaste todos los scripts SQL en orden
- Revisa que no hay errores en el SQL Editor de Supabase

### Error: "RLS policy violation"
- Verifica que ejecutaste el script de políticas RLS
- Revisa que las políticas están habilitadas en las tablas