# tasks-auth-accounts-emails.md
Plan técnico por fases para leads, cuentas de usuario y recordatorios por correo

> IMPORTANTE (para cualquier agente):
> - Antes de tocar código o ejecutar cualquier tarea, lee `AGENTS.md`.
> - **Antes de implementar NINGUNA tarea, debes leer y entender por completo `docs/FEATURE_LEADS_AND_ACCOUNTS.md`.**  
>   Si tienes dudas sobre el flujo o el alcance, vuelve SIEMPRE a ese archivo.
> - Trabaja SIEMPRE en una sola fase/tarea a la vez.
> - Usa el MCP de **Supabase** para todo lo relacionado con la base de datos.
> - Usa el MCP de **context7** solo para consultar documentación EXTERNA ACTUALIZADA (Next.js, Supabase, shadcn/ui, buenas prácticas, etc.)

---

## Fase 0 - Arquitectura / Diseño funcional (Agente Arquitectura)

Objetivo: dejar claro el modelo y los flujos antes de tocar DB o código.

- [x] Leer este archivo de tareas completo.
- [x] Leer el documento funcional de este feature en `docs/` (por ejemplo `FEATURE_LEADS_AND_ACCOUNTS.md`).
- [x] Si hace falta aclarar dudas de arquitectura o buenas prácticas de tecnologías (Next.js, Supabase, shadcn/ui, etc.), usar el MCP de **context7** para consultar documentación externa y oficial.
- [x] Hacer un resumen corto (5-10 puntos) de:
  - cómo se relacionan leads, cuentas y cotizaciones,
  - qué rol tendrá "Mi cuenta",
  - qué tipo de correos se enviarán.
- [x] Definir, a nivel conceptual (sin SQL todavía):
  - qué datos mínimos necesita un lead,
  - qué datos mínimos necesita una cuenta de usuario,
  - qué necesita una cotización para mostrar bien el estado en "Mi cuenta" y en los correos.
- [x] Documentar las decisiones al final de este archivo (sección **"Notas de arquitectura"**), sin entrar en nombres concretos de tablas/columnas.

> No avanzar a Fase 1 hasta que estos puntos estén claros y escritos.

---

## Fase 1 - Base de datos y seguridad (Agente Supabase / Security)

Objetivo: ajustar el modelo de datos y RLS para soportar leads + cuentas + cotizaciones de forma segura.

- [x] Leer el resumen de Fase 0 en **"Notas de arquitectura"**.
- [x] Usar el MCP de **Supabase** para:
  - inspeccionar tablas actuales de leads, cotizaciones y cualquier tabla relacionada,
  - revisar las RLS/policies actuales.
- [x] Definir qué cambios son necesarios a nivel de estructura, por ejemplo:
  - campo para vincular lead con usuario autenticado (por ejemplo `user_id`),
  - si hace falta una tabla extra para historial de estados de cotización,
  - si hace falta una tabla para logs de emails (opcional).
- [x] Si hay dudas sobre patrones recomendados (por ejemplo, diseño de tablas de historial o logs), usar **context7** para consultar documentación externa de Supabase / Postgres.
- [x] Proponer cambios de RLS a nivel conceptual:
  - qué puede ver/editar un invitado,
  - qué puede ver/editar un usuario autenticado,
  - qué puede ver/editar un admin.
- [x] Aplicar los cambios en Supabase usando el MCP, asegurándose de:
  - no romper flujos actuales,
  - no exponer datos de otros leads/usuarios.
- [x] Dejar un resumen de los cambios de DB y RLS al final de este archivo (sección **"Notas de DB y seguridad"**).

> Fase 1 (DB/RLS) completada.

---

## Fase 2 - Lógica de negocio / Backend (Agente Backend)

Objetivo: implementar la lógica que conecta el flujo de cotización con leads, cuentas y "Mi cuenta".

- [x] Revisar el documento funcional en `docs/` y las **"Notas de DB y seguridad"** de la Fase 1.
- [x] Revisar el código actual relacionado con:
  - creación de cotizaciones,
  - manejo de leads,
  - cualquier RPC o Edge Function ya existente.
