# AGENTS.md — Instrucciones para agentes de IA

> Si eres un agente (Codex, Cursor, Copilot, etc.) trabajando en este repositorio, **lee SIEMPRE este archivo completo antes de hacer cambios** y respeta todas las reglas descritas aquí.

---

## 1. Contexto del repositorio

- Proyecto: **cotizador FullColor**  
  Aplicación web para cotizar productos de impresión / merchandising con precios escalonados, generación de PDF, envío por correo/WhatsApp, registro de leads y cotizaciones.
- La documentación funcional y técnica vive en archivos **Markdown dentro de `docs/`** (por ejemplo, planes de features, flujos, notas técnicas).
- Además puede existir uno o varios archivos de **tareas** (por ejemplo `tasks.md` o similares) donde se detalla qué hay que implementar en cada fase.

---

## 2. Principios no negociables

1. **Supabase = única fuente de verdad**
   - Todos los datos de negocio (**productos, precios, leads, cotizaciones, PDFs, etc.**) deben venir de la base de datos del proyecto en Supabase.
   - No se permite:
     - hardcodear listas de productos o precios en el frontend,
     - mantener copias paralelas de datos persistentes fuera de Supabase.
   - Cualquier cambio real de datos se hace a través de Supabase (cliente, server actions, Edge Functions o RPC), respetando siempre RLS.

2. **Documentación del proyecto + documentación técnica externa**

   - Antes de diseñar o implementar cualquier cambio (frontend, backend o Supabase), el agente debe:
     1. Leer este `AGENTS.md`.
     2. Buscar y leer la documentación relevante dentro del repositorio (archivos Markdown en `docs/`, planes de features, notas técnicas, etc.).
     3. Revisar el archivo de tareas (`tasks.md` o similar) que aplique a lo que va a implementar.
   - Cuando haga falta aclarar dudas sobre el stack o buenas prácticas (Next.js, Supabase, shadcn/ui, TypeScript, etc.), el agente debe usar el MCP de **context7** para consultar documentación externa y actualizada de esas tecnologías.
   - No empieces a escribir código sin haber revisado primero la documentación del proyecto en `docs/` y las tareas; usa `context7` solo para complementar con información técnica externa, no para leer los docs del repo.

3. **Soluciones limpias y optimizadas**
   - Prioriza código **claro, mantenible y coherente con el stack**.
   - No rompas la performance de la app:
     - evita renders innecesarios,
     - no dispares consultas redundantes,
     - respeta buenas prácticas de Next.js (App Router, server/client components, caché, etc.).
   - Si introduces una solución compleja, justifica el motivo y deja una nota breve si es relevante.

4. **Este archivo es la instrucción global**
   - Siempre que se te pida “instrucciones” o “reglas” del proyecto:
     - **lee primero este `AGENTS.md`**,
     - luego la documentación en `docs/`,
     - y después los archivos de tareas si los hay.

---

## 3. Uso de MCP

Cuando trabajes como agente con MCP, estas son las reglas:

### 3.1 MCP de Supabase

- Úsalo siempre que necesites:
  - inspeccionar el esquema de la base de datos,
  - revisar o modificar RLS y policies,
  - revisar funciones, vistas o triggers,
  - confirmar nombres de tablas/columnas.
- **No inventes nombres de tablas o campos**: confirma primero con el MCP de Supabase antes de cambiar código que dependa de la BD.
- Cualquier cambio estructural (nuevas tablas, columnas, policies, etc.) debe quedar reflejado en migraciones o en la documentación técnica correspondiente.

### 3.2 MCP de context7

- Usa el MCP de **context7** exclusivamente para consultar **documentación externa y actualizada** sobre:
  - Next.js, React, Tailwind, TypeScript,
  - Supabase (SDK, patrones recomendados, ejemplos oficiales),
  - shadcn/ui y otras librerías del stack,
  - buenas prácticas generales (arquitectura, testing, seguridad, etc.).
- No uses `context7` para leer la documentación interna del proyecto (los archivos en `docs/` o `tasks.md` se leen directamente desde el repo).
- Antes de tomar decisiones de arquitectura o implementar soluciones no triviales:
  - apóyate en `context7` para confirmar que la forma en que lo haces sigue buenas prácticas de las tecnologías que estés usando.
- Si hay conflicto entre lo que “deduces” y lo que dicen las docs oficiales consultadas vía `context7`, sigue las docs oficiales siempre que no contradigan las reglas específicas de este proyecto definidas en `AGENTS.md` y en la documentación interna.


---

## 4. Stack y frontend

- Stack principal:
  - **Next.js 15 (App Router)**,
  - **React 19**,
  - **TypeScript**,
  - **Tailwind CSS v4**.
- UI:
  - **shadcn/ui** (sobre Radix).
  - `lucide-react` para iconos.
  - `sonner` (u otra solución ya presente) para notificaciones.

### Reglas de UI

- Para el frontend, **usa siempre que sea posible los componentes basados en shadcn/ui**, ubicados en `components/ui/`, antes de crear nuevos primitives desde cero.
- Extiende o compone componentes existentes en lugar de duplicar estilos o lógica.
- Cualquier implementación nueva de frontend (componentes, pantallas, ajustes de diseño) debe **mantener la coherencia visual global de la página**:
  - mismos estilos de borde, sombras, radios y estados hover/focus,
  - tipografías y tamaños de texto consistentes,
  - espaciados y layout alineados con el resto de la interfaz.
