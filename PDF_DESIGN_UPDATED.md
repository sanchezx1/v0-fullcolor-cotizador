# Diseño del PDF de Cotización - FullColor (Actualizado)

## 📄 Estructura del PDF con Nuevos Campos:

### 1. Header (Encabezado)
```
┌─────────────────────────────────────────────────────────┐
│  🎨 FullColor                                          │
│     Impresión y Productos Personalizados               │
│                                                         │
│  📧 info@fullcolor.com  📞 +593 99 123 4567            │
│  📍 Quito, Ecuador                                      │
└─────────────────────────────────────────────────────────┘
```

### 2. Información de la Cotización
```
┌─────────────────────────────────────────────────────────┐
│  COTIZACIÓN #FC-2025-001                               │
│  Fecha: 15 de Enero, 2025                              │
│  Válida por: 30 días                                   │
│                                                         │
│  CLIENTE:                                               │
│  👤 Juan Pérez / Mi Empresa S.A.                      │
│  🆔 RUC: 1234567890123                                 │
│  📧 juan@empresa.com                                   │
│  📞 +593 98 765 4321                                   │
│  📍 Quito, Ecuador                                      │
│                                                         │
│  MENSAJE:                                               │
│  "Necesito entrega urgente para el evento del 20 de    │
│   febrero. Por favor confirmar disponibilidad."        │
└─────────────────────────────────────────────────────────┘
```

### 3. Tabla de Productos
```
┌─────────────────────────────────────────────────────────┐
│  PRODUCTOS COTIZADOS                                   │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Producto        │ Cant. │ Precio/Unid │ Subtotal   │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ Tarjetas Prem.  │  500  │    $0.18    │   $90.00   │ │
│  │ Carpeta Corp.   │   50  │    $3.00    │  $150.00   │ │
│  │ Banner Roll-Up  │    2  │   $40.00    │   $80.00   │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ SUBTOTAL                           │   $320.00     │ │
│  │ IVA (12%)                          │    $38.40     │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ TOTAL                              │   $358.40     │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 4. Detalles de Precios Escalonados
```
┌─────────────────────────────────────────────────────────┐
│  ESCALAS DE PRECIOS APLICADAS                          │
│                                                         │
│  📋 Tarjetas de Presentación Premium:                  │
│     • 100+ unidades: $0.25 c/u                         │
│     • 500+ unidades: $0.18 c/u ← APLICADO              │
│     • 1000+ unidades: $0.12 c/u                        │
│     • 2500+ unidades: $0.08 c/u                        │
│                                                         │
│  📋 Carpetas Corporativas:                             │
│     • 50+ unidades: $3.00 c/u ← APLICADO                │
│     • 100+ unidades: $2.50 c/u                         │
│     • 250+ unidades: $2.00 c/u                         │
│     • 500+ unidades: $1.50 c/u                         │
└─────────────────────────────────────────────────────────┘
```

### 5. Términos y Condiciones
```
┌─────────────────────────────────────────────────────────┐
│  TÉRMINOS Y CONDICIONES                                │
│                                                         │
│  • Precios válidos por 30 días desde la fecha          │
│  • Tiempo de entrega: 5-7 días hábiles                 │
│  • Pago: 50% anticipado, 50% contra entrega            │
│  • Incluye diseño básico, cambios adicionales tienen   │
│    costo extra                                         │
│  • Los precios no incluyen envío                       │
│                                                         │
│  NOTAS:                                                │
│  Cotización generada automáticamente desde nuestro     │
│  sistema web. Para consultas adicionales contactar    │
│  a info@fullcolor.com                                  │
└─────────────────────────────────────────────────────────┘
```

### 6. Footer (Pie de página)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  🎨 FullColor - Tu socio en impresión                  │
│     y productos personalizados de alta calidad         │
│                                                         │
│  📧 info@fullcolor.com  📞 +593 99 123 4567            │
│  🌐 www.fullcolor.com                                   │
│                                                         │
│  © 2025 FullColor. Todos los derechos reservados.      │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Estructura de Datos para el PDF:

```typescript
interface PDFData {
  cotizacion: {
    id: number
    fecha: string
    validez_dias: number
    estado: string
    total: number
    canal: string
  }
  lead: {
    nombre: string
    email: string
    telefono?: string
    empresa: string
    ruc_cedula?: string
    ciudad?: string
    notas?: string
  }
  items: Array<{
    producto: {
      nombre: string
      categoria: string
    }
    cantidad: number
    precio_unitario_aplicado: number
    subtotal: number
  }>
  escalas: Array<{
    producto_id: number
    producto_nombre: string
    escalas: Array<{
      cantidad_min: number
      precio_unitario: number
      aplicado: boolean
    }>
  }>
  calculos: {
    subtotal: number
    iva: number
    total: number
  }
  configuracion: {
    empresa: {
      nombre: string
      email: string
      telefono: string
      direccion: string
    }
    iva_porcentaje: number
    validez_dias: number
  }
}
```

## 🎨 Elementos de Diseño Actualizados:

### Colores de Marca:
- **Primary**: `#0066a1` (Azul corporativo)
- **Accent**: `#f5c700` (Dorado)
- **Texto**: `#333333` (Gris oscuro)
- **Fondo**: `#ffffff` (Blanco)

### Tipografía:
- **Títulos**: Bold, 16-18px
- **Subtítulos**: Semi-bold, 14px
- **Texto**: Regular, 12px
- **Números**: Monospace, 12px

### Elementos Visuales:
- **Bordes**: Líneas de 1px en color primary
- **Iconos**: Emojis para mejor legibilidad
- **Espaciado**: Márgenes consistentes de 20px
- **Tablas**: Bordes alternados para mejor lectura

## 📊 Campos Actualizados en el PDF:

### Información del Cliente:
- ✅ **Nombre o razón social**
- ✅ **RUC o Cédula** (nuevo campo)
- ✅ **Email**
- ✅ **Teléfono** (opcional)
- ✅ **Ciudad** (nuevo campo)
- ✅ **Mensaje/Notas** (opcional)

### Información de la Cotización:
- ✅ **ID único**: `FC-2025-001`
- ✅ **Fecha de generación**: Fecha actual
- ✅ **Validez**: 30 días (configurable)
- ✅ **Estado**: Pendiente/Enviada/Aprobada

### Productos Cotizados:
- ✅ **Nombre del producto**
- ✅ **Cantidad solicitada**
- ✅ **Precio unitario aplicado**
- ✅ **Subtotal por producto**
- ✅ **Escala de precio aplicada**

### Cálculos Financieros:
- ✅ **Subtotal**: Suma de todos los productos
- ✅ **IVA**: 12% (configurable)
- ✅ **Total final**: Subtotal + IVA

### Escalas de Precios:
- ✅ **Todas las escalas disponibles** para cada producto
- ✅ **Escala aplicada marcada** visualmente
- ✅ **Transparencia total** en precios