- [x] Si hace falta confirmar buenas prácticas de diseño de APIs (por ejemplo, uso de server actions, Edge Functions, patrones de RPC en Supabase), usar **context7** para consultar documentación externa de Next.js / Supabase.
- [x] Diseñar y/o ajustar la lógica de:
  - primera cotización como invitado (crear lead + cotización),
  - detección de "correo ya usado" sin exponer datos sensibles,
  - vinculación de leads existentes con una cuenta de usuario cuando el usuario decide registrarse.
- [x] Implementar deduplicación de leads por email en backend:
  - reusar lead con `user_id IS NULL` si ya existe,
  - al registrar cuenta con ese correo, actualizar ese lead a `user_id = auth.uid()` tomando el más reciente como principal y dejando los otros históricos.
- [x] Implementar o actualizar las funciones necesarias (RPC/Edge Functions/server actions), por ejemplo:
  - crear cotización a partir de la info del formulario o de la cuenta del usuario,
  - obtener listado de cotizaciones de un usuario autenticado,
  - obtener detalle de una cotización (solo si pertenece al usuario o si es admin),
  - actualizar datos de contacto/facturación del usuario autenticado.
- [x] Asegurarse de que todas las funciones respetan las RLS definidas en la Fase 1.
- [x] Añadir notas breves sobre las nuevas funciones/endpoints en la sección **"Notas de backend"** al final de este archivo.

---

## Fase 3 – Interfaz y experiencia de usuario (Agente Frontend)

Objetivo: crear/adaptar las pantallas y componentes para “Mi cuenta” y los nuevos flujos de cotización.

- [ ] Revisar el documento funcional en `docs/` para entender los flujos de usuario (Mi cuenta, invitado, registro progresivo, etc.).
- [ ] Si hay dudas de buenas prácticas de UI/UX con shadcn/ui, Next.js o patrones de diseño, usar **context7** para consultar documentación externa de esas librerías/tecnologías.
- [ ] Añadir el botón **“Mi cuenta”** en la interfaz:
  - coherente con el diseño actual,
  - visible en el header u otra zona estable,
  - con comportamiento distinto según estado (no autenticado / cliente / admin).
- [ ] Implementar la pantalla de **“Mi cuenta”** para usuarios autenticados:
  - listado de cotizaciones,
  - vista de detalle de una cotización,
  - sección de datos de contacto (y espacio previsto para facturación futura).
- [ ] Ajustar el flujo de cotización para:
  - usuarios invitados (formulario completo),
  - usuarios autenticados (usar datos guardados + opción “Modificar mis datos”).
- [ ] Implementar el **modal de registro progresivo** cuando el correo ya exista:
  - texto corto explicando que ya ha cotizado antes,
  - opción recomendada: crear cuenta y vincular cotizaciones,
  - opción alternativa: seguir como invitado.
- [ ] Para todos los componentes y pantallas nuevos:
  - usar componentes de `components/ui` basados en shadcn/ui,
  - mantener coherencia visual global (colores, tipografías, espaciados, bordes, radios, sombras, estados hover/focus),
  - no introducir estilos que rompan la consistencia del diseño existente.

> En esta fase se toca solo UI/UX; no cambiar contratos de backend sin volver a Fase 2.

---

## Fase 4 - Sistema de correos / Recordatorios (Agente Emails)

Objetivo: enviar correos claros y coherentes con los cambios de estado de las cotizaciones.

- [x] Revisar en el repo cualquier código actual relacionado con envío de correos (Edge Functions, servicios, etc.).
- [x] Reutilizar la plantilla base actual de cotizaciones (`generateEmailHTML` + Edge Function `send-email`) y extenderla para tipos de correo (quote_created, quote_status_changed, recordatorios), cambiando asunto y bloque de cuerpo sin romper el diseño actual.
- [x] Definir qué eventos de cambio de estado disparan correos (por ejemplo: en revisión, aprobada, rechazada, vencida), alineado con lo definido en los docs de `docs/`.
- [x] Crear o ajustar la función central (RPC o Edge Function) encargada de:
  - recibir la info mínima (por ejemplo: `id` de cotización + nuevo estado),
  - buscar datos necesarios (correo del cliente, resumen de la cotización),
  - construir el contenido del correo,
  - llamar al proveedor de correo configurado en el proyecto.
