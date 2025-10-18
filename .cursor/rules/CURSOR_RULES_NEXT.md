# .cursorrules — Cotizador FullColor (Front **Next.js** + Backend **Supabase**)

> Actualizado: el proyecto **usa Next.js**, no Vite. Estas reglas asumen **Next.js + TypeScript + Tailwind** en el front y **Supabase** para backend/BD/Storage/Edge.

## 0) Inamovible
- Mantener **Next.js** (no migrar de/ni a Vite o otros frameworks).
- Respetar la estructura actual del proyecto (**App Router** si existe `/app`, o **Pages Router** si usa `/pages`). **No** mezclar routers ni reestructurar carpetas principal sin motivo.
- No renombrar props ni romper contratos de componentes existentes.
- Mantener **TypeScript** y **Tailwind** ya configurados.
- Respetar tokens/variables de marca: `--color-primary: #0066a1;` y `--color-accent: #f5c700;`

## 1) Integración mínima y limpia
- Añadir **servicios** en `src/lib/` o `src/services/`:
  - `supabaseClient` (cliente para **browser** y, si aplica, helper de **server**).
  - `pricing` (cálculo de escala).
  - `quotes` (crear cotización + ítems, invocar PDF/email en Edge, registrar leads/eventos).
- Evitar crear API Routes/Server Actions innecesarias. **Preferir** llamar **Edge Functions de Supabase** directo desde el front (cuando seguro) o mediante **Route Handlers**/Server Actions **solo** si se requiere clave de servicio.
- Si se crean nuevas vistas/modales, **usar estilos y componentes existentes** (Tailwind, tipografías, spacing). No reestilizar.

## 2) Datos (Supabase)
- Tablas orientativas (adaptar si ya existen): `productos`, `precios_escalonados`, `leads`, `cotizaciones`, `items_cotizacion`, `eventos`.
- Activar **RLS** y definir **policies** seguras.
- Variables de entorno (Next.js):
  - **Cliente** (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - **Servidor/Edge** (nunca exponer en cliente): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_*` (o proveedor de correo).
- Incluir `/.env.example` con placeholders.

## 3) Lógica de precios escalonados (core)
- Dada `cantidad`, elegir **la mayor escala cuyo `cantidad_min` ≤ cantidad**.
- No forzar el input al mínimo mientras el usuario escribe.
- Validar con **debounce (400–600 ms)** o **onBlur**; si `< mínimo`: mostrar **toast** (con timeout), sin sobrescribir el valor.
- Mostrar **todas** las escalas registradas en una lista/tabla compacta bajo el precio.
- Tipos monetarios en BD: `numeric(12,4)`. Unique en escalas: `(producto_id, cantidad_min)`.

## 4) PDF y correo (Supabase Edge)
- Generar **PDF** en **Supabase Edge Function** (HTML→PDF o lib). Guardar en **Storage** y persistir `pdf_url` en `cotizaciones`. Registrar evento `pdf_generado`.
- Enviar **email** desde otra **Edge Function** con el **PDF adjunto** (o link). Registrar `email_enviado`.
- El front invoca las funciones con fetch/SDK. Si se requiere **Service Role**, hacerlo **solo** desde servidor (Route Handler/Server Action).

## 5) WhatsApp
- Botón “Enviar por WhatsApp”: construir mensaje prellenado con **resumen** e **ID/URL** de cotización. No exponer secretos ni datos sensibles.

## 6) CRUD simple (admin mínimo)
- Vista o modal para **crear/editar** productos y escalas.
- Mantener coherencia visual (paddings, radios, tipografías) del front actual.

## 7) Errores y toasts
- Manejo de errores visible y breve (toasts). No apilar notificaciones; usar timeout y evitar duplicados.
- Logs solo en dev. Nunca imprimir claves/tokens.
- En SSR/RSC, manejar errores sin romper el render (fallbacks simples).

## 8) Calidad, estilo y buenas prácticas (OBLIGATORIO)
- **KISS**: priorizar soluciones **sencillas y claras**. Evitar sobre-ingeniería.
- **DRY pragmático**: reutilizar donde tenga sentido; no abstracciones prematuras.
- **SoC**: UI, estado y datos bien delimitados (servicios/hook/comp).
- **Funciones pequeñas** y **early returns**. Evitar anidación profunda/código espagueti.
- **Nombres claros** y consistentes (verbos en funciones, sustantivos en modelos/DTOs). Sin abreviaturas crípticas.
- **Comentarios útiles** y breves (explican el “por qué”). JSDoc en servicios públicos.
- **Accesibilidad**: labels, roles, focus management, contraste.
- **Rendimiento**: memoizar donde agregue valor; debounce en inputs/búsquedas; evitar renders innecesarios.
- **Seguridad**: secretos en server; validar/escapar entradas en server/edge; RLS revisadas.
- **Dependencias**: añadir solo si aportan; versiones estables; evitar paquetes enormes por utilidades mínimas.
- **Testing ligero** (cuando aplique): utilidades críticas (p. ej., cálculo de escalas).
- **Commits** atómicos y descriptivos; PRs pequeños con notas de cambios/pasos de configuración.

## 9) Definition of Done
- Cálculo de **escalas** correcto y visible (mostrar todas las escalas).
- Inputs fluidos con validaciones amables (sin bloquear la escritura).
- **PDF** con branding generado en Edge y `pdf_url` guardada.
- **Email** con PDF adjunto (o link) enviado y **evento** registrado.
- **WhatsApp** prellenado funcional.
- **CRUD** de productos y escalas usable.
- Persistencia correcta de **leads, cotizaciones, items y eventos**.
- Front **Next.js** intacto (sin roturas de UI/props) y build OK.

## 10) Qué **NO** hacer
- No migrar de Next.js ni cambiar el router del proyecto.
- No reestilizar el sitio ni cambiar tipografías/espaciados base.
- No imponer nombres de tablas si el repo ya trae otros (adaptar mapeos).
- No bloquear inputs por validaciones tempranas.

---

## Addendum obligatorio — Backend y BD en **Supabase**
- **Backend**: implementar **solo** con Supabase (Postgres, Auth, Storage, Edge Functions).
- **Edge Functions**: `generate-quote-pdf` (render + Storage + evento) y `send-quote-email` (envío + evento).
- **BD**: RLS activado y policies seguras; `unique(producto_id, cantidad_min)` en escalas; `numeric(12,4)` para montos.
- **Storage**: guardar PDF y referenciar `pdf_url` en `cotizaciones`.
- **ENV**:
  - **Cliente**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - **Servidor/Edge**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_*`.
  - **Nunca** exponer claves de servicio en el cliente.
