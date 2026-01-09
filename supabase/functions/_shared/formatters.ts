/**
 * Funciones centralizadas de formato para Edge Functions (Deno)
 *
 * Este módulo proporciona funciones consistentes para formatear:
 * - Monedas (USD en formato ecuatoriano/español)
 * - Fechas (en varios formatos)
 * - Cantidades numéricas
 *
 * @module formatters
 */

/**
 * Formatea un número como moneda en dólares estadounidenses (USD)
 * usando el formato ecuatoriano/español.
 *
 * @param value - El valor numérico a formatear
 * @param locale - Locale a usar (default: "es-EC")
 * @returns El valor formateado como moneda (ej: "$1.234,56")
 */
export function formatCurrency(value: number, locale: string = "es-EC"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formatea una fecha en formato corto.
 * Formato: "dd/MM/yyyy" (ej: "27/11/2025")
 *
 * @param value - La fecha como string o objeto Date
 * @param locale - Locale a usar (default: "es-EC")
 * @returns La fecha formateada
 */
export function formatDateShort(value: string | Date, locale: string = "es-EC"): string {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Guayaquil",
  }).format(date)
}

/**
 * Formatea una fecha en formato largo.
 * Formato: "dd de MMMM de yyyy" (ej: "27 de noviembre de 2025")
 *
 * @param value - La fecha como string o objeto Date
 * @param locale - Locale a usar (default: "es-ES")
 * @returns La fecha formateada en formato largo
 */
export function formatDateLong(value: string | Date, locale: string = "es-ES"): string {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Guayaquil",
  }).format(date)
}

/**
 * Formatea una fecha con hora.
 * Formato: "dd/MM/yyyy HH:mm" (ej: "27/11/2025 14:30")
 *
 * @param value - La fecha como string o objeto Date
 * @param locale - Locale a usar (default: "es-EC")
 * @returns La fecha y hora formateadas
 */
export function formatDateTime(value: string | Date, locale: string = "es-EC"): string {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Guayaquil",
  }).format(date)
}

/**
 * Formatea un número como cantidad sin decimales.
 * Usa separadores de miles según el formato especificado.
 *
 * @param value - El valor numérico a formatear
 * @param locale - Locale a usar (default: "es-EC")
 * @returns La cantidad formateada (ej: "1.234")
 */
export function formatQuantity(value: number, locale: string = "es-EC"): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