- [x] Asegurar que:
  - no se envían correos duplicados por el mismo cambio de estado,
  - se registran errores o logs mínimos en `email_logs` (quote_id?, tipo, estado_envio, error_message?, sendgrid_message_id?) para auditoría.
- [x] Revisar textos de correos:
  - claros,
  - cortos,
  - alineados con el tono de FullColor.

---

## Fase 5 – QA, pruebas y documentación (Agente QA / Docs)

Objetivo: comprobar que el flujo completo funciona bien y dejar documentado el resultado.

- [x] Probar end-to-end los siguientes escenarios (mínimo):
  - usuario invitado que cotiza por primera vez y recibe su correo,
  - usuario que vuelve a cotizar con el mismo correo y ve el modal de registro progresivo,
  - usuario que crea cuenta y luego ve sus cotizaciones en “Mi cuenta”,
  - usuario autenticado que vuelve a cotizar y ya no rellena todo el formulario,
  - administrador que cambia estados de cotización y dispara correos.
- [x] Verificar que:
  - ningún usuario puede ver cotizaciones de otro usuario,
  - los administradores tienen acceso al panel correcto y no usan el panel de cliente,
  - los estados en UI y en correos son coherentes (nombres de estado, mensajes, etc.).
- [x] Ejecutar `npm run lint` y los tests relevantes (unitarios/E2E) si están disponibles, y anotar cualquier fallo importante.
- [x] Actualizar la documentación:
  - añadir un resumen de cómo quedó el flujo final en un documento de `docs/` (por ejemplo, ampliando el feature correspondiente),
  - señalar cualquier decisión o limitación pendiente para futuras iteraciones.
- [x] Dejar en este archivo un breve **“Changelog final”** con los puntos más importantes completados.

---

## Fase 6 – Pruebas de seguridad y hardening COMPLETO

Objetivo: comprobar que nadie puede ver ni hacer cosas que no le corresponden y reforzar los puntos débiles.

- [x] Revisar los diferentes tipos de usuario (sin iniciar sesión, usuario normal, usuario admin) y anotar:
  - qué puede ver cada uno,
  - qué puede crear/editar,
  - a qué pantallas puede entrar.

- [x] Probar accesos sin iniciar sesión:
  - intentar entrar directo, por URL, a páginas que deberían requerir login,
  - verificar que el sistema redirige o bloquea correctamente.

- [x] Probar accesos con usuario normal:
  - intentar entrar a pantallas que deberían ser solo de administrador,
  - comprobar que no se muestran opciones ni datos de administración.

- [x] Probar que no se ven datos de otros usuarios:
  - abrir una cotización propia y luego cambiar manualmente parámetros en la URL o filtros,
  - confirmar que nunca se muestran datos de cotizaciones o leads de otras personas,
  - revisar que los mensajes de error no revelan información interna (detalles técnicos, identificadores raros, etc.).

- [x] Validación básica de datos:
  - probar campos de texto con valores muy largos para ver si el sistema los controla,
  - probar correos con formato inválido y teléfonos con datos absurdos,
  - probar escribir código HTML/JS en campos de texto y verificar que no se “ejecuta” ni se refleja sin escapar.

- [x] Manejo de errores y mensajes al usuario:
  - forzar errores (por ejemplo, desconectando la red o enviando datos incompletos),
  - comprobar que los mensajes al usuario son claros pero no muestran información técnica sensible.

- [x] Revisión de secretos y credenciales:
  - confirmar que claves de servicios externos (correo, APIs, etc.) no están expuestas en el frontend,
  - verificar que solo se usan en el lado del servidor o en la configuración segura.

