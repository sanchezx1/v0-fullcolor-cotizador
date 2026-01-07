/**
 * Premium Email Templates for FullColor
 *
 * Brand Colors:
 * - Primary Blue: #0066a1
 * - Accent Gold/Yellow: #f5c700
 * - White: #ffffff
 * - Light Gray: #f8f9fa (backgrounds)
 * - Text Gray: #4b5563
 */

// Brand Constants - Using only brand-approved colors
const BRAND = {
  colors: {
    primary: '#0066a1',      // FullColor Blue - main brand color
    accent: '#f5c700',       // Gold/Yellow - accent color
    white: '#ffffff',
    light: '#f8f9fa',        // Light gray for backgrounds
    text: '#374151',         // Dark gray for text (readable in light/dark modes)
    muted: '#6b7280',        // Medium gray for secondary text
    border: '#e5e7eb',       // Light border color
  },
  contact: {
    email: 'fullcolorecuador@yahoo.com',
    whatsapp: '+593 98 870 5311',
    website: 'fullcolor.com.ec',
  },
  logoUrl: 'https://cxhjxponouukrnuxdhyz.supabase.co/storage/v1/object/public/branding/logo-fullcolor.png',
};

// Typography - matches website's Inter font
const font = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/**
 * Header with logo and brand accent
 */
