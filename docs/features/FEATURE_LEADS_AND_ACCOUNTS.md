# FEATURE_LEADS_AND_ACCOUNTS.md  
_Nueva experiencia de leads, cuentas de usuario y recordatorios de cotizaciones_

## 1. Contexto

El cotizador de FullColor actualmente permite cotizar **sin login ni registro**, priorizando un flujo rápido: el usuario elige productos, llena sus datos y recibe la cotización por correo.

Problemas actuales:

- Los datos de los leads se reutilizan de forma poco controlada.
- Se pueden mostrar o actualizar datos sensibles solo con ingresar un correo.
- No existe un espacio claro para que el cliente vea sus cotizaciones anteriores ni su información de facturación.
- No hay un sistema estructurado de correos que acompañe los cambios de estado de las cotizaciones.

Este feature busca **mantener la cotización rápida como invitado**, pero añadir:

- Cuentas de usuario (“Mi cuenta”) para clientes que cotizan recurrentemente.
- Un flujo más seguro para el manejo de leads y datos personales.
- Recordatorios y notificaciones por correo cuando cambia el estado de una cotización.
- Un comportamiento claro y diferenciado para clientes normales y administradores.

---

## 2. Principios generales

- **Base de datos como única fuente de verdad**  
  Toda la información de leads, cuentas de usuario y cotizaciones debe venir de la base de datos del proyecto (actualmente Supabase).  
  No se deben duplicar datos de negocio en el frontend ni mantener versiones paralelas.

- **Seguridad sin fricción**  
  - Primera cotización: el usuario puede cotizar como invitado sin necesidad de crear cuenta.  
  - La información sensible de un lead nunca se muestra solo por escribir un correo.  
  - Acciones más avanzadas (historial, datos de facturación, etc.) se reservan para usuarios autenticados.

- **Registro progresivo**  
  - No se fuerza a registrarse desde el inicio.  
  - Tras varias cotizaciones o al detectar un correo recurrente, se ofrece de forma clara crear una cuenta y vincular las cotizaciones existentes.  
  - El registro se presenta como un beneficio: ahorrar tiempo, reutilizar datos, ver historial y estados.

- **Roles claros**  
  - **Usuario normal**: tiene acceso al panel “Mi cuenta”, donde gestiona sus datos y ve sus cotizaciones.  
  - **Administrador**: utiliza el panel de administración para gestionar leads, cotizaciones y estados. Si un admin hace clic en “Mi cuenta”, debe ser redirigido al dashboard de administración.

- **Coherencia visual y de experiencia**  
  - El botón “Mi cuenta” debe ser un elemento estable de la interfaz.  
  - Los nuevos modales y pantallas deben respetar el estilo visual de FullColor y del cotizador actual.  
  - Se prioriza un lenguaje claro, con mensajes cortos que expliquen qué pasa y qué gana el usuario con cada acción.

---

## 3. Alcance del feature

Este feature agrupa tres grandes bloques funcionales:

1. **Gestión de leads y cuentas de usuario**
   - Mantener la experiencia de cotización rápida como invitado.
   - Introducir un sistema de cuentas de usuario que se vinculen a los leads existentes.
   - Ofrecer un flujo de registro suave cuando se detecta un correo que ya ha cotizado.

2. **Panel “Mi cuenta” para clientes**
   - Permitir a los usuarios autenticados ver sus cotizaciones, su estado y detalles básicos.
   - Ofrecer un lugar claro para gestionar datos de contacto y, más adelante, datos de facturación.

3. **Recordatorios y notificaciones por correo**
   - Enviar correos relevantes cuando cambie el estado de una cotización (por ejemplo, en revisión, aprobada, rechazada o vencida).
   - Mantener informado al cliente sin obligarlo a revisar manualmente el panel.

Los detalles técnicos y la implementación concreta de cada bloque se definirán en los archivos de tareas (`FEATURE_LEADS_AND_ACCOUNTS.tasks`) asociados a este feature.

---

## 4. Flujos de usuario

### 4.1. Botón “Mi cuenta”

- El botón **“Mi cuenta”** debe estar visible de forma consistente (por ejemplo, en el header del sitio).
- Si el usuario **no ha iniciado sesión**:
  - Al hacer clic, se muestra una pantalla u opción con:
    - Iniciar sesión.
    - Crear una cuenta.
- Si el usuario es **cliente autenticado**:
  - “Mi cuenta” lleva a un panel donde puede ver sus cotizaciones y datos.
- Si el usuario es **administrador**:
  - “Mi cuenta” lo redirige al panel de administración, no al panel de cliente.

---

### 4.2. Primera cotización (usuario invitado)

1. El usuario entra al cotizador sin login.
2. Elige productos, cantidades y llega al formulario de datos (nombre, correo, etc.).
3. Si el correo **no existe** previamente:
   - Se registra el lead como invitado.
   - Se crea la cotización asociada a ese lead.
   - Se envía la cotización al correo que el usuario indicó (según el flujo actual, mejorado más adelante).

El usuario no necesita crear una cuenta para completar esta primera cotización.

---

### 4.3. Segunda cotización con el mismo correo (registro progresivo)

1. El usuario vuelve a cotizar y escribe un correo que ya existe en el sistema.
2. El sistema detecta que ese correo ya ha sido usado en cotizaciones anteriores.
3. En lugar de mostrar datos previos de forma directa, se muestra un **modal o mensaje** que dice, por ejemplo:

   - “Ya has cotizado antes con este correo.”  
   - “Puedes crear una cuenta para guardar tus datos y ver tus cotizaciones anteriores.”

