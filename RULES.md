# .cursorrules (v2) — Reglas para el Cotizador FullColor (Next.js + Supabase)

> **Objetivo:** que Cursor modifique el código sin romper la app y respetando las decisiones del proyecto.

## 0) No negociables
- Mantener **Next.js 15 + React 19 + TypeScript + Tailwind CSS v4**. No migrar a Vite ni cambiar de router.
- **Supabase es la ÚNICA fuente de verdad**. Prohibido hardcodear productos/precios o duplicar datos fuera de BD.
- Respetar nombres de archivos/rutas/props existentes. Cambios solo con justificación y documentados.

## 1) Organización del código
- Usar/crear **servicios** en `src/lib` o `src/services`:
  - `supabaseClient` (cliente) y helper para server/edge si aplica.
  - `pricing.ts` (selección de escala y cálculos).
  - `quotes.ts` (crear cotización/ítems, invocar Edge Functions PDF/Email, registrar eventos/leads).
- Reutilizar componentes UI existentes (shadcn/ui + Tailwind). No reestilizar toda la app.

## 2) Datos y acceso
- Tablas base (ajustar a BD real): `productos`, `precios_escalonados`, `leads`, `cotizaciones`, `items_cotizacion`, `eventos`.
- **RLS** activas. Lectura pública solo del catálogo si el negocio lo permite; escrituras via server/edge.
- **Tipos monetarios**: `numeric(12,4)` para montos.
- **Índices/uniques** recomendados: `precios_escalonados (producto_id, cantidad_min) UNIQUE`.
- **ENV**:
  - Cliente (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Server/Edge (Vercel/Supabase): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_*`.
- Incluir `/.env.example` (sin secretos) con todas las variables esperadas.

## 3) Precios escalonados
- Regla: elegir **la mayor escala** con `cantidad_min ≤ cantidad`.
- No bloquear el input si es menor al mínimo; mostrar aviso suave (UI/sonner). Validación con debounce/onBlur.
- Mostrar **todas** las escalas vigentes para transparencia.
- Implementar funciones puras en `pricing.ts` (idealmente con tests ligeros).

## 4) PDF y email (Edge Functions)
- **`generate-quote-pdf`**:
  - Input: `cotizacion_id` (o datos mínimos).
  - Render HTML usando **`cotizacion.html`** (plantilla del repo).
  - Genera PDF, sube a **Supabase Storage** y actualiza `cotizaciones.pdf_url`.
  - Registrar `eventos: pdf_generado` (metadata con tiempos, tamaño, etc.).
- **`send-quote-email`** (opcional):
  - Enviar email con adjunto o link a `pdf_url`.
  - Registrar `eventos: email_enviado`.
- Llamar desde server/edge si requiere Service Role. Jamás exponer Service Role Key al cliente.

## 5) WhatsApp
- Botón que arma mensaje prellenado con **resumen + ID/URL** de la cotización (`pdf_url` o página de confirmación).
- Registrar `eventos: whatsapp_share`.

## 6) CRUD mínimo (admin)
- Crear/editar **productos** y **escalas**.
- Confirmar que cambios se reflejan en cálculo de precios (invalida caches si existen).

## 7) Errores, toasts y DX
- Manejo de errores amable (sonner). Sin spam de toasts. Mensajes claros.
- Logs sólo en dev; no imprimir secretos.
- En SSR/RSC, usar fallbacks simples para no romper el render.

## 8) Calidad y estilo
- **KISS / SoC / DRY pragmático**. Funciones pequeñas, nombres claros, early‑returns.
- Comentarios breves que expliquen el **porqué**. JSDoc en utilidades públicas.
- No añadir dependencias pesadas sin razón.
- Commits atómicos con **Conventional Commits**.
- PRs pequeños y claros con: **Resumen, Cambios, Cómo Probar, Riesgos, Checklist**.

## 9) Definition of Done (por tarea)
- Precios por tramo calculados correctamente y visibles.
- Validación de mínimo no intrusiva.
- PDF generado con **`cotizacion.html`**, `pdf_url` guardada en BD.
- Email/WhatsApp funcionales con eventos registrados (si aplica).
- Persistencia correcta (leads, cotizaciones, items, eventos).
- Build de Next OK; UI intacta; sin secretos en cliente.

## 10) Lo que NO debe hacer Cursor
- No migrar de Next.js ni cambiar el router.
- No hardcodear productos/precios ni duplicar datos fuera de Supabase.
- No reescribir estilos base ni tipografías globales.
- No crear APIs/abstracciones innecesarias o genéricas si no aportan.

---

## Apéndice — Checklist de entorno
- `.env.local` (cliente): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Server/Edge (Vercel/Supabase): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_*`.
- `/.env.example` con placeholders de todas las variables.
- `.gitignore` ignora `.env*` locales.
- RLS habilitado y policies revisadas.

## Apéndice — Prompts rápidos
- **Plan de tarea (Copilot CLI):**  
  `gh copilot suggest -t "Lee CONTEXT.md y .cursorrules. Escribe un plan + criterios para 'PDF con cotizacion.html y datos de Supabase'."`
- **Implementación (Cursor):**  
  "Usa CONTEXT.md y .cursorrules (pineados). Implementa la tarea X tal cual el plan. Datos solo desde Supabase. Usa cotizacion.html para el PDF. No cambies nombres de archivos ni rutas. Explica qué tocarás antes de aplicar cambios."