- [x] Revisión de registros (logs):
  - comprobar que en consola y logs no se guardan datos sensibles (correos completos, teléfonos, contenido privado),
  - si se necesita registrar algo, que sea lo mínimo para depurar.

- [x] Seguridad en los correos:
  - revisar el contenido de los correos que envía el sistema,
  - confirmar que no incluyen enlaces que permitan ver información de otras personas sin autenticación,
  - evitar incluir datos excesivamente sensibles dentro del cuerpo del correo.

- [x] Resumen de hardening:
  - escribir una breve nota final con:
    - qué se probó,
    - qué problemas se encontraron (si hubo),
    - qué se corrigió,
    - qué queda pendiente para futuras mejoras.



### Resumen Fase 6 - Hardening
- Probado: RLS en leads/cotizaciones/items/email_logs revisadas en Supabase; middleware y pantallas de Mi cuenta/admin redirigen segun rol; los endpoints publicos de cotizaciones y PDF requieren `x-quote-token` basado en `gen_random_uuid()`.
- Problema detectado: logs en frontend/servicios exponian correos o ids; se sanitizaron `sendQuoteEmail`, `quote-actions` y `quotes` para usar trazas minimas sin PII.
- Secretos: la clave `SUPABASE_SERVICE_ROLE_KEY` solo se usa en rutas API/Edge (`createSupabaseAdminClient`); no hay claves sensibles en el cliente y solo se exponen `NEXT_PUBLIC_*`.
- Manejo de errores/datos: los formularios mantienen mensajes genericos y React escapa el contenido; sin `dangerouslySetInnerHTML`; RLS bloquea lectura cruzada incluso si se manipula la URL.
- Pendiente: repetir pruebas manuales con inputs extremos/desconexion y revalidar E2E cuando los fixtures de productos esten estabilizados.

## Notas de arquitectura

- Relación base: cada cotización se liga a un lead; si se crea una cuenta con ese correo, el lead invitado se actualiza con `user_id` y las cotizaciones existentes quedan visibles en "Mi cuenta".
- Lead invitado: primera cotización crea lead con correo + `user_id = NULL` y se reutiliza en cotizaciones posteriores con el mismo correo. Si el usuario se registra, se busca el lead con `user_id = NULL`, se actualiza con `auth.uid()` y no se genera un lead nuevo.
- Lead activo por correo: si existen múltiples leads históricos con el mismo correo, se elige el más reciente como principal para vincularlo a la cuenta y para futuras cotizaciones; los demás quedan solo como histórico. Si el usuario cambia su correo desde "Mi cuenta", se actualiza el lead principal en lugar de crear otro.
- Usuarios autenticados: nuevas cotizaciones usan los datos actuales de la cuenta (con opción “Modificar mis datos”), manteniendo la referencia al lead vinculado y al `user_id`.
- "Mi cuenta": botón estable; clientes autenticados ven listado/detalle de sus cotizaciones y administran datos de contacto/facturación futura. Administradores que hagan clic son redirigidos al dashboard de admin, no al panel de cliente.
- Datos mínimos: lead necesita nombre, correo, teléfono opcional y contexto/origen; cuenta requiere identificador de autenticación más datos de contacto y espacio para facturación; cotización debe guardar referencias a lead/cuenta según aplique, resumen de productos, timestamps y estado visible.
- Seguridad: nunca mostrar datos previos solo por ingresar un correo; cada usuario autenticado solo ve sus cotizaciones y los administradores operan desde su panel.
- Correos: todas las notificaciones de cotizaciones/estados se envían mediante una función central (`send-email` sobre SendGrid) reutilizando la plantilla HTML existente (`generateEmailHTML`) como base visual (header, colores, CTA); se debe extenderla para admitir tipos de correo/estados distintos sin romper la versión actual.
- Logging: se creará una tabla simple `email_logs` con campos `id`, `quote_id` opcional, `to_email`, `tipo_correo`, `estado_envio`, `error_message` opcional, `sendgrid_message_id` opcional y `created_at` para auditar envíos/errores sin lógica extra.