4. Se ofrecen dos caminos:
   - **Crear una cuenta y vincular cotizaciones anteriores** (opción recomendada).
   - **Seguir cotizando como invitado** (opción alternativa, manteniendo la simplicidad del flujo actual).

5. Si el usuario elige crear una cuenta:
   - Se crea la cuenta de usuario y se vinculan las cotizaciones y datos que ya tenía con ese correo.
6. Si el usuario elige seguir como invitado:
   - Puede completar la cotización sin ver datos previos que puedan exponer información sensible.

---

### 4.4. Usuario registrado que vuelve a cotizar

1. El usuario inicia sesión.
2. Añade productos al carrito y procede a solicitar una cotización.
3. En lugar de mostrar el formulario completo de datos:
   - Se muestra un resumen indicando que se usarán los datos guardados en su cuenta.
   - Se ofrece un enlace o botón del tipo **“Modificar mis datos”** para cambiar datos de contacto o facturación.
4. La nueva cotización se genera usando la información actualizada de la cuenta del usuario.

Este flujo reduce fricción y evita que el usuario tenga que rellenar sus datos en cada cotización.

---

## 5. Panel “Mi cuenta” (visión funcional)

El panel “Mi cuenta” será el espacio donde el cliente autenticado podrá:

- Ver un **resumen** de su relación con FullColor (por ejemplo, número de cotizaciones efectuadas, estados más recientes, etc.).
- Ver un **listado de cotizaciones**:
  - Código o identificador,
  - Fecha,
  - Estado actual (en revisión, aprobada, rechazada, vencida, etc.).
- Acceder al **detalle de una cotización**:
  - Productos y cantidades.
  - Información básica de la solicitud.
  - Estado y, más adelante, acciones disponibles (por ejemplo, contactar por WhatsApp).
- Gestionar sus **datos de contacto** y, en una etapa posterior, sus datos de facturación.

### Seguridad funcional del panel

- El panel “Mi cuenta” es solo para usuarios autenticados.
- Cada usuario solo puede ver sus propias cotizaciones, no las de otros.
- Los administradores siguen usando el panel de administración para gestionar el sistema completo; no deben usar “Mi cuenta” como si fueran un cliente.

---

## 6. Relación general de datos (visión conceptual)

A nivel conceptual, la información se organiza en tres elementos principales:

- **Leads**  
  Representan los datos de contacto de una persona o empresa que ha solicitado cotizaciones.  
  Un lead puede haber cotizado como invitado y, más adelante, asociarse a una cuenta de usuario.

- **Cuentas de usuario**  
  Representan accesos al sistema con correo y contraseña (u otro método de autenticación).  
  Una cuenta puede estar vinculada a uno o varios leads previos creados con el mismo correo.

- **Cotizaciones**  
  Son las solicitudes de productos y cantidades realizadas desde el cotizador.  
  Cada cotización está asociada a un lead, y cuando existe una cuenta de usuario, también puede estar vinculada a esa cuenta.

Este documento no define nombres de tablas ni columnas; solo describe la lógica general.  
Los nombres concretos y el diseño técnico se manejan en los archivos de tareas y en la documentación técnica correspondiente.

---

## 7. Recordatorios y notificaciones por correo (visión funcional)

El sistema de recordatorios por correo debe:

- Avisar a los clientes cuando sus cotizaciones cambien de estado (por ejemplo, cuando pasen a “en revisión”, “aprobada” o “rechazada/vencida”).
- Mantener una comunicación clara, con mensajes cortos que indiquen:
  - qué cotización cambió,
  - a qué estado,
  - y qué puede hacer el cliente a continuación (por ejemplo, revisar su correo, responder o contactar a FullColor).
- Evitar correos innecesarios o repetitivos para no saturar al usuario.

La elección del proveedor de correo, el formato de las plantillas y los detalles de integración se documentan a nivel técnico en los archivos de tareas y documentación específica, no en este documento.

---

## 8. Implementación por fases (vista general)

La implementación de este feature se organizará en **fases**, con más detalle en el archivo de tareas (`FEATURE_LEADS_AND_ACCOUNTS.tasks`) correspondiente:

- **Fase 0 – Arquitectura / Diseño funcional**  
  Aterrizar el alcance definitivo del feature, revisar este documento y definir el contrato funcional entre leads, cuentas, cotizaciones y correos.

- **Fase 1 – Base de datos y seguridad**  
  Ajustar la estructura de datos y las reglas de acceso para reflejar el nuevo modelo de leads, cuentas y cotizaciones de forma segura.

- **Fase 2 – Lógica de negocio (backend)**  
  Implementar la lógica que conecta el flujo de cotización, la creación de leads, la vinculación con cuentas de usuario y la consulta de cotizaciones.

- **Fase 3 – Interfaz y experiencia de usuario (frontend)**  
  Crear o adaptar las vistas de “Mi cuenta”, los modales de registro progresivo y los mensajes que guían al usuario en los nuevos flujos.

- **Fase 4 – Sistema de correos**  
  Conectar los cambios de estado de las cotizaciones con el envío de correos claros y útiles para el cliente.

- **Fase 5 – Pruebas, QA y documentación final**  
  Probar flujos completos, ajustar detalles de UX, revisar textos y actualizar la documentación de cara a futuro.

Los detalles técnicos de cada fase (tareas concretas, endpoints, consultas, etc.) se mantienen fuera de este archivo y se gestionan en `FEATURE_LEADS_AND_ACCOUNTS.tasks` y en la documentación técnica asociada.

---
