# CONTEXT.md (v2) — Cotizador FullColor

> **Propósito:** Dejar por escrito cómo funciona el cotizador, cuál es el flujo completo y qué decisiones son inamovibles para que Cursor/Copilot trabajen con el mismo entendimiento.

## 1) Qué es y qué hace
Web de **cotización de productos** (impresión / merchandising) para **FullColor** que:
- Muestra catálogo con **precios escalonados por cantidad**.
- Permite armar una cotización (carrito → datos del cliente → confirmación).
- **Genera un PDF** con diseño institucional y tabla de ítems.
- **Comparte** la cotización por **WhatsApp** y **envía por email** 
- **Registra todo en Supabase** (leads, cotizaciones, ítems, eventos, PDF en Storage).

## 2) Stack real del proyecto
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui (Radix), lucide-react.
- **Estado/UI:** react-hook-form, zod, next-themes, sonner, embla, etc.
- **BaaS:** **Supabase** (Postgres + Storage + Edge Functions). Cliente: `@supabase/supabase-js` v2.
- **Infra:** Vercel (deploy del front), Supabase (BD/Edge/Storage), Vercel Analytics (si aplica).

## 3) Única fuente de verdad: **Supabase** ✅
**Todos los datos** que alimentan la app **deben salir de Supabase**: productos, escalas de precio, leads, cotizaciones, ítems, eventos y metadatos del PDF. No se permite hardcodear precios/productos ni duplicar la verdad en el frontend. 

**Implicaciones:**
- El cálculo de precios usa **escalas** persistidas en BD: `(producto_id, cantidad_min, precio_unitario)`.
- El front solo **lee** y **muestra**; cualquier cambio de datos persiste en BD.
- El PDF guarda su archivo en **Storage** y su `pdf_url` queda en `cotizaciones`.
- Reportes (eventos como `pdf_generado`, `email_enviado`, `whatsapp_share`) se registran en BD.

## 4) Lógica de precios escalonados (core)
- Dada una `cantidad`, seleccionar la **mayor escala** con `cantidad_min ≤ cantidad`.
- Si `cantidad` < mínimo del producto: **no** bloquear input; mostrar aviso gentil.
- `subtotal_item = cantidad * precio_unitario_aplicado`.
- `total_cotizacion = Σ subtotales (+ impuestos/envíos si procede)`.
- UX: mostrar **todas** las escalas debajo del precio (transparencia) y validar con **debounce/onBlur**.

## 5) Flujo funcional end‑to‑end
1. **Catálogo / Producto**: Se consulta Supabase para productos + escalas. Al cambiar cantidad, se recalcula el tramo.
2. **Cotizador**: Carrito con ítems y cantidades. Formulario de cliente validado con zod/rhf.
3. **Confirmar**: Se crea **cotización** + **items_cotizacion** en BD.
4. **PDF**: Se llama a **Edge Function** `generate-quote-pdf` → render HTML (usa **`cotizacion.html`** del proyecto) → PDF → subir a **Storage** → guardar `pdf_url` en la cotización → registrar evento `pdf_generado`.
5. **Email (opcional)**: Edge Function `send-quote-email` con adjunto (o link) → registrar `email_enviado`.
6. **WhatsApp**: Construir mensaje prellenado con **resumen + ID/URL** de la cotización → registrar `whatsapp_share`.
7. **Confirmación**: Pantalla con resumen, descarga del PDF y botón WhatsApp.

## 6) Modelo de datos (guía)
- **productos**: id, nombre, unidad, minimo_pedido, activo, timestamps.
- **precios_escalonados**: id, producto_id (FK), cantidad_min, precio_unitario. **Unique** `(producto_id, cantidad_min)`.
- **leads**: id, nombre, email, telefono, origen, timestamps.
- **cotizaciones**: id, lead_id (FK, opcional), total, estado, validez_hasta, canal (web/whatsapp/etc.), pdf_url, timestamps.
- **items_cotizacion**: id, cotizacion_id (FK), producto_id (FK), cantidad, precio_unitario_aplicado, subtotal, timestamps.
- **eventos**: id, cotizacion_id (FK), tipo (`pdf_generado|email_enviado|whatsapp_share|...`), metadata (JSONB), timestamps.

**Tipos monetarios**: `numeric(12,4)` en precios/subtotales/totales.

## 7) Seguridad, RLS y secretos
- **RLS** activas. Policies: lectura pública solo de lo que se considere catálogo; escritura limitada a flujos controlados (server/edge). 
- **Service Role Key** **nunca** en el cliente. Usar Route Handlers/Server Actions o Edge Functions para operaciones privilegiadas.
- Variables de entorno:
  - **Cliente** (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - **Server/Edge** (Vercel/Supabase): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_*`.

## 8) PDF — diseño institucional
- El **diseño** debe provenir de **`cotizacion.html`** (plantilla del repo) + estilos Tailwind/inline si es necesario. No reemplazar la plantilla por otra ni generar PDFs “genéricos”. 
- Datos inyectados desde BD (no mock). 
- El PDF se sube a Storage y se guarda su URL en `cotizaciones`.

## 9) Caching y rendimiento (pragmático)
- Catálogo: **cache del lado del cliente** o `revalidate` corto (p. ej., 300s) si se usan fetchers de Next. 
- Invalida cache si cambian datos críticos (al guardar/editar productos o escalas). 
- Inputs con debounce en cuantías y búsquedas.

## 10) Definition of Done (lista corta)
- Precios escalonados aplicados con la regla correcta y visibles.
- Validación no intrusiva (< mínimo) sin bloquear inputs.
- PDF generado con `cotizacion.html`, subido a Storage, `pdf_url` guardada.
- Email enviado (o preparado) y evento registrado.
- WhatsApp prellenado funcional.
- Persistencia de `leads`, `cotizaciones`, `items`, `eventos`.
- Build de Next.js OK y UI intacta (sin romper estilos/props).