---

## Notas de DB y seguridad

- Estructura: se añadió `user_id uuid` a `leads` (ref. `auth.users`, ON DELETE SET NULL) y a `cotizaciones` para vincular cotizaciones de usuarios autenticados sin perder la relación con el lead invitado; índices en `leads.user_id`, `leads lower(email)`, `cotizaciones.user_id`.
- Estados: la columna `estado` de `cotizaciones` ahora permite `borrador|pendiente|enviada|en_revision|aprobada|rechazada|vencida` (default `pendiente`).
- Logging de correos: se creó `email_logs(id, quote_id?, to_email, tipo_correo, estado_envio, error_message?, sendgrid_message_id?, created_at)` para auditar envíos/errores de SendGrid.
- RLS leads: además de admin y anon insert, se agregaron políticas para que usuarios autenticados puedan leer/actualizar sus leads (`user_id = auth.uid()`) e insertar leads propios (o sin `user_id`).
- RLS cotizaciones: usuarios autenticados pueden leer cotizaciones vinculadas a su `user_id` o a leads con su `user_id`; pueden insertar cotizaciones si apuntan a un lead propio o sin `user_id`. Admin mantiene control total y anon puede crear (flujo invitado).
- RLS items_cotizacion: usuarios autenticados pueden leer/insertar ítems solo si pertenecen a cotizaciones ligadas a su `user_id` o a leads suyos; admin conserva control y anon puede insertar (flujo invitado).
- RLS email_logs: sólo admins (según `profiles.role = 'admin'`) pueden operar sobre el log; pensado para uso de la función central de correos/SendGrid.
- Nota: la deduplicación por email y la actualización del lead principal al registrar cuenta se implementarán en la lógica de backend (Fase 2), sin más cambios de esquema.

---

## Notas de backend

- RPC `create_public_lead` ahora reutiliza lead por email (prioriza invite `user_id IS NULL`), actualiza `user_id` si el actor autenticado coincide y retorna sólo datos no sensibles (id, email, user_id).
- RPC `create_public_quote` asigna `user_id` en la cotización tomando el del lead o del actor, manteniendo la referencia al lead invitado.
- RPC `link_lead_to_auth_user(p_email)` vincula el lead principal de un email al `auth.uid()` (upgrade de invitado a cuenta, lead histórico permanece solo referencia).
- RPC `check_lead_email_exists(p_email)` permite detectar si el correo ya cotizó sin exponer datos.
- Servicios TS: `crearLead` y `crearCotizacion` actualizados a las nuevas RPC; se añadieron helpers `vincularLeadAUsuarioAutenticado`, `existeLeadParaEmail`, `obtenerCotizacionesDeUsuario` y `obtenerCotizacionDeUsuarioPorId` (para “Mi cuenta”).
- Edge Function `send-email` maneja `quote_created` y `quote_status_changed` con asuntos/mensajes específicos por estado (en revisión, aprobada, rechazada, vencida), evita envíos duplicados con `email_logs` y omite correos cuando el estado es `enviada`.

---

## Changelog final

- Lint (`npm run lint`): sin errores ni advertencias.
- Unit/integration (`npm run test`): 12 suites OK.
- Playwright (`npm run test:e2e -- --project=chromium`): OK tras interceptar dominio completo de Supabase y la API pública de cotizaciones/PDF, usar fixtures con productos activos/stock y agregar `data-testid` al input de cantidad. Los specs ahora añaden producto antes de validar formularios y refinan selectores de totales/headings.
- Accesibilidad/UX: hero con slides inactivos sin foco (tabIndex/aria-hidden/pointer-events), catálogo con aria-label/aria-labelledby en filtros y contraste ajustado, h1 único en landing, quantity input etiquetado para tests.
- Infra: `next.config.mjs` permite imágenes de `via.placeholder.com` usadas en fixtures para evitar errores en dev/e2e.
