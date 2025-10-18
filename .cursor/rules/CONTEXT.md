# Contexto del Cotizador FullColor (resumen operativo)

**Qué es:**  
Una web para **cotizar productos** de FullColor con **precios escalonados por cantidad**, que además **genera un PDF** de la cotización, lo **envía por correo**, permite **compartir por WhatsApp** y **registra** todo en base de datos.

**Stack a usar:**  
Front existente (v0). **Backend y base de datos en Supabase** (Postgres, Storage, Edge Functions).

---

## Lo más importante: Precios escalonados

Cada **producto** tiene:  
- un **mínimo de pedido** (ej.: 10 unidades),  
- varias **escalas** de precio (tramos), cada una con `cantidad_min` y `precio_unitario`.  
  - Ej.: 10u → $5.20 | 25u → $4.80 | 50u → $4.30 | 100u → $3.90

**Regla para elegir el precio:**  
- Dada la **cantidad** ingresada, usar el precio de la **escala con mayor `cantidad_min` que sea ≤ cantidad**.  
- Si la cantidad es **menor al mínimo de pedido**, **no bloquear** la escritura: solo **avisar** con un mensaje amable.  
- **Subtotal del ítem** = `cantidad * precio_unitario_aplicado`.  
- **Total de la cotización** = suma de subtotales (más impuestos/envío si se definen).

**Pseudológica:**
```txt
escala = max( escalas where cantidad_min <= cantidad )
if escala existe:
  precio = escala.precio_unitario
  subtotal = cantidad * precio
else:
  precio = null
  subtotal = 0
  avisar: "por debajo del mínimo"
```

**UX esencial:**  
- Mostrar **todas las escalas** disponibles del producto (para transparencia).  
- La validación de mínimo se hace con **debounce/onBlur**; **no** auto-cambiar la cantidad mientras se teclea.  
- Notificaciones **sin spam** (con timeout).

---

## Flujo de cotización

1) Usuario selecciona producto(s) y cantidades → se calcula precio por escalas en tiempo real.  
2) Al confirmar, se crea una **cotización** con **ID** y **estado**.  
3) Se **genera un PDF** (server-side con Edge Function) con el branding de FullColor y la tabla de ítems.  
4) Se **envía un correo** al cliente (si se ingresó) y copia a FullColor con el **PDF adjunto**.  
5) Botón para **WhatsApp**: abre chat con **mensaje prellenado** (resumen + ID/URL de la cotización).  
6) Todo se **registra** en BD: lead (si aplica), cotización, ítems y eventos (pdf generado, email enviado, compartido por WhatsApp).

---

## Datos (Supabase) — sin sobre-especificar

- **productos**: nombre, mínimo de pedido, unidad, activo, etc.  
- **precios_escalonados**: `producto_id`, `cantidad_min`, `precio_unitario` (varios por producto).  
- **leads**: datos de contacto (opcional).  
- **cotizaciones**: lead, estado, total, validez, `pdf_url`, canal, notas.  
- **items_cotizacion**: cotización, producto, cantidad, **precio_unitario_aplicado**, subtotal.  
- **eventos**: cotización, tipo (pdf_generado, email_enviado, whatsapp_share, etc.), metadata.

**Reglas mínimas:**  
- `unique(producto_id, cantidad_min)` en escalas (sin duplicados).  
- Tipos monetarios `numeric(12,4)`.  
- **RLS** activado y políticas seguras.  
- **PDF** guardado en Storage; su URL queda en la cotización.

---

## Definition of Done (corto)

- **Precios escalonados** aplicados correctamente (regla “mayor `cantidad_min` ≤ cantidad”).  
- **Validaciones** sin bloquear la escritura; aviso amable si < mínimo.  
- **PDF** con branding generado en Edge y **URL** guardada.  
- **Email** enviado con PDF adjunto y **evento** registrado.  
- **WhatsApp** con mensaje prellenado (resumen + ID/URL).  
- **BD Supabase** operativa con productos, escalas, leads, cotizaciones, ítems y eventos.  
- Front v0 **intacto**; solo integración.