function generateHeader(): string {
  return `
    <!-- Top Accent Bar - Gold -->
    <tr>
      <td style="height: 4px; background-color: ${BRAND.colors.accent};"></td>
    </tr>

    <!-- Header with Logo -->
    <tr>
      <td style="padding: 32px 40px; text-align: center; background-color: ${BRAND.colors.white};">
        <img
          src="${BRAND.logoUrl}"
          alt="FullColor"
          width="180"
          style="display: block; margin: 0 auto; max-width: 180px; height: auto;"
        />
      </td>
    </tr>

    <!-- Blue accent line -->
    <tr>
      <td style="padding: 0 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="height: 2px; background-color: ${BRAND.colors.primary};"></td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/**
 * Footer with contact info
 */
function generateFooter(): string {
  return `
    <!-- Divider -->
    <tr>
      <td style="padding: 0 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="height: 1px; background-color: ${BRAND.colors.border};"></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Contact Info -->
    <tr>
      <td style="padding: 24px 40px; background-color: ${BRAND.colors.white};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0 0 8px 0; font-family: ${font}; font-size: 12px; font-weight: 600; letter-spacing: 1px; color: ${BRAND.colors.primary}; text-transform: uppercase;">
                Contacto
              </p>
              <p style="margin: 0 0 4px 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text};">
                ${BRAND.contact.email}
              </p>
              <p style="margin: 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text};">
                WhatsApp: ${BRAND.contact.whatsapp}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- No Reply Notice -->
    <tr>
      <td style="padding: 16px 40px; background-color: ${BRAND.colors.light};">
        <p style="margin: 0; font-family: ${font}; font-size: 11px; color: ${BRAND.colors.muted}; text-align: center; line-height: 1.5;">
          Este correo es informativo. Por favor no responder a esta direcci&oacute;n.<br/>
          Para consultas: <a href="mailto:${BRAND.contact.email}" style="color: ${BRAND.colors.primary}; text-decoration: none;">${BRAND.contact.email}</a>
        </p>
      </td>
    </tr>

    <!-- Bottom Gold Accent -->
    <tr>
      <td style="height: 4px; background-color: ${BRAND.colors.accent};"></td>
    </tr>

    <!-- Copyright -->
    <tr>
      <td style="padding: 16px 40px; background-color: ${BRAND.colors.light};">
        <p style="margin: 0; font-family: ${font}; font-size: 10px; color: ${BRAND.colors.muted}; text-align: center;">
          &copy; ${new Date().getFullYear()} FullColor Ecuador. Todos los derechos reservados.
        </p>
      </td>
    </tr>
  `;
}

/**
 * Items table - using blue header
 */
function generateItemsTable(items: Array<{
  nombre: string;
  categoria: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}>): string {
  const rows = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid ${BRAND.colors.border}; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text};">
        <strong style="display: block; margin-bottom: 2px;">${item.nombre}</strong>
        <span style="font-size: 12px; color: ${BRAND.colors.muted};">${item.categoria}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid ${BRAND.colors.border}; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text}; text-align: center;">
        ${item.cantidad}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid ${BRAND.colors.border}; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text}; text-align: right;">
        $${item.precioUnitario.toFixed(2)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid ${BRAND.colors.border}; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.primary}; text-align: right; font-weight: 600;">
        $${item.subtotal.toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <thead>
        <tr style="background-color: ${BRAND.colors.primary};">
          <th style="padding: 10px 12px; font-family: ${font}; font-size: 11px; color: ${BRAND.colors.white}; text-align: left; text-transform: uppercase; letter-spacing: 0.5px;">Producto</th>
          <th style="padding: 10px 12px; font-family: ${font}; font-size: 11px; color: ${BRAND.colors.white}; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">Cant.</th>
          <th style="padding: 10px 12px; font-family: ${font}; font-size: 11px; color: ${BRAND.colors.white}; text-align: right; text-transform: uppercase; letter-spacing: 0.5px;">P. Unit.</th>
          <th style="padding: 10px 12px; font-family: ${font}; font-size: 11px; color: ${BRAND.colors.white}; text-align: right; text-transform: uppercase; letter-spacing: 0.5px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/**
 * Totals section
 */
function generateTotals(subtotal: number, iva15: number, total: number): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px;">
      <tr>
        <td style="width: 55%;"></td>
        <td style="width: 45%;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 6px 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.muted};">Subtotal</td>
              <td style="padding: 6px 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text}; text-align: right;">$${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.muted};">IVA (15%)</td>
              <td style="padding: 6px 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text}; text-align: right;">$${iva15.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 8px 0;"><div style="height: 2px; background-color: ${BRAND.colors.primary};"></div></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-family: ${font}; font-size: 16px; color: ${BRAND.colors.primary}; font-weight: 700;">TOTAL</td>
              <td style="padding: 8px 0; font-family: ${font}; font-size: 18px; color: ${BRAND.colors.primary}; text-align: right; font-weight: 700;">$${total.toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

/**
 * CTA Button - Blue primary style
 */
function generateButton(text: string, url: string): string {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin: 24px auto;">
      <tr>
        <td style="background-color: ${BRAND.colors.primary}; border-radius: 4px; padding: 14px 32px;">
          <a href="${url}" style="font-family: ${font}; font-size: 14px; color: ${BRAND.colors.white}; text-decoration: none; font-weight: 600;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

// ============================================================================
// DATA INTERFACES
// ============================================================================
export interface QuoteEmailData {
  cotizacionNumero: string;
  clienteNombre: string;
  clienteEmail: string;
  fecha: string;
  items: Array<{
    nombre: string;
    categoria: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
  subtotal: number;
  iva15: number;
  total: number;
  pdfUrl: string;
  validezDias: number;
}

export interface StatusEmailData extends QuoteEmailData {
  estadoLabel: string;
  statusMessage: string;
}

// ============================================================================
// EMAIL: Quote Created (Customer)
// ============================================================================
export function generateQuoteCreatedEmail(data: QuoteEmailData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Cotizacion ${data.cotizacionNumero} - FullColor</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.colors.light};">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.colors.light}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.colors.white}; max-width: 600px;">

          ${generateHeader()}

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">

              <p style="margin: 0 0 6px 0; font-family: ${font}; font-size: 12px; font-weight: 600; letter-spacing: 1px; color: ${BRAND.colors.primary}; text-transform: uppercase;">
                Cotizacion ${data.cotizacionNumero}
              </p>

              <h1 style="margin: 0 0 20px 0; font-family: ${font}; font-size: 24px; font-weight: 600; color: ${BRAND.colors.text}; line-height: 1.3;">
                Estimado/a ${data.clienteNombre},
              </h1>

              <p style="margin: 0 0 24px 0; font-family: ${font}; font-size: 15px; color: ${BRAND.colors.text}; line-height: 1.6;">
                Gracias por su interes en nuestros servicios. A continuacion encontrara el detalle de su cotizacion personalizada.
              </p>

              <!-- Quote Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.colors.light}; margin-bottom: 24px; border-left: 3px solid ${BRAND.colors.primary};">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 4px 0; font-family: ${font}; font-size: 12px; color: ${BRAND.colors.muted}; text-transform: uppercase;">Fecha</td>
                        <td style="padding: 4px 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text}; text-align: right;">${data.fecha}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-family: ${font}; font-size: 12px; color: ${BRAND.colors.muted}; text-transform: uppercase;">Validez</td>
                        <td style="padding: 4px 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text}; text-align: right;">${data.validezDias} dias</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-family: ${font}; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; color: ${BRAND.colors.muted}; text-transform: uppercase;">
                Detalle de productos
              </p>

              ${generateItemsTable(data.items)}

              ${generateTotals(data.subtotal, data.iva15, data.total)}

              ${generateButton('Descargar Cotizacion PDF', data.pdfUrl)}

              <!-- Note -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; background-color: #fef9e7; border: 1px solid ${BRAND.colors.accent}; border-radius: 4px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-family: ${font}; font-size: 13px; color: ${BRAND.colors.text}; line-height: 1.5;">
                      <strong>Nota:</strong> Esta cotizacion tiene validez de ${data.validezDias} dias. Precios sujetos a disponibilidad.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 28px 0 0 0; font-family: ${font}; font-size: 15px; color: ${BRAND.colors.text}; line-height: 1.6;">
                Para confirmar su pedido o resolver cualquier consulta, no dude en contactarnos.
              </p>

              <p style="margin: 20px 0 0 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.muted};">
                Atentamente,<br/>
                <strong style="color: ${BRAND.colors.text};">El equipo de FullColor</strong>
              </p>

            </td>
          </tr>

          ${generateFooter()}

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

// ============================================================================
// EMAIL: Admin Notification
// ============================================================================
export function generateAdminNotificationEmail(data: QuoteEmailData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Nueva Cotizacion ${data.cotizacionNumero}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.colors.light};">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.colors.light}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.colors.white}; max-width: 600px;">

          <!-- Admin Header - Blue Theme -->
          <tr>
            <td style="height: 4px; background-color: ${BRAND.colors.accent};"></td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: ${BRAND.colors.primary};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-family: ${font}; font-size: 11px; letter-spacing: 1px; color: ${BRAND.colors.accent}; text-transform: uppercase; font-weight: 600;">
                      Nueva Solicitud
                    </p>
                    <h1 style="margin: 0; font-family: ${font}; font-size: 22px; font-weight: 600; color: ${BRAND.colors.white};">
                      Cotizacion ${data.cotizacionNumero}
                    </h1>
                  </td>
                  <td style="text-align: right; vertical-align: middle;">
                    <span style="display: inline-block; padding: 8px 14px; background-color: ${BRAND.colors.accent}; font-family: ${font}; font-size: 16px; font-weight: 700; color: ${BRAND.colors.primary}; border-radius: 4px;">
                      $${data.total.toFixed(2)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">

              <!-- Client Info -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px; border: 1px solid ${BRAND.colors.border}; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px 20px; background-color: ${BRAND.colors.light};">
                    <p style="margin: 0 0 10px 0; font-family: ${font}; font-size: 11px; letter-spacing: 0.5px; color: ${BRAND.colors.muted}; text-transform: uppercase; font-weight: 600;">
                      Informacion del Cliente
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 5px 0; font-family: ${font}; font-size: 12px; color: ${BRAND.colors.muted}; width: 70px;">Nombre</td>
                        <td style="padding: 5px 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text}; font-weight: 600;">${data.clienteNombre}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-family: ${font}; font-size: 12px; color: ${BRAND.colors.muted};">Email</td>
                        <td style="padding: 5px 0; font-family: ${font}; font-size: 14px;">
                          <a href="mailto:${data.clienteEmail}" style="color: ${BRAND.colors.primary}; text-decoration: none;">${data.clienteEmail}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-family: ${font}; font-size: 12px; color: ${BRAND.colors.muted};">Fecha</td>
                        <td style="padding: 5px 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text};">${data.fecha}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-family: ${font}; font-size: 11px; letter-spacing: 0.5px; color: ${BRAND.colors.muted}; text-transform: uppercase; font-weight: 600;">
                Productos Solicitados
              </p>

              ${generateItemsTable(data.items)}

              ${generateTotals(data.subtotal, data.iva15, data.total)}

              ${generateButton('Ver Cotizacion PDF', data.pdfUrl)}

              <p style="margin: 20px 0 0 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.muted}; text-align: center; font-style: italic;">
                Responde al cliente a la brevedad para cerrar la venta.
              </p>

            </td>
          </tr>

          <!-- Admin Footer -->
          <tr>
            <td style="padding: 16px 40px; background-color: ${BRAND.colors.light}; border-top: 1px solid ${BRAND.colors.border};">
              <p style="margin: 0; font-family: ${font}; font-size: 11px; color: ${BRAND.colors.muted}; text-align: center;">
                Notificacion automatica del sistema de cotizaciones FullColor
              </p>
            </td>
          </tr>
          <tr>
            <td style="height: 4px; background-color: ${BRAND.colors.accent};"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

// ============================================================================
// EMAIL: Status Change
// ============================================================================
// Status styles - using brand-appropriate colors
const STATUS_STYLES: Record<string, { color: string; bgColor: string; icon: string }> = {
  en_revision: {
    color: BRAND.colors.primary,   // Blue
    bgColor: '#e0f2fe',            // Light blue
    icon: '&#9679;',               // Circle
  },
  aprobada: {
    color: '#16a34a',              // Green
    bgColor: '#dcfce7',            // Light green
    icon: '&#10003;',              // Checkmark
  },
  rechazada: {
    color: '#dc2626',              // Red
    bgColor: '#fee2e2',            // Light red
    icon: '&#10005;',              // X mark
  },
  vencida: {
    color: '#d97706',              // Orange/Amber
    bgColor: '#fef3c7',            // Light yellow
    icon: '&#9888;',               // Warning
  },
};

export function generateStatusChangeEmail(data: StatusEmailData, statusKey: string): string {
  const statusStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.en_revision;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Actualizacion - ${data.cotizacionNumero}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.colors.light};">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.colors.light}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.colors.white}; max-width: 600px;">

          ${generateHeader()}

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">

              <p style="margin: 0 0 6px 0; font-family: ${font}; font-size: 12px; font-weight: 600; letter-spacing: 1px; color: ${BRAND.colors.primary}; text-transform: uppercase;">
                Actualizacion de Cotizacion
              </p>

              <h1 style="margin: 0 0 24px 0; font-family: ${font}; font-size: 24px; font-weight: 600; color: ${BRAND.colors.text}; line-height: 1.3;">
                Hola ${data.clienteNombre},
              </h1>

              <!-- Status Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px; background-color: ${statusStyle.bgColor}; text-align: center; border-radius: 4px;">
                    <p style="margin: 0 0 6px 0; font-family: ${font}; font-size: 28px; color: ${statusStyle.color};">
                      ${statusStyle.icon}
                    </p>
                    <p style="margin: 0 0 4px 0; font-family: ${font}; font-size: 11px; letter-spacing: 1px; color: ${statusStyle.color}; text-transform: uppercase;">
                      Estado
                    </p>
                    <p style="margin: 0; font-family: ${font}; font-size: 22px; color: ${statusStyle.color}; font-weight: 700;">
                      ${data.estadoLabel}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-family: ${font}; font-size: 15px; color: ${BRAND.colors.text}; line-height: 1.6;">
                ${data.statusMessage}
              </p>

              <!-- Quote Reference -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.colors.light}; margin-bottom: 24px; border-left: 3px solid ${BRAND.colors.primary};">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 4px 0; font-family: ${font}; font-size: 12px; color: ${BRAND.colors.muted}; text-transform: uppercase;">Cotizacion</td>
                        <td style="padding: 4px 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text}; text-align: right; font-weight: 600;">${data.cotizacionNumero}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-family: ${font}; font-size: 12px; color: ${BRAND.colors.muted}; text-transform: uppercase;">Fecha</td>
                        <td style="padding: 4px 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text}; text-align: right;">${data.fecha}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-family: ${font}; font-size: 12px; color: ${BRAND.colors.muted}; text-transform: uppercase;">Total</td>
                        <td style="padding: 4px 0; font-family: ${font}; font-size: 16px; color: ${BRAND.colors.primary}; text-align: right; font-weight: 700;">$${data.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${data.pdfUrl ? generateButton('Ver Cotizacion PDF', data.pdfUrl) : ''}

              <!-- Help -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 28px; border-top: 1px solid ${BRAND.colors.border};">
                <tr>
                  <td style="padding-top: 20px;">
                    <p style="margin: 0 0 6px 0; font-family: ${font}; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; color: ${BRAND.colors.muted}; text-transform: uppercase;">
                      Necesitas ayuda?
                    </p>
                    <p style="margin: 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.text}; line-height: 1.5;">
                      Escribenos a <a href="mailto:${BRAND.contact.email}" style="color: ${BRAND.colors.primary}; text-decoration: none;">${BRAND.contact.email}</a> o contactanos por WhatsApp al <strong>${BRAND.contact.whatsapp}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-family: ${font}; font-size: 14px; color: ${BRAND.colors.muted};">
                Atentamente,<br/>
                <strong style="color: ${BRAND.colors.text};">El equipo de FullColor</strong>
              </p>

            </td>
          </tr>

          ${generateFooter()}

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

// Exports
export const EmailTemplates = {
  generateQuoteCreatedEmail,
  generateAdminNotificationEmail,
  generateStatusChangeEmail,
  BRAND,
};

export default EmailTemplates;