- Respeta:
  - la paleta de colores institucional de FullColor,
  - la jerarquía visual ya establecida (títulos, subtítulos, texto, botones),
  - los patrones de interacción que la app ya está usando.
- Cuida la accesibilidad:
  - usa etiquetas semánticas (`button`, `nav`, `header`, etc.),
  - añade `aria-*` donde haga falta,
  - no rompas el foco ni la navegación por teclado sin motivo.

---

## 5. Estructura del proyecto (visión general)

Sigue estas reglas al crear o mover código:

- `app/`
  - Rutas, layouts y páginas (cotizador, catálogo, confirmación, “mi cuenta”, admin, etc.).
  - No cambies nombres de rutas sin revisar el impacto.

- `components/`
  - Componentes reutilizables de UI.
  - `components/ui/` contiene los **primitivos y variaciones shadcn/ui**: prioriza su uso.

- `src/services/`
  - Lógica de negocio y acceso a datos (Supabase, APIs externas, etc.).
  - Toda IO (fetch, llamadas a Supabase, Edge Functions) debe estar aquí o en server actions específicas, nunca incrustada directamente en componentes de presentación.

- `src/lib/`
  - Helpers y funciones puras sin efectos secundarios.

- `src/hooks/`
  - Hooks de React que encapsulan lógica de estado/UX.

- `supabase/`
  - Edge Functions, scripts de BD, policies, configuración y utilidades relacionadas con el proyecto en Supabase.

- `docs/`
  - Documentación funcional y técnica del proyecto en formato Markdown (planes de features, flujos, notas, etc.).

Si cambias la estructura de directorios, actualiza imports y, si es relevante, documenta la decisión.

---

## 6. Estilo de código y convenciones

- Convenciones:
  - Indentación de **2 espacios**.
  - Strings con **comillas dobles**.
  - Componentes React en **PascalCase**.
  - Hooks, helpers y servicios en **camelCase**.
  - Nombres de servicios claros (`supabaseClient`, `quotesService`, etc.).
- TypeScript:
  - Mantén tipado estricto.
  - Evita `any`; si lo usas, debe ser justificado con un comentario breve.
- Comentarios:
  - Úsalos para explicar decisiones no triviales, trade-offs o TODOs muy concretos.
  - No describas en texto lo que el código ya deja claro.

---

## 7. Comandos de desarrollo, build y tests

- Instalación inicial:
  - `npm install --legacy-peer-deps`
  - `npx playwright install` (si se usan tests E2E con Playwright).
- Desarrollo:
  - `npm run dev` → entorno de desarrollo.
- Producción:
  - `npm run build && npm start` → build y servidor de producción local.
- Lint:
  - `npm run lint` antes de dar por terminada una tarea o PR.
- Tests (orientativo, según scripts disponibles en `package.json`):
  - Jest: `npm run test`, `npm run test:unit`, `npm run test:integration`.
  - Playwright / E2E: `npm run test:e2e`, `npm run test:e2e:ui`, `npm run test:accessibility`, o similares.
- Al tocar lógica crítica (precios, cotizaciones, auth, Edge Functions), ejecuta al menos:
  - lint,
  - tests relevantes,
  - y verifica que el build no se rompe.

---

## 8. Commits y Pull Requests

- Commits:
  - Usa mensajes claros (idealmente Conventional Commits, por ejemplo `feat: ...`, `fix: ...`, `chore: ...`).
  - Cambios atómicos: no mezcles features grandes con refactors chungos en el mismo commit si puedes evitarlo.
- PRs:
  - Incluye resumen, lista de cambios y pasos básicos para probarlo.
  - Señala riesgos o breaking changes si los hay.
  - Para cambios de UI, añade capturas si es posible.
  - No marques un PR como listo sin haber pasado lint + tests relevantes.

---

## 9. Entorno, secretos y seguridad

- Variables de entorno:
  - Usa `.env.local` (o el archivo que corresponda) para las variables locales; sigue el ejemplo de `.env.example` si existe.
  - En producción (Vercel/Supabase), usa los paneles de configuración de cada servicio para los secretos (no los hardcodes en el código).
- Credenciales:
  - No expongas keys sensibles en el frontend ni en el repo.
  - Si cambias claves o configuración crítica, actualiza la documentación correspondiente.
- Seguridad:
  - Todo lo que afecte a auth, RLS, policies o Edge Functions debe revisarse con cuidado.
  - Usa siempre el MCP de Supabase para inspeccionar policies antes de asumir cómo funciona algo.

---

## 10. Prioridad de fuentes de verdad

Si encuentras información contradictoria entre:

1. Este `AGENTS.md`,
2. La documentación en `docs/`,
3. Archivos de tareas (si los hay),
4. El código existente,

sigue este orden de prioridad:

1. **AGENTS.md** — reglas globales del proyecto.
2. **Documentación en `docs/`** — define cómo se espera que funcione el sistema.
3. **Archivos de tareas** — describen el plan técnico y el orden de implementación.
4. **Código actual** — puede contener deuda técnica o decisiones antiguas.

Si es necesario, propone cambios que unifiquen criterios y deja la documentación actualizada.

---

_Fin de `AGENTS.md`_
